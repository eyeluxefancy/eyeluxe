import express from 'express';
import { db } from '../firebase.js';

const router = express.Router();
const collection = 'rentals';

// Get all rentals
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection(collection).orderBy('startDate', 'desc').get();
        const rentals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(rentals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a rental
router.post('/', async (req, res) => {
    try {
        const rental = req.body;
        rental.status = rental.status || 'Rented';
        const docRef = await db.collection(collection).add(rental);
        res.status(201).json({ id: docRef.id, ...rental });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a rental
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        await db.collection(collection).doc(id).update(updates);
        res.json({ id, ...updates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a rental
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection(collection).doc(id).delete();
        res.json({ message: 'Rental deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
