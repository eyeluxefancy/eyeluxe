import express from 'express';
import Rental from '../models/Rental.js';

const router = express.Router();

// Get all rentals
router.get('/', async (req, res) => {
    try {
        const rentals = await Rental.find().sort({ startDate: -1 }).lean();
        res.json(rentals.map(r => ({ ...r, id: r._id.toString() })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a rental
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        data.status = data.status || 'Rented';
        const rental = await Rental.create(data);
        res.status(201).json({ ...rental.toObject(), id: rental._id.toString() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a rental
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Rental.findByIdAndUpdate(id, req.body, { new: true }).lean();
        if (!updated) return res.status(404).json({ error: 'Rental not found' });
        res.json({ ...updated, id: updated._id.toString() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a rental
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Rental.findByIdAndDelete(id);
        res.json({ message: 'Rental deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
