import express from 'express';
import Expense from '../models/Expense.js';

const router = express.Router();

// Get all expenses
router.get('/', async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 }).lean();
        res.json(expenses.map(e => ({ ...e, id: e._id.toString() })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add an expense
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        data.date = data.date || new Date().toISOString();
        const expense = await Expense.create(data);
        res.status(201).json({ ...expense.toObject(), id: expense._id.toString() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an expense
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Expense.findByIdAndDelete(id);
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
