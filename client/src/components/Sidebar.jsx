import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';
import {
    LayoutDashboard,
    Package,
    Gem,
    Receipt,
    Wallet,
    LineChart,
    LogOut,
    X
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Inventory', icon: Package, path: '/inventory' },
    { name: 'Rentals', icon: Gem, path: '/rentals' },
    { name: 'Billing', icon: Receipt, path: '/billing' },
    { name: 'Expenses', icon: Wallet, path: '/expenses' },
    { name: 'Analysis', icon: LineChart, path: '/analysis' },
];

export default function Sidebar({ onClose }) {
    return (
        <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col relative">
            <div className="px-6 py-8 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="w-16 h-16 overflow-hidden flex items-center justify-center">
                        <img src={logo} alt="Logo" className="w-full scale-[2.2] object-contain mix-blend-multiply translate-y-[12%] translate-x-[-5%]" />
                    </div>
                    <div className="flex flex-col -ml-4">
                        <h1 className="text-lg font-black text-slate-900 tracking-tighter leading-none mb-1">EYELUXE</h1>
                        <p className="text-[9px] text-primary-600 font-bold uppercase tracking-[0.1em] leading-none">Management</p>
                    </div>
                </div>
                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => {
                            if (window.innerWidth < 1024) onClose();
                        }}
                        className={({ isActive }) => twMerge(
                            clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-primary-50 text-primary-600 font-semibold"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            )
                        )}
                    >
                        <item.icon className={twMerge(clsx("w-5 h-5", "group-hover:scale-110 transition-transform"))} />
                        <span className="text-sm">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group text-sm font-medium">
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
