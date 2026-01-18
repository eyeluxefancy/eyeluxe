import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
    Plus,
    ChevronDown,
    Package,
    Gem,
    FileText,
    DollarSign,
    LogOut
} from 'lucide-react';
import Sidebar from './Sidebar';
import logo from '../assets/logo.png';

export default function Layout() {
    const [showActions, setShowActions] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const quickActions = [
        { label: 'New Bill', icon: FileText, path: '/billing', color: 'text-emerald-500' },
        { label: 'Add Product', icon: Package, path: '/inventory', color: 'text-blue-500' },
        { label: 'New Rental', icon: Gem, path: '/rentals', color: 'text-amber-500' },
        { label: 'Add Expense', icon: DollarSign, path: '/expenses', color: 'text-rose-500' },
    ];

    return (
        <div className="flex bg-slate-50 min-h-screen font-['Inter'] relative">
            {/* Sidebar with mobile toggle state */}
            <div className={`transition-transform duration-300 fixed inset-y-0 left-0 z-[60] lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55] lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <main className="flex-1 w-full min-h-screen flex flex-col min-w-0">
                {/* Slim, Glassmorphism Header */}
                <header className="sticky top-0 z-40 flex justify-between items-center px-4 lg:px-8 py-4 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/60">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 lg:hidden text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                        <div className="flex flex-col">
                            <h3 className="text-xs lg:text-sm font-black text-slate-800 tracking-tight">
                                WELCOME TO <span className="text-primary-600">EYELUXE</span> <span className="hidden sm:inline">PORTAL</span>
                            </h3>
                            <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Quick Actions Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowActions(!showActions)}
                                className="flex items-center gap-2 px-3 lg:px-5 py-2 lg:py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-primary-600 transition-all text-[10px] lg:text-[11px] uppercase tracking-wider shadow-lg shadow-slate-200"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Create New</span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showActions ? 'rotate-180' : ''}`} />
                            </button>

                            {showActions && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowActions(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-3 w-48 lg:w-56 bg-white border border-slate-50 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                        <div className="p-2">
                                            {quickActions.map((action, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        navigate(action.path);
                                                        setShowActions(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 p-2.5 lg:p-3 hover:bg-slate-50 rounded-xl transition-colors group"
                                                >
                                                    <div className={`p-2 rounded-lg bg-slate-50 group-hover:bg-white transition-colors`}>
                                                        <action.icon className={`w-3.5 h-3.5 lg:w-4 h-4 ${action.color}`} />
                                                    </div>
                                                    <span className="text-xs lg:text-sm font-bold text-slate-700">{action.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>
                <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
