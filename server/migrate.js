/**
 * migrate.js — One-time migration from Firebase Firestore → MongoDB Atlas
 *
 * Collections migrated: products, bills, rentals, expenses
 * Firebase Auth users are also migrated (email saved, random password set — user must reset)
 *
 * Run: node migrate.js
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Firebase Init ─────────────────────────────────────────────────────────────
const serviceAccount = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'serviceAccountKey.json'), 'utf8')
);
initializeApp({ credential: cert(serviceAccount) });
const firestore = getFirestore();

// ─── MongoDB Models (inline to keep script self-contained) ─────────────────────
const productSchema = new mongoose.Schema({
    name: String, category: String, stock: Number,
    purchasePrice: Number, sellingPrice: Number,
    expiryDate: String, addedDate: String,
}, { timestamps: true });

const rentalSchema = new mongoose.Schema({
    customerName: String, customerPhone: String, itemName: String,
    startDate: String, returnDate: String, amount: Number, status: String,
}, { timestamps: true });

const billItemSchema = new mongoose.Schema({
    id: String, name: String, type: String, quantity: Number, price: Number,
}, { _id: false });

const billSchema = new mongoose.Schema({
    customerName: String, customerPhone: String, invoiceNo: String,
    date: String, items: [billItemSchema], total: Number,
    paymentMethod: String, extraDiscount: Number,
}, { timestamps: true });

const expenseSchema = new mongoose.Schema({
    description: String, amount: Number, date: String, category: String,
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, lowercase: true },
    passwordHash: String,
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
const Rental = mongoose.model('Rental', rentalSchema);
const Bill = mongoose.model('Bill', billSchema);
const Expense = mongoose.model('Expense', expenseSchema);
const User = mongoose.model('User', userSchema);

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fetchCollection = async (name) => {
    const snap = await firestore.collection(name).get();
    return snap.docs.map(doc => ({ _firebaseId: doc.id, ...doc.data() }));
};

const importCollection = async (Model, docs, label) => {
    if (docs.length === 0) {
        console.log(`  ⚠️  ${label}: no documents found in Firestore`);
        return;
    }
    // Remove _firebaseId before inserting (we use MongoDB ObjectId as the new ID)
    const cleaned = docs.map(({ _firebaseId, ...rest }) => rest);
    try {
        const result = await Model.insertMany(cleaned, { ordered: false });
        console.log(`  ✅ ${label}: imported ${result.length} documents`);
    } catch (err) {
        if (err.code === 11000) {
            console.log(`  ⚠️  ${label}: some duplicates skipped (already imported)`);
        } else {
            throw err;
        }
    }
};

// ─── Main ──────────────────────────────────────────────────────────────────────
async function migrate() {
    console.log('\n🚀 Starting Firebase → MongoDB Migration\n');

    // Connect MongoDB
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // ── 1. Products ──────────────────────────────────────────────────────────
    console.log('📦 Migrating products...');
    const products = await fetchCollection('products');
    console.log(`  Found ${products.length} products in Firestore`);
    await importCollection(Product, products, 'Products');

    // ── 2. Rentals ───────────────────────────────────────────────────────────
    console.log('\n🏪 Migrating rentals...');
    const rentals = await fetchCollection('rentals');
    console.log(`  Found ${rentals.length} rentals in Firestore`);
    await importCollection(Rental, rentals, 'Rentals');

    // ── 3. Bills ─────────────────────────────────────────────────────────────
    console.log('\n🧾 Migrating bills...');
    const bills = await fetchCollection('bills');
    console.log(`  Found ${bills.length} bills in Firestore`);
    await importCollection(Bill, bills, 'Bills');

    // ── 4. Expenses ──────────────────────────────────────────────────────────
    console.log('\n💸 Migrating expenses...');
    const expenses = await fetchCollection('expenses');
    console.log(`  Found ${expenses.length} expenses in Firestore`);
    await importCollection(Expense, expenses, 'Expenses');

    // ── 5. Firebase Auth Users ───────────────────────────────────────────────
    console.log('\n👤 Migrating Firebase Auth users...');
    const listUsersResult = await getAuth().listUsers(1000);
    const firebaseUsers = listUsersResult.users;
    console.log(`  Found ${firebaseUsers.length} user(s) in Firebase Auth`);

    for (const fbUser of firebaseUsers) {
        const email = fbUser.email;
        if (!email) continue;
        const existing = await User.findOne({ email });
        if (existing) {
            console.log(`  ⚠️  User ${email} already exists — skipping`);
            continue;
        }
        // Set a temporary password — user will need to reset it
        const tempPassword = 'Eyeluxe2026';
        const passwordHash = await bcrypt.hash(tempPassword, 12);
        await User.create({ email, passwordHash });
        console.log(`  ✅ User migrated: ${email} (temp password: ${tempPassword})`);
    }

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log('\n─────────────────────────────────────');
    const [pc, rc, bc, ec, uc] = await Promise.all([
        Product.countDocuments(),
        Rental.countDocuments(),
        Bill.countDocuments(),
        Expense.countDocuments(),
        User.countDocuments(),
    ]);
    console.log('📊 Final MongoDB document counts:');
    console.log(`  Products : ${pc}`);
    console.log(`  Rentals  : ${rc}`);
    console.log(`  Bills    : ${bc}`);
    console.log(`  Expenses : ${ec}`);
    console.log(`  Users    : ${uc}`);
    console.log('\n✅ Migration complete!\n');

    await mongoose.disconnect();
    process.exit(0);
}

migrate().catch(err => {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
});
