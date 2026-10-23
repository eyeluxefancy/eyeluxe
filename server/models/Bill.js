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
    // paymentMethod is derived from cashAmount/upiAmount ('Cash'|'UPI'|'Split')
    // rather than a separate user choice, so the two can never disagree.
    paymentMethod: { type: String, default: 'Cash' },
    cashAmount: { type: Number, default: 0 },
    upiAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 }, // cashAmount + upiAmount
    balanceDue: { type: Number, default: 0 }, // total - amountPaid; >0 means partial payment
    extraDiscount: { type: Number, default: 0 },
    // A cancelled sale is never hard-deleted: the invoice record and its
    // financial history are preserved, only its status changes. Whether
    // stock was restored depends on whether the goods actually came back
    // to the shop — see POST /:id/cancel.
    status: { type: String, enum: ['Completed', 'Cancelled'], default: 'Completed' },
    cancelledAt: { type: Date, default: null },
    stockRestored: { type: Boolean, default: false },
    cancelReason: { type: String, default: '' },
    // On cancel, the money already collected is assumed refunded in the
    // same Cash/UPI split it was originally received in — this is what
    // the cash-closing reconciliation subtracts back out.
    refundedCashAmount: { type: Number, default: 0 },
    refundedUpiAmount: { type: Number, default: 0 },
    editedAt: { type: Date, default: null },
    // Each entry: { at, reason, before: {items,total,...}, after: {...} }
    editHistory: { type: [mongoose.Schema.Types.Mixed], default: [] },
}, { timestamps: true });

const Bill = mongoose.model('Bill', billSchema);
export default Bill;
