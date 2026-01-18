import express from 'express';
import { db } from '../firebase.js';

const router = express.Router();
const collection = 'expenses';

// Get all expenses
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection(collection).orderBy('date', 'desc').get();
        const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add an expense
router.post('/', async (req, res) => {
    try {
        const expense = req.body;
        expense.date = expense.date || new Date().toISOString();
        const docRef = await db.collection(collection).add(expense);
        res.status(201).json({ id: docRef.id, ...expense });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an expense
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection(collection).doc(id).delete();
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
