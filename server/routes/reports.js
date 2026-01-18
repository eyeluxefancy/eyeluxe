import express from 'express';
import { db } from '../firebase.js';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
    try {
        if (!db || typeof db.collection !== 'function') {
            throw new Error("Database not initialized. Please check server logs for Firebase configuration errors.");
        }
        const productsSnapshot = await db.collection('products').get();
        const rentalsSnapshot = await db.collection('rentals').get();
        const billsSnapshot = await db.collection('bills').get();
        const expensesSnapshot = await db.collection('expenses').get();

        const products = productsSnapshot.docs.map(doc => doc.data());
        const rentals = rentalsSnapshot.docs.map(doc => doc.data());
        const bills = billsSnapshot.docs.map(doc => doc.data());
        const expenses = expensesSnapshot.docs.map(doc => doc.data());

        // Total Stock Value
        const totalStockValue = products.reduce((acc, p) => acc + ((p.purchasePrice || 0) * (p.stock || 0)), 0);

        // Today's Sales & Rental Income
        const today = new Date().toISOString().split('T')[0];
        const todayBills = bills.filter(b => b.date.startsWith(today));
        const todaySales = todayBills.reduce((acc, b) => acc + (b.total || 0), 0);

        // Total Expenses
        const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

        // Pending Rental Returns
        const pendingReturns = rentals.filter(r => r.status === 'Rented').length;

        // Expiring Products (within next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const expiringAlerts = products.filter(p => p.expiryDate && new Date(p.expiryDate) < thirtyDaysFromNow).length;

        // Recent Bills
        const recentBills = billsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        res.json({
            totalStockValue,
            todaySales,
            totalExpenses,
            pendingReturns,
            expiringAlerts,
            recentBills,
            today
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/analytics', async (req, res) => {
    try {
        const billsSnapshot = await db.collection('bills').get();
        const expensesSnapshot = await db.collection('expenses').get();
        const productsSnapshot = await db.collection('products').get();

        const bills = billsSnapshot.docs.map(doc => doc.data());
        const expenses = expensesSnapshot.docs.map(doc => doc.data());
        const products = productsSnapshot.docs.map(doc => doc.data());

        // Map of productId -> purchasePrice for profit calc
        const productPriceMap = products.reduce((acc, p) => {
            acc[p.id] = p.purchasePrice || 0;
            return acc;
        }, {});

        // Sales by Date
        const salesByDate = bills.reduce((acc, b) => {
            const date = b.date.split('T')[0];
            acc[date] = (acc[date] || 0) + (b.total || 0);
            return acc;
        }, {});

        // Expenses by Date
        const expensesByDate = expenses.reduce((acc, e) => {
            const date = e.date.split('T')[0];
            acc[date] = (acc[date] || 0) + (e.amount || 0);
            return acc;
        }, {});

        res.json({
            salesChart: Object.entries(salesByDate).map(([date, amount]) => ({ date, amount })),
            expensesChart: Object.entries(expensesByDate).map(([date, amount]) => ({ date, amount })),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
