import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ addedDate: -1 }).lean();
        res.json(products.map(p => ({ ...p, id: p._id.toString() })));
    } catch (error) {
        console.error('GET /api/products error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add a product
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        data.addedDate = data.addedDate || new Date().toISOString();
        const product = await Product.create(data);
        res.status(201).json({ ...product.toObject(), id: product._id.toString() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a product
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Product.findByIdAndUpdate(id, req.body, { new: true }).lean();
        if (!updated) return res.status(404).json({ error: 'Product not found' });
        res.json({ ...updated, id: updated._id.toString() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a product
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
