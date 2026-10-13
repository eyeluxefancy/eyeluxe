import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Wallet, Plus, Edit2, Trash2, Search, Download, Receipt, TrendingDown, CalendarDays } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const categories = ['Rent', 'Salary', 'Transport', 'Utilities', 'Maintenance', 'Marketing', 'Others'];

const categoryStyles = {
    Rent: 'bg-amber-50 text-amber-600 border-amber-100',
    Salary: 'bg-blue-50 text-blue-600 border-blue-100',
    Transport: 'bg-violet-50 text-violet-600 border-violet-100',
    Utilities: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    Maintenance: 'bg-orange-50 text-orange-600 border-orange-100',
    Marketing: 'bg-pink-50 text-pink-600 border-pink-100',
    Others: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function Expenses() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ category: 'Others', amount: '', date: '', notes: '' });

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/expenses`);
            setExpenses(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const filteredExpenses = useMemo(() => expenses.filter(expense => {
        const matchesSearch =
            (expense.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (expense.category || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || expense.category === activeCategory;
        return matchesSearch && matchesCategory;
    }), [expenses, searchTerm, activeCategory]);

    const stats = useMemo(() => {
        const now = new Date();
        const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
        const thisMonth = expenses
            .filter(e => {
                const d = new Date(e.date);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            })
            .reduce((sum, e) => sum + Number(e.amount || 0), 0);
        return { total, thisMonth, count: expenses.length };
    }, [expenses]);

    const exportToCSV = () => {
        const headers = ['Date', 'Category', 'Amount', 'Notes'];
        const csvRows = [
            headers.join(','),
            ...filteredExpenses.map(e => [
                new Date(e.date).toLocaleDateString('en-GB'),
                `"${e.category}"`,
                e.amount,
                `"${e.notes || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvRows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `eyeluxe_expenses_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleEdit = (expense) => {
        setEditingId(expense.id);
        setFormData({
            category: expense.category || 'Others',
            amount: expense.amount,
            date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
            notes: expense.notes || ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ category: 'Others', amount: '', date: '', notes: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            if (editingId) {
                await axios.put(`${API_URL}/expenses/${editingId}`, formData);
            } else {
                await axios.post(`${API_URL}/expenses`, formData);
            }
            closeModal();
            fetchExpenses();
        } catch (err) {
            console.error(err);
            alert('Failed to save expense');
        } finally {
            setSaving(false);
        }
    };

    const deleteExpense = async (id) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        try {
            await axios.delete(`${API_URL}/expenses/${id}`);
            setExpenses(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete expense');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-200 shrink-0">
                        <Wallet className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight italic">EXPENSE TRACKER</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manage business overheads</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2 px-5 md:px-6 py-3.5 rounded-2xl border-slate-100 shadow-sm text-[11px] font-black uppercase tracking-widest">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 px-6 md:px-8 py-3.5 rounded-2xl shadow-xl shadow-primary-200 text-[11px] font-black uppercase tracking-widest">
                        <Plus className="w-4 h-4" /> Add Expense
                    </button>
                </div>
            </div>

            {/* Summary stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-slate-900 p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-primary-500/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <TrendingDown className="w-6 h-6 text-primary-400 mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Expenses</p>
                    <p className="text-3xl font-black text-white mt-1 tracking-tight">₹{stats.total.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <CalendarDays className="w-6 h-6 text-primary-500 mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">This Month</p>
                    <p className="text-3xl font-black text-slate-800 mt-1 tracking-tight">₹{stats.thisMonth.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <Receipt className="w-6 h-6 text-primary-500 mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entries Logged</p>
                    <p className="text-3xl font-black text-slate-800 mt-1 tracking-tight">{stats.count}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                    {['All', ...categories].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="relative w-full lg:w-80 group shrink-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search category or notes..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[640px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                                <th className="px-8 py-5">Date</th>
                                <th className="px-6 py-5">Category</th>
                                <th className="px-6 py-5">Notes</th>
                                <th className="px-6 py-5 text-right">Amount</th>
                                <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-8 py-16 text-center text-sm font-bold text-slate-400">Loading expenses…</td></tr>
                            ) : filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                                                <Wallet className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="text-sm font-black text-slate-500 uppercase tracking-widest">No expenses yet</p>
                                            <p className="text-xs text-slate-400 font-medium max-w-xs">
                                                {expenses.length === 0 ? 'Start logging your business overheads with the "Add Expense" button.' : 'No entries match your filter.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredExpenses.map(expense => (
                                <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-4 text-sm font-bold text-slate-700 whitespace-nowrap">{new Date(expense.date).toLocaleDateString('en-GB')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${categoryStyles[expense.category] || categoryStyles.Others}`}>{expense.category || 'Others'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-medium max-w-xs truncate">{expense.notes || '—'}</td>
                                    <td className="px-6 py-4 font-black text-rose-500 text-right whitespace-nowrap">₹{Number(expense.amount || 0).toLocaleString()}</td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => handleEdit(expense)}
                                                className="p-2 rounded-xl text-slate-300 hover:text-primary-600 hover:bg-primary-50 transition-all"
                                                title="Edit expense"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteExpense(expense.id)}
                                                className="p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                title="Delete expense"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                                    {editingId ? 'Edit Expense' : 'Log New Expense'}
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    {editingId ? 'Update business expenditure details' : 'Record a new business expenditure'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-8 space-y-6">
                                <div className="space-y-5">
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary-500 transition-colors">Category</label>
                                        <select
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none appearance-none cursor-pointer"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary-500 transition-colors">Amount (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            placeholder="Enter amount"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary-500 transition-colors">Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none cursor-pointer"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary-500 transition-colors">Notes (Optional)</label>
                                        <textarea
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none min-h-[100px] resize-none"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            placeholder="Additional details..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
                                <button type="button" onClick={closeModal} className="flex-1 px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-[1.25rem] text-xs font-black uppercase tracking-widest hover:bg-slate-50 active:scale-[0.98] transition-all">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 px-8 py-4 bg-primary-600 text-white rounded-[1.25rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-200 hover:bg-primary-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                    {saving ? 'Saving…' : (editingId ? 'Update Expense' : 'Save Expense')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
