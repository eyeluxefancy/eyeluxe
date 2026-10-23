import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    description: { type: String, default: '' },
    notes: { type: String, default: '' },
    amount: { type: Number, required: true },
    date: { type: String, default: () => new Date().toISOString() },
    category: { type: String, default: '' },
    // Needed for cash-closing reconciliation: only cash-paid expenses
    // reduce the physical cash drawer.
    paymentMethod: { type: String, enum: ['Cash', 'UPI'], default: 'Cash' },
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
