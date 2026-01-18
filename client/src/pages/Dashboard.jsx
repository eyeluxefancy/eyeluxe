import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    TrendingUp,
    TrendingDown,
    Package,
    AlertCircle,
    Clock,
    DollarSign
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="card hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
        {trend && (
            <div className="mt-4 flex items-center gap-1">
                {trend > 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                    <TrendingDown className="w-4 h-4 text-rose-500" />
                )}
                <span className={`text-sm font-medium ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {Math.abs(trend)}% vs last month
                </span>
            </div>
        )}
    </div>
);

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalStockValue: 0,
        todaySales: 0,
        totalExpenses: 0,
        pendingReturns: 0,
        expiringAlerts: 0
    });

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight italic">ANALYTICS DASHBOARD</h2>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time business overview</p>
                </div>
                <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 ring-2 ring-slate-50">
                            U{i}
                        </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-600 flex items-center justify-center text-[10px] font-black text-white ring-2 ring-slate-50">
                        +8
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Stock Value"
                    value={`₹${stats.totalStockValue.toLocaleString()}`}
                    icon={Package}
                    color="bg-blue-500"
                    trend={12}
                />
                <StatCard
                    title="Today's Sales"
                    value={`₹${stats.todaySales.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-emerald-500"
                    trend={8}
                />
                <StatCard
                    title="Total Expenses"
                    value={`₹${stats.totalExpenses.toLocaleString()}`}
                    icon={TrendingDown}
                    color="bg-rose-500"
                    trend={-2}
                />
                <StatCard
                    title="Pending Returns"
                    value={stats.pendingReturns}
                    icon={Clock}
                    color="bg-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h4 className="text-lg font-bold mb-4">Recent Sales</h4>
                    <div className="mt-4 space-y-4">
                        {stats.recentBills?.length > 0 ? (
                            stats.recentBills.map(bill => (
                                <div key={bill.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs uppercase">
                                            {bill.customerName?.slice(0, 2) || 'CU'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-slate-900">{bill.customerName}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] text-slate-400 font-medium tracking-tight">#{bill.invoiceNo}</p>
                                                <span className="text-[10px] text-slate-300">•</span>
                                                <p className="text-[10px] text-slate-400 font-medium">{bill.customerPhone}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="font-bold text-sm text-slate-700">₹{bill.total?.toLocaleString()}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-sm italic text-center py-8">No sales recorded today.</p>
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-bold">Alerts</h4>
                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${stats.expiringAlerts > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {stats.expiringAlerts} Issues
                        </div>
                    </div>
                    <div className="space-y-3">
                        {stats.expiringAlerts > 0 ? (
                            <div className="flex gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-sm">Expired Products</p>
                                    <p className="text-xs opacity-80">{stats.expiringAlerts} products are near or past expiry. Action required.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
                                <Package className="w-5 h-5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-sm">All Stock OK</p>
                                    <p className="text-xs opacity-80">No products expiring in the next 30 days.</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700">
                            <Clock className="w-5 h-5 shrink-0" />
                            <div>
                                <p className="font-semibold text-sm">Pending Rentals</p>
                                <p className="text-xs opacity-80">{stats.pendingReturns} items need to be returned by customers.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
