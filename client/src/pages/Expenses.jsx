import { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Plus, Trash2, Filter, Search, Download } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const categories = ['Rent', 'Salary', 'Transport', 'Utilities', 'Maintenance', 'Marketing', 'Others'];

export default function Expenses() {
    const [searchTerm, setSearchTerm] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ category: 'Others', amount: '', date: '', notes: '' });

    const fetchExpenses = async () => {
        try {
            const res = await axios.get(`${API_URL}/expenses`);
            setExpenses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

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

    useEffect(() => {
        fetchExpenses();
    }, []);

    const filteredExpenses = expenses.filter(expense =>
        (expense.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (expense) => {
        setEditingId(expense.id);
        setFormData({
            category: expense.category,
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
        }
    };

    const deleteExpense = async (id) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        try {
            await axios.delete(`${API_URL}/expenses/${id}`);
            fetchExpenses();
        } catch (err) {
            console.error(err);
            alert('Failed to delete expense');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight italic">EXPENSE TRACKER</h2>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Manage business overheads</p>
                    </div>

                    <div className="relative w-80 group">
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

                <div className="flex gap-4">
                    <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2 px-6 py-4 rounded-2xl border-slate-100 shadow-sm text-xs font-black uppercase tracking-widest">
                        <Download className="w-4 h-4" /> Export Log
                    </button>
                    <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 px-8 py-4 shadow-xl shadow-primary-200">
                        <Plus className="w-4 h-4" /> Add Expense
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                            <th className="px-8 py-5">Date</th>
                            <th className="px-6 py-5">Category</th>
                            <th className="px-6 py-5">Notes</th>
                            <th className="px-6 py-5">Amount</th>
                            <th className="px-8 py-5 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredExpenses.map(expense => (
                            <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium">{new Date(expense.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">{expense.category}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">{expense.notes || '-'}</td>
                                <td className="px-6 py-4 font-bold text-rose-500">₹{expense.amount}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(expense)}
                                            className="text-slate-300 hover:text-primary-600 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteExpense(expense.id)}
                                            className="text-slate-300 hover:text-rose-500 transition-colors"
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
                                <button type="submit" className="flex-1 px-8 py-4 bg-primary-600 text-white rounded-[1.25rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-200 hover:bg-primary-700 active:scale-[0.98] transition-all">
                                    {editingId ? 'Update Expense' : 'Save Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
