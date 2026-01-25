import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    TrendingUp,
    TrendingDown,
    Package,
    AlertCircle,
    Clock,
    DollarSign,
    X,
    Calendar,
    ArrowUpRight,
    Search
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StatCard = ({ title, value, icon: Icon, color, trend, onClick, isActive }) => (
    <div
        onClick={onClick}
        className={`card group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden relative ${isActive ? 'ring-2 ring-primary-500 scale-[1.02] shadow-2xl' : 'hover:scale-[1.01]'}`}
    >
        {isActive && (
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
        )}
        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{title}</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">₹{value.toLocaleString()}</h3>
            </div>
            <div className={`p-3 rounded-2xl ${color} shadow-lg shadow-${color.split('-')[1]}-200 transition-transform group-hover:scale-110`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
        </div>
        <div className="mt-4 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded-full border border-slate-100">
                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
            </div>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Click for details</p>
        </div>
    </div>
);

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalStockValue: 0,
        todaySales: 0,
        weekSales: 0,
        monthSales: 0,
        yearSales: 0,
        totalExpenses: 0,
        pendingReturns: 0,
        expiringAlerts: 0,
        recentBills: [],
        allBills: {
            today: [],
            week: [],
            month: [],
            year: []
        },
        methodTotals: {
            today: { CASH: 0, UPI: 0 },
            week: { CASH: 0, UPI: 0 },
            month: { CASH: 0, UPI: 0 },
            year: { CASH: 0, UPI: 0 }
        }
    });

    const [selectedPeriod, setSelectedPeriod] = useState('today');
    const [showSalesModal, setShowSalesModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API_URL}/reports/dashboard`);
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            }
        };
        fetchStats();
    }, []);

    const periodLabel = {
        today: "Today's Sales",
        week: "This Week's Sales",
        month: "This Month's Sales",
        year: "This Year's Sales"
    };

    const filteredBills = stats.allBills[selectedPeriod].filter(bill =>
        bill.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-6 lg:p-10 rounded-2xl lg:rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight italic uppercase">ANALYTICS DASHBOARD</h2>
                    <p className="text-[11px] lg:text-xs text-slate-400 font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Real-time business performance overview
                    </p>
                </div>
                <div className="flex -space-x-3 relative z-10 pr-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm ring-1 ring-slate-100 ring-offset-2">
                            U{i}
                        </div>
                    ))}
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-4 border-white bg-primary-600 flex items-center justify-center text-[10px] font-black text-white shadow-xl shadow-primary-200 ring-1 ring-primary-100 ring-offset-2">
                        +8
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <StatCard
                    title="Today's Sales"
                    value={stats.todaySales}
                    icon={DollarSign}
                    color="bg-emerald-500"
                    isActive={selectedPeriod === 'today'}
                    onClick={() => { setSelectedPeriod('today'); setShowSalesModal(true); }}
                />
                <StatCard
                    title="This Week"
                    value={stats.weekSales}
                    icon={TrendingUp}
                    color="bg-primary-500"
                    isActive={selectedPeriod === 'week'}
                    onClick={() => { setSelectedPeriod('week'); setShowSalesModal(true); }}
                />
                <StatCard
                    title="This Month"
                    value={stats.monthSales}
                    icon={Calendar}
                    color="bg-indigo-500"
                    isActive={selectedPeriod === 'month'}
                    onClick={() => { setSelectedPeriod('month'); setShowSalesModal(true); }}
                />
                <StatCard
                    title="This Year"
                    value={stats.yearSales}
                    icon={ArrowUpRight}
                    color="bg-slate-900"
                    isActive={selectedPeriod === 'year'}
                    onClick={() => { setSelectedPeriod('year'); setShowSalesModal(true); }}
                />
            </div>

            {/* Second Row Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                <div className="card bg-white border-blue-100 hover:border-blue-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Stock Value</p>
                            <h3 className="text-xl font-black text-slate-900">₹{stats.totalStockValue.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
                <div className="card bg-white border-rose-100 hover:border-rose-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Expenses</p>
                            <h3 className="text-xl font-black text-slate-900">₹{stats.totalExpenses.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
                <div className="card bg-white border-amber-100 hover:border-amber-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pending Returns</p>
                            <h3 className="text-xl font-black text-slate-900">{stats.pendingReturns} Items</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Recent Sales List */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight italic">Recent Transactions</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Latest billing activity</p>
                        </div>
                        <button onClick={() => setShowSalesModal(true)} className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest underline underline-offset-4 decoration-2">View All</button>
                    </div>
                    <div className="p-6 space-y-4">
                        {stats.recentBills?.length > 0 ? (
                            stats.recentBills.map(bill => (
                                <div key={bill.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-all group cursor-default border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary-600 font-black text-xs uppercase border border-slate-100 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-500">
                                            {bill.customerName?.slice(0, 2) || 'CU'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{bill.customerName}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-slate-400 font-black tracking-widest italic uppercase">#{bill.invoiceNo}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                                <span className="text-[10px] text-slate-400 font-bold">{bill.customerPhone}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-primary-600 italic">₹{bill.total?.toLocaleString()}</p>
                                        <p className="text-[9px] text-slate-300 font-black uppercase tracking-tight mt-0.5">{new Date(bill.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-slate-50 rounded-[1.5rem] border border-dashed border-slate-200">
                                <DollarSign className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No transactions recorded yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Alerts/Status Section */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                            <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight italic">System Alerts</h4>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${stats.expiringAlerts > 0 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 animate-pulse'}`}>
                                {stats.expiringAlerts} Active Issues
                            </div>
                        </div>
                        <div className="p-8 space-y-4">
                            {stats.expiringAlerts > 0 ? (
                                <div className="flex gap-4 p-5 bg-rose-50 border border-rose-100 rounded-3xl group hover:bg-rose-100/50 transition-colors">
                                    <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:rotate-12">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-rose-700 uppercase text-xs tracking-tight mb-1">Product Expiry Warning</p>
                                        <p className="text-[11px] text-rose-600/80 leading-relaxed font-bold">{stats.expiringAlerts} products in your inventory are nearing or past their expiration date. We recommend checking the stock immediately.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-4 p-5 bg-emerald-50 border border-emerald-100 rounded-3xl group hover:bg-emerald-100/50 transition-colors">
                                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-emerald-700 uppercase text-xs tracking-tight mb-1">Inventory Status: Optimal</p>
                                        <p className="text-[11px] text-emerald-600/80 leading-relaxed font-bold">Awesome! All products are well within their expiry dates. Your inventory management is spot on.</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 p-5 bg-blue-50 border border-blue-100 rounded-3xl group hover:bg-blue-100/50 transition-colors">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:-rotate-12">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-black text-blue-700 uppercase text-xs tracking-tight mb-1">Rental Tracking</p>
                                    <p className="text-[11px] text-blue-600/80 leading-relaxed font-bold">There are currently <span className="text-blue-800 underline decoration-2">{stats.pendingReturns} items</span> in the hands of customers. Ensure follow-ups are done for on-time returns.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Details Modal */}
            {showSalesModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-300 border border-slate-100">
                        {/* Modal Header */}
                        <div className="px-8 py-8 border-b border-slate-50 flex justify-between items-start bg-white shrink-0 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-50 rounded-full -mr-24 -mt-24 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-primary-600 text-white rounded-2xl shadow-xl shadow-primary-200">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">{periodLabel[selectedPeriod]}</h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black tracking-[0.2em] uppercase">
                                        Total: ₹{stats[`${selectedPeriod}Sales`]?.toLocaleString()}
                                    </div>
                                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black tracking-[0.2em] uppercase">
                                        Cash: ₹{stats.methodTotals[selectedPeriod].CASH?.toLocaleString()}
                                    </div>
                                    <div className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[9px] font-black tracking-[0.2em] uppercase">
                                        UPI: ₹{stats.methodTotals[selectedPeriod].UPI?.toLocaleString()}
                                    </div>
                                    <div className="px-3 py-1 bg-slate-50 text-slate-500 border border-slate-100 rounded-lg text-[9px] font-black tracking-[0.2em] uppercase">
                                        {stats.allBills[selectedPeriod]?.length} Sales
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowSalesModal(false)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 relative z-10">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Search & Tabs */}
                        <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
                            <div className="flex gap-2 p-1 bg-white rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto">
                                {['today', 'week', 'month', 'year'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setSelectedPeriod(p)}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedPeriod === p ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <div className="relative w-full md:w-80 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by name or invoice..."
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Modal Body - Scrollable Table */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
                            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                                            <th className="px-6 py-5">Invoice</th>
                                            <th className="px-6 py-5 text-center">Date</th>
                                            <th className="px-6 py-5">Customer</th>
                                            <th className="px-6 py-5 text-center">Method</th>
                                            <th className="px-6 py-5 text-right pr-8">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredBills.map(bill => (
                                            <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <span className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase shadow-sm">
                                                        {bill.invoiceNo}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <p className="text-[10px] font-black text-slate-500">{new Date(bill.date).toLocaleDateString('en-GB')}</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-slate-800">{bill.customerName}</span>
                                                        <span className="text-[9px] text-slate-400 font-bold">{bill.customerPhone}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${bill.paymentMethod?.toUpperCase() === 'UPI' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                                        {bill.paymentMethod || 'CASH'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right pr-8">
                                                    <span className="text-sm font-black text-primary-600 italic">₹{bill.total?.toLocaleString()}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredBills.length === 0 && (
                                    <div className="p-20 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                            <Search className="w-10 h-10 text-slate-200" />
                                        </div>
                                        <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">No matching transactions found</h3>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/30 flex justify-end shrink-0">
                            <button
                                onClick={() => setShowSalesModal(false)}
                                className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:shadow-slate-300 active:scale-95 transition-all"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
}
