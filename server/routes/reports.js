import express from 'express';
import Product from '../models/Product.js';
import Rental from '../models/Rental.js';
import Bill from '../models/Bill.js';
import Expense from '../models/Expense.js';

const router = express.Router();

// Cloud hosts (Render included) typically run containers in UTC regardless
// of where the shop actually is. Computing "today"/"this week" from the
// SERVER's local clock would silently roll the day boundary over 5.5 hours
// early/late for an India shop. These helpers pin every boundary to IST
// (UTC+5:30, no DST) no matter what timezone the Node process itself is in.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
function istShifted(date = new Date()) {
    return new Date(date.getTime() + IST_OFFSET_MS);
}
// Returns the UTC instant corresponding to IST midnight on the IST
// calendar date that `date` currently falls on.
function istMidnight(date = new Date()) {
    const s = istShifted(date);
    return new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate(), 0, 0, 0) - IST_OFFSET_MS);
}

router.get('/dashboard', async (req, res) => {
    try {
        const istNow = istShifted();
        const startOfYear = new Date(Date.UTC(istNow.getUTCFullYear(), 0, 1) - IST_OFFSET_MS).toISOString();

        // Bills are fetched WITHOUT excluding Cancelled ones here: sales
        // totals must exclude them, but the cash-closing reconciliation
        // still needs cancelled bills' refund amounts for the day they
        // were cancelled, not the day they were originally sold.
        const [products, rentals, allBillsRaw, expenses] = await Promise.all([
            Product.find().lean(),
            Rental.find().lean(),
            Bill.find({ date: { $gte: startOfYear } }).lean(),
            Expense.find({ date: { $gte: startOfYear } }).lean(),
        ]);

        const bills = allBillsRaw.filter(b => b.status !== 'Cancelled');

        // Total Stock Value
        const totalStockValue = products.reduce((acc, p) => acc + ((p.purchasePrice || 0) * (p.stock || 0)), 0);

        // Sales Calculations — all boundaries are IST calendar days.
        const today = istMidnight();

        const startOfWeek = new Date(today.getTime() - istShifted(today).getUTCDay() * 24 * 60 * 60 * 1000);

        const startOfMonth = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), 1) - IST_OFFSET_MS);

        const filterByDate = (arr, dateField, startDate) =>
            arr.filter(item => item[dateField] && new Date(item[dateField]) >= startDate);

        const getSalesForPeriod = (startDate) => bills.filter(b => new Date(b.date) >= startDate);

        const getSalesAnalytics = (periodBills) =>
            periodBills.reduce((acc, b) => {
                const method = (b.paymentMethod || 'Cash').toUpperCase();
                acc[method] = (acc[method] || 0) + (b.total || 0);
                return acc;
            }, { CASH: 0, UPI: 0, SPLIT: 0 });

        const todayBills = getSalesForPeriod(today);
        const weekBills = getSalesForPeriod(startOfWeek);
        const monthBills = getSalesForPeriod(startOfMonth);
        const yearBills = getSalesForPeriod(new Date(startOfYear));

        const sumTotal = (arr) => arr.reduce((acc, b) => acc + (b.total || 0), 0);

        const pendingReturns = rentals.filter(r => r.status === 'Rented').length;

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const expiringAlerts = products.filter(p => p.expiryDate && new Date(p.expiryDate) < thirtyDaysFromNow).length;

        // --- Reconciliation: gross/net/cash/UPI/refunds/expenses, kept
        // separate so a refundable rental deposit is never mistaken for
        // revenue, and a UPI-paid expense never looks like it reduced the
        // physical cash drawer.
        const buildReconciliation = (startDate) => {
            const periodBills = getSalesForPeriod(startDate); // active (non-cancelled) only
            const grossSales = periodBills.reduce((acc, b) => acc + (b.total || 0) + (b.extraDiscount || 0), 0);
            const discounts = periodBills.reduce((acc, b) => acc + (b.extraDiscount || 0), 0);
            const netSales = sumTotal(periodBills);
            const cashReceived = periodBills.reduce((acc, b) => acc + (b.cashAmount || 0), 0);
            const upiReceived = periodBills.reduce((acc, b) => acc + (b.upiAmount || 0), 0);
            const outstandingBalance = periodBills.reduce((acc, b) => acc + (b.balanceDue || 0), 0);

            // Refunds are counted on the day the CANCELLATION happened,
            // not the day of the original sale.
            const cancelledInPeriod = filterByDate(allBillsRaw, 'cancelledAt', startDate).filter(b => b.status === 'Cancelled');
            const refundsCash = cancelledInPeriod.reduce((acc, b) => acc + (b.refundedCashAmount || 0), 0);
            const refundsUpi = cancelledInPeriod.reduce((acc, b) => acc + (b.refundedUpiAmount || 0), 0);

            const periodExpenses = filterByDate(expenses, 'date', startDate);
            const cashExpenses = periodExpenses
                .filter(e => (e.paymentMethod || 'Cash') === 'Cash')
                .reduce((acc, e) => acc + (e.amount || 0), 0);
            const upiExpenses = periodExpenses
                .filter(e => (e.paymentMethod || 'Cash') === 'UPI')
                .reduce((acc, e) => acc + (e.amount || 0), 0);
            const totalExpenses = cashExpenses + upiExpenses;

            const periodRentals = filterByDate(rentals, 'createdAt', startDate);
            const rentalAdvances = periodRentals.reduce((acc, r) => acc + (r.advanceAmount || 0), 0);
            const rentalAdvanceCash = periodRentals.reduce((acc, r) => acc + (r.cashAmount || 0), 0);
            const rentalAdvanceUpi = periodRentals.reduce((acc, r) => acc + (r.upiAmount || 0), 0);
            const settledRentals = filterByDate(rentals, 'returnedAt', startDate);
            const rentalSettlementCash = settledRentals.reduce((acc, r) => acc + (r.settlementCashAmount || 0), 0);
            const rentalSettlementUpi = settledRentals.reduce((acc, r) => acc + (r.settlementUpiAmount || 0), 0);

            // No persisted daily opening float exists yet, so this is the
            // NET cash movement for the period, not an absolute drawer
            // balance — the shop still adds their own opening cash to it.
            const netCashMovement = (cashReceived + rentalAdvanceCash + rentalSettlementCash) - refundsCash - cashExpenses;

            return {
                grossSales, discounts, netSales, outstandingBalance,
                cashReceived, upiReceived,
                refundsCash, refundsUpi,
                cashExpenses, upiExpenses, totalExpenses,
                rentalAdvances, rentalAdvanceCash, rentalAdvanceUpi,
                rentalSettlementCash, rentalSettlementUpi,
                netCashMovement,
            };
        };

        res.json({
            totalStockValue,
            todaySales: sumTotal(todayBills),
            weekSales: sumTotal(weekBills),
            monthSales: sumTotal(monthBills),
            yearSales: sumTotal(yearBills),
            totalExpenses: expenses.reduce((acc, e) => acc + (e.amount || 0), 0),
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
            reconciliation: {
                today: buildReconciliation(today),
                week: buildReconciliation(startOfWeek),
                month: buildReconciliation(startOfMonth),
                year: buildReconciliation(new Date(startOfYear)),
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
            Bill.find({ status: { $ne: 'Cancelled' } }).lean(),
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
