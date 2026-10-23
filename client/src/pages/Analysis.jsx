import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Calendar, Download, TrendingUp } from 'lucide-react';
import { formatDate } from '../utils/date';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const byDate = (a, b) => new Date(a.date) - new Date(b.date);

export default function Analysis() {
    const [data, setData] = useState({
        salesChart: [],
        expensesChart: []
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get(`${API_URL}/reports/analytics`);
                setData({
                    salesChart: (res.data.salesChart || []).slice().sort(byDate),
                    expensesChart: (res.data.expensesChart || []).slice().sort(byDate),
                });
            } catch (err) {
                console.error(err);
            }
        };
        fetchAnalytics();
    }, []);

    // Real figures computed from live data
    const { grossRevenue, totalCosts, netProfit, margin } = useMemo(() => {
        const grossRevenue = data.salesChart.reduce((sum, s) => sum + Number(s.amount || 0), 0);
        const totalCosts = data.expensesChart.reduce((sum, e) => sum + Number(e.amount || 0), 0);
        const netProfit = grossRevenue - totalCosts;
        const margin = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;
        return { grossRevenue, totalCosts, netProfit, margin };
    }, [data]);

    // Donut geometry (r = 70 -> circumference ≈ 440)
    const circumference = 440;
    const clampedMargin = Math.max(0, Math.min(100, margin));
    const dashOffset = circumference - (circumference * clampedMargin) / 100;

    const exportToCSV = () => {
        const headers = ['Date', 'Type', 'Amount'];
        const salesData = data.salesChart.map(s => [formatDate(s.date), 'Revenue', s.amount]);
        const expenseData = data.expensesChart.map(e => [formatDate(e.date), 'Expense', e.amount]);

        const csvRows = [
            headers.join(','),
            ...salesData.map(row => row.join(',')),
            ...expenseData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvRows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `eyeluxe_analytics_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const fmtDate = (d) => formatDate(d, { day: '2-digit', month: 'short' });

    return (
        <div className="space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-6 lg:p-8 rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight italic uppercase">Profit &amp; Business Analysis</h2>
                    <p className="text-[10px] lg:text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Visual breakdown of performance</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-slate-500">
                        <Calendar className="w-4 h-4 text-primary-500" /> All Time
                    </div>
                    <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2 px-5 lg:px-6 py-3 rounded-2xl border-slate-100 shadow-sm text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all hover:bg-slate-900 hover:text-white">
                        <Download className="w-4 h-4" /> Download Report
                    </button>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="card h-[360px] lg:h-[400px] flex flex-col">
                    <h3 className="text-base lg:text-lg font-bold mb-4 lg:mb-6">Revenue Trend</h3>
                    <div className="flex-1 w-full">
                        {data.salesChart.length === 0 ? (
                            <EmptyChart label="No revenue data yet" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.salesChart}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={fmtDate} />
                                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} width={55} />
                                    <Tooltip
                                        labelFormatter={fmtDate}
                                        formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Revenue']}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="card h-[360px] lg:h-[400px] flex flex-col">
                    <h3 className="text-base lg:text-lg font-bold mb-4 lg:mb-6">Expenses Breakdown</h3>
                    <div className="flex-1 w-full">
                        {data.expensesChart.length === 0 ? (
                            <EmptyChart label="No expense data yet" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.expensesChart}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={fmtDate} />
                                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} width={55} />
                                    <Tooltip
                                        labelFormatter={fmtDate}
                                        formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Expense']}
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="amount" fill="#64748b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Profit summary (real data) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="card lg:col-span-2">
                    <h3 className="text-base lg:text-lg font-bold mb-6">Net Profit Analysis</h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                            <div>
                                <p className="text-sm text-slate-500">Gross Revenue</p>
                                <p className="text-2xl font-black text-slate-900">₹{grossRevenue.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                                <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Income</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                            <div>
                                <p className="text-sm text-slate-500">Total Operational Costs</p>
                                <p className="text-2xl font-black text-slate-900">₹{totalCosts.toLocaleString()}</p>
                            </div>
                            <div className="px-2.5 py-1 bg-rose-50 rounded-full border border-rose-100">
                                <span className="text-[10px] text-rose-600 font-black uppercase tracking-widest">Expenses</span>
                            </div>
                        </div>
                        <div className={`flex justify-between items-center p-6 rounded-2xl text-white ${netProfit >= 0 ? 'bg-primary-600' : 'bg-rose-600'}`}>
                            <div>
                                <p className="text-sm opacity-80">{netProfit >= 0 ? 'Estimated Net Profit' : 'Estimated Net Loss'}</p>
                                <p className="text-3xl font-black italic">₹{Math.abs(netProfit).toLocaleString()}</p>
                            </div>
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                <TrendingUp className={`w-8 h-8 ${netProfit >= 0 ? '' : 'rotate-180'}`} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-base lg:text-lg font-bold mb-6">Profit Margin</h3>
                    <div className="flex flex-col items-center justify-center h-full pb-10">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                                <circle
                                    cx="80" cy="80" r="70"
                                    stroke="currentColor" strokeWidth="12" fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={dashOffset}
                                    className={netProfit >= 0 ? 'text-primary-500' : 'text-rose-500'}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-slate-900">{margin}%</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Margin</span>
                            </div>
                        </div>
                        <p className="mt-8 text-center text-sm text-slate-500 px-4">
                            {grossRevenue === 0
                                ? 'Record some sales to see your profit margin.'
                                : `For every ₹100 earned, you keep ₹${margin} as profit after expenses.`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyChart({ label }) {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
                <TrendingUp className="w-7 h-7 text-slate-200" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        </div>
    );
}
