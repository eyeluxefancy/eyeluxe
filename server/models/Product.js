import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, default: '' },
    stock: { type: Number, default: 0 },
    purchasePrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    expiryDate: { type: String, default: null },
    addedDate: { type: String, default: () => new Date().toISOString() },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
