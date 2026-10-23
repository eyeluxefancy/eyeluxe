import express from 'express';
import mongoose from 'mongoose';
import Bill from '../models/Bill.js';
import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';

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

            // Normalize each item's unit price into `price` (the field the
            // Bill schema actually stores). The cart sends `sellingPrice`
            // (products) or `rentalPrice` (rentals) — without this, the
            // schema dropped the price on save and reprints showed ₹0.
            billData.items = items.map(item => ({
                id: item.id,
                name: item.name,
                type: item.type || 'product',
                quantity: item.quantity,
                price: Number(item.price ?? item.sellingPrice ?? item.rentalPrice ?? 0),
            }));

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
            // Always use the server's own clock for the official invoice date.
            // A client device's clock/timezone can drift or be misconfigured;
            // the server is the single source of truth for this record.
            billData.date = new Date().toISOString();

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

            // 5. Audit trail: record the stock movement for each product item
            const movements = items
                .filter(item => item.type === 'product')
                .map(item => ({
                    productId: item.id,
                    productName: item.name,
                    type: 'sale',
                    quantity: Math.abs(Number(item.quantity) || 0),
                    invoiceId: bill._id.toString(),
                    invoiceNo: bill.invoiceNo,
                }));
            if (movements.length) {
                await StockMovement.create(movements, { session, ordered: true });
            }

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

// Cancel a sale. Unlike DELETE, this never erases the invoice — it marks
// it Cancelled so the financial/stock history stays intact. Whether stock
// is restored depends on `restoreStock`, an explicit confirmation from the
// person cancelling the sale (did the goods actually come back to the
// shop?) rather than an automatic blind restore.
router.put('/:id/cancel', async (req, res) => {
    const { id } = req.params;
    const restoreStock = !!req.body.restoreStock;
    const reason = (req.body.reason || '').toString().slice(0, 500);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Atomic + conditional: only matches a bill that is NOT already
        // Cancelled. If two cancel requests race (double-click, retry,
        // refresh), only the first one can ever match and restore stock —
        // the second finds nothing to update and reports "already cancelled"
        // instead of restoring stock twice.
        const bill = await Bill.findOneAndUpdate(
            { _id: id, status: { $ne: 'Cancelled' } },
            {
                $set: {
                    status: 'Cancelled',
                    cancelledAt: new Date(),
                    stockRestored: restoreStock,
                    cancelReason: reason,
                },
            },
            { session, new: false } // return the PRE-update doc so we still have its items
        );

        if (!bill) {
            // Either the bill doesn't exist, or it was already cancelled.
            const existing = await Bill.findById(id).session(session).lean();
            await session.abortTransaction();
            session.endSession();
            if (!existing) {
                return res.status(404).json({ error: 'Invoice not found' });
            }
            return res.status(409).json({ error: 'This invoice has already been cancelled', status: existing.status });
        }

        if (restoreStock) {
            const productItems = (bill.items || []).filter(item => item.type === 'product');
            for (const item of productItems) {
                await Product.findByIdAndUpdate(
                    item.id,
                    { $inc: { stock: Math.abs(Number(item.quantity) || 0) } },
                    { session }
                );
            }
            if (productItems.length) {
                await StockMovement.create(
                    productItems.map(item => ({
                        productId: item.id,
                        productName: item.name,
                        type: 'restore',
                        quantity: Math.abs(Number(item.quantity) || 0),
                        invoiceId: bill._id.toString(),
                        invoiceNo: bill.invoiceNo,
                    })),
                    { session, ordered: true }
                );
            }
        }

        await session.commitTransaction();
        session.endSession();

        const updated = await Bill.findById(id).lean();
        res.json({ ...updated, id: updated._id.toString() });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ error: error.message });
    }
});

// Delete a bill — a true, permanent removal with no stock impact. Prefer
// the Cancel endpoint above for normal day-to-day sale cancellations; this
// stays available for correcting a genuine mistake (e.g. a duplicate or
// test entry) where no stock reconciliation is needed either way.
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
