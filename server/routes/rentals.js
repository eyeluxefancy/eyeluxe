import express from 'express';
import Rental from '../models/Rental.js';

const router = express.Router();

// Same rule as billing: derive the payment split from the actual amounts
// collected rather than a separate method choice, and never allow the
// Cash+UPI amounts to add up to more than what's actually due.
function resolvePayment(due, body) {
    const cashAmount = Math.max(0, Number(body.cashAmount ?? (body.paymentMethod === 'Cash' ? due : 0)) || 0);
    const upiAmount = Math.max(0, Number(body.upiAmount ?? (body.paymentMethod === 'UPI' ? due : 0)) || 0);
    const amountPaid = cashAmount + upiAmount;
    if (amountPaid > due + 0.5) {
        throw new Error(`Amount paid (₹${amountPaid}) exceeds the amount due (₹${due})`);
    }
    const paymentMethod = cashAmount > 0 && upiAmount > 0 ? 'Split' : upiAmount > 0 ? 'UPI' : 'Cash';
    return { cashAmount, upiAmount, paymentMethod };
}

// Get all rentals
router.get('/', async (req, res) => {
    try {
        const rentals = await Rental.find().sort({ createdAt: -1 }).lean();
        res.json(rentals.map(r => ({ ...r, id: r._id.toString() })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a rental (the advance is a refundable deposit on the ornament, not
// revenue — reports.js keeps it out of sales totals).
router.post('/', async (req, res) => {
    try {
        const data = { ...req.body };
        data.status = 'Rented';
        const advance = Number(data.advanceAmount) || 0;
        const payment = resolvePayment(advance, data);
        Object.assign(data, payment);
        const rental = await Rental.create(data);
        res.status(201).json({ ...rental.toObject(), id: rental._id.toString() });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a rental's details (not its return/settlement — see /:id/return)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };
        if (data.advanceAmount !== undefined) {
            const advance = Number(data.advanceAmount) || 0;
            Object.assign(data, resolvePayment(advance, data));
        }
        const updated = await Rental.findByIdAndUpdate(id, data, { new: true }).lean();
        if (!updated) return res.status(404).json({ error: 'Rental not found' });
        res.json({ ...updated, id: updated._id.toString() });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Settle & return a rental: records how the final balance (rentalPrice -
// extraDiscount - advanceAmount) was actually collected on return.
router.put('/:id/return', async (req, res) => {
    try {
        const { id } = req.params;
        const rental = await Rental.findById(id);
        if (!rental) return res.status(404).json({ error: 'Rental not found' });

        const due = Math.max(0, (Number(rental.rentalPrice) || 0) - (Number(rental.extraDiscount) || 0) - (Number(rental.advanceAmount) || 0));
        const payment = resolvePayment(due, req.body);

        rental.status = 'Returned';
        rental.returnedAt = new Date();
        rental.settlementCashAmount = payment.cashAmount;
        rental.settlementUpiAmount = payment.upiAmount;
        await rental.save();

        res.json({ ...rental.toObject(), id: rental._id.toString() });
    } catch (error) {
        res.status(400).json({ error: error.message });
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
