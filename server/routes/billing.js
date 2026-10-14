import express from 'express';
import mongoose from 'mongoose';
import Bill from '../models/Bill.js';
import Product from '../models/Product.js';

const router = express.Router();

// Get all bills
router.get('/', async (req, res) => {
    try {
        const bills = await Bill.find().sort({ date: -1 }).limit(50).lean();
        res.json(bills.map(b => ({ ...b, id: b._id.toString() })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a bill (with stock deduction inside a MongoDB session/transaction)
router.post('/', async (req, res) => {
    const MAX_ATTEMPTS = 5;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const billData = { ...req.body };
            const { items } = billData;

            // 1. Check stock for all product items
            for (const item of items) {
                if (item.type === 'product') {
                    const product = await Product.findById(item.id).session(session);
                    if (!product) throw new Error(`Product ${item.name} not found`);
                    const currentStock = Number(product.stock) || 0;
                    if (currentStock < item.quantity) {
                        throw new Error(`Insufficient stock for ${item.name}`);
                    }
                }
            }

            // 2. Generate invoice number from the HIGHEST existing number
            //    (count-based numbering collides after a bill is deleted)
            const last = await Bill.findOne({ invoiceNo: /^INV-\d+$/ })
                .sort({ invoiceNo: -1 })
                .session(session)
                .lean();
            let next = 1;
            if (last && last.invoiceNo) {
                const n = parseInt(last.invoiceNo.replace(/\D/g, ''), 10);
                if (!Number.isNaN(n)) next = n + 1;
            }
            billData.invoiceNo = `INV-${String(next).padStart(5, '0')}`;
            billData.date = billData.date || new Date().toISOString();

            // 3. Decrement stock for each product item
            for (const item of items) {
                if (item.type === 'product') {
                    await Product.findByIdAndUpdate(
                        item.id,
                        { $inc: { stock: -item.quantity } },
                        { session }
                    );
                }
            }

            // 4. Create the bill
            const [bill] = await Bill.create([billData], { session });

            await session.commitTransaction();
            session.endSession();

            return res.status(201).json({ ...bill.toObject(), id: bill._id.toString() });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            // Duplicate invoice number (race / gap) → recompute and retry
            if (error.code === 11000 && attempt < MAX_ATTEMPTS) continue;

            return res.status(400).json({ error: error.message });
        }
    }
});

// Delete a bill
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Bill.findByIdAndDelete(id);
        res.json({ message: 'Bill deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
