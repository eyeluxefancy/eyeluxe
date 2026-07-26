import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    description: { type: String, default: '' },
    amount: { type: Number, required: true },
    date: { type: String, default: () => new Date().toISOString() },
    category: { type: String, default: '' },
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
