import mongoose from 'mongoose';

// A lightweight audit trail of every stock change tied to a sale, so
// "why did this product's stock change" always has a traceable answer.
const stockMovementSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productName: { type: String, default: '' },
    type: { type: String, enum: ['sale', 'restore', 'adjustment'], required: true },
    quantity: { type: Number, required: true }, // always positive; `type` implies direction
    invoiceId: { type: String, default: null },
    invoiceNo: { type: String, default: '' },
}, { timestamps: true });

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);
export default StockMovement;
