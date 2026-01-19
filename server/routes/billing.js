import express from 'express';
import { db } from '../firebase.js';

const router = express.Router();
const collection = 'bills';

// Get all bills
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection(collection).orderBy('date', 'desc').get();
        const bills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(bills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a bill
router.post('/', async (req, res) => {
    const transaction = db.runTransaction(async (t) => {
        const billData = req.body;
        const { items } = billData;
        const productUpdates = [];

        // 1. ALL READS FIRST: Fetch all products and check stock
        for (const item of items) {
            if (item.type === 'product') {
                const productRef = db.collection('products').doc(item.id);
                const productDoc = await t.get(productRef);

                if (!productDoc.exists) {
                    throw new Error(`Product ${item.name} not found`);
                }

                const currentStock = Number(productDoc.data().stock) || 0;
                if (currentStock < item.quantity) {
                    throw new Error(`Insufficient stock for ${item.name}`);
                }

                productUpdates.push({
                    ref: productRef,
                    newStock: currentStock - item.quantity
                });
            }
        }

        // 2. ADDITIONAL READ: Generate Invoice Number
        const countSnapshot = await db.collection(collection).count().get();
        const invoiceNo = `INV-${String(countSnapshot.data().count + 1).padStart(5, '0')}`;
        billData.invoiceNo = invoiceNo;
        billData.date = billData.date || new Date().toISOString();

        // 3. ALL WRITES AFTER: Perform stock updates and save bill
        for (const update of productUpdates) {
            t.update(update.ref, { stock: update.newStock });
        }

        const billRef = db.collection(collection).doc();
        t.set(billRef, billData);

        return { id: billRef.id, ...billData };
    });

    try {
        const result = await transaction;
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
