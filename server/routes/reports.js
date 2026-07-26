import express from 'express';
import Product from '../models/Product.js';
import Rental from '../models/Rental.js';
import Bill from '../models/Bill.js';
import Expense from '../models/Expense.js';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
    try {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();

        const [products, rentals, bills, expenses] = await Promise.all([
            Product.find().lean(),
            Rental.find({ status: 'Rented' }).lean(),
            Bill.find({ date: { $gte: startOfYear } }).lean(),
            Expense.find().lean(),
        ]);

        // Total Stock Value
        const totalStockValue = products.reduce((acc, p) => acc + ((p.purchasePrice || 0) * (p.stock || 0)), 0);

        // Sales Calculations
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const getSalesForPeriod = (startDate) =>
            bills.filter(b => new Date(b.date) >= startDate);

        const getSalesAnalytics = (periodBills) =>
            periodBills.reduce((acc, b) => {
                const method = (b.paymentMethod || 'Cash').toUpperCase();
                acc[method] = (acc[method] || 0) + (b.total || 0);
                return acc;
            }, { CASH: 0, UPI: 0 });

        const todayBills = getSalesForPeriod(today);
        const weekBills = getSalesForPeriod(startOfWeek);
        const monthBills = getSalesForPeriod(startOfMonth);
        const yearBills = getSalesForPeriod(new Date(startOfYear));

        const sumTotal = (arr) => arr.reduce((acc, b) => acc + (b.total || 0), 0);

        const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
        const pendingReturns = rentals.filter(r => r.status === 'Rented').length;

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const expiringAlerts = products.filter(p => p.expiryDate && new Date(p.expiryDate) < thirtyDaysFromNow).length;

        res.json({
            totalStockValue,
            todaySales: sumTotal(todayBills),
            weekSales: sumTotal(weekBills),
            monthSales: sumTotal(monthBills),
            yearSales: sumTotal(yearBills),
            totalExpenses,
            pendingReturns,
            expiringAlerts,
            recentBills: [...bills].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
            allBills: { today: todayBills, week: weekBills, month: monthBills, year: yearBills },
            methodTotals: {
                today: getSalesAnalytics(todayBills),
                week: getSalesAnalytics(weekBills),
                month: getSalesAnalytics(monthBills),
                year: getSalesAnalytics(yearBills),
            },
            today: today.toISOString(),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/analytics', async (req, res) => {
    try {
        const [bills, expenses] = await Promise.all([
            Bill.find().lean(),
            Expense.find().lean(),
        ]);

        const salesByDate = bills.reduce((acc, b) => {
            const date = b.date.split('T')[0];
            acc[date] = (acc[date] || 0) + (b.total || 0);
            return acc;
        }, {});

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
