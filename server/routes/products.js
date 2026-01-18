import express from 'express';
import { db } from '../firebase.js';

const router = express.Router();
const collection = 'products';

// Get all products
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection(collection).orderBy('addedDate', 'desc').get();
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(products);
    } catch (error) {
        console.error("GET /api/products error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Add a product
router.post('/', async (req, res) => {
    try {
        const product = req.body;
        product.addedDate = product.addedDate || new Date().toISOString();
        const docRef = await db.collection(collection).add(product);
        res.status(201).json({ id: docRef.id, ...product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a product
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

// Delete a product
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection(collection).doc(id).delete();
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
