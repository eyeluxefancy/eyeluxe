import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerPhone: { type: String, default: '' },
    itemName: { type: String, default: '' },
    startDate: { type: String, default: () => new Date().toISOString() },
    returnDate: { type: String, default: null },
    amount: { type: Number, default: 0 },
    status: { type: String, default: 'Rented' },
}, { timestamps: true });

const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;
