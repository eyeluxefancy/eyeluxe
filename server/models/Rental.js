import mongoose from 'mongoose';

// Simplified per the Oct 2026 change request: no Start Date / Expected
// Return Date fields — rentalPrice is a flat agreed price, not computed
// from a day count. Split-payment fields mirror the Bill model so rental
// advances reconcile the same way sales do.
const rentalSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerPhone: { type: String, default: '' },
    ornamentName: { type: String, default: '' },
    rentalPrice: { type: Number, default: 0 },
    extraDiscount: { type: Number, default: 0 },
    // The advance is treated as a refundable deposit, not revenue: it's
    // excluded from sales totals and returned to the customer (minus the
    // settled rental due) on Return — see reports.js reconciliation.
    advanceAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'Cash' },
    cashAmount: { type: Number, default: 0 },
    upiAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['Rented', 'Returned'], default: 'Rented' },
    returnedAt: { type: Date, default: null },
    settlementCashAmount: { type: Number, default: 0 },
    settlementUpiAmount: { type: Number, default: 0 },
}, { timestamps: true });

const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;
