import mongoose from 'mongoose';

const billItemSchema = new mongoose.Schema({
    id: String,
    name: String,
    type: String,
    quantity: Number,
    price: Number,
}, { _id: false });

const billSchema = new mongoose.Schema({
    customerName: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    invoiceNo: { type: String, unique: true },
    date: { type: String, default: () => new Date().toISOString() },
    items: { type: [billItemSchema], default: [] },
    total: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'Cash' },
    extraDiscount: { type: Number, default: 0 },
    // A cancelled sale is never hard-deleted: the invoice record and its
    // financial history are preserved, only its status changes. Whether
    // stock was restored depends on whether the goods actually came back
    // to the shop — see POST /:id/cancel.
    status: { type: String, enum: ['Completed', 'Cancelled'], default: 'Completed' },
    cancelledAt: { type: Date, default: null },
    stockRestored: { type: Boolean, default: false },
    cancelReason: { type: String, default: '' },
}, { timestamps: true });

const Bill = mongoose.model('Bill', billSchema);
export default Bill;
