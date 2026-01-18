import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';
import { Calendar, Download } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Analysis() {
    const [data, setData] = useState({
        salesChart: [],
        expensesChart: []
    });

    const exportToCSV = () => {
        // Prepare combined data for export
        const headers = ['Date', 'Type', 'Amount'];
        const salesData = (data.salesChart || []).map(s => [
            new Date(s.date).toLocaleDateString('en-GB'),
            'Revenue',
            s.amount
        ]);
        const expenseData = (data.expensesChart || []).map(e => [
            new Date(e.date).toLocaleDateString('en-GB'),
            'Expense',
            e.amount
        ]);

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

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get(`${API_URL}/reports/analytics`);
                setData(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAnalytics();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight italic">PROFIT & BUSINESS ANALYSIS</h2>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Visual breakdown of performance</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500">
                        <Calendar className="w-4 h-4 text-primary-500" /> Last 30 Days
                    </div>
                    <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-2xl border-slate-100 shadow-sm text-[11px] font-black uppercase tracking-widest transition-all hover:bg-slate-900 hover:text-white">
                        <Download className="w-4 h-4" /> Download Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold mb-6">Revenue Trend</h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.salesChart}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold mb-6">Expenses Breakdown</h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.expensesChart}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="amount" fill="#64748b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="card col-span-2">
                    <h3 className="text-lg font-bold mb-6">Net Profit Analysis</h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                            <div>
                                <p className="text-sm text-slate-500">Gross Revenue</p>
                                <p className="text-2xl font-black text-slate-900">₹45,200</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-emerald-500 font-bold">+12% from last month</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                            <div>
                                <p className="text-sm text-slate-500">Total Operational Costs</p>
                                <p className="text-2xl font-black text-slate-900">₹12,400</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-rose-500 font-bold">+5% from last month</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-6 bg-primary-600 rounded-2xl text-white">
                            <div>
                                <p className="text-sm opacity-80">Estimated Net Profit</p>
                                <p className="text-3xl font-black italic">₹32,800</p>
                            </div>
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-bold mb-6">Profit Margin</h3>
                    <div className="flex flex-col items-center justify-center h-full pb-10">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset="110" className="text-primary-500" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-slate-900">72%</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Efficiency</span>
                            </div>
                        </div>
                        <p className="mt-8 text-center text-sm text-slate-500 px-4">Your profit margin has increased by 4% this month despite higher utility costs.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper icon
function TrendingUp({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
    );
}
