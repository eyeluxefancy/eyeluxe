import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Calendar, User, Phone, CheckCircle2, AlertCircle, Printer, X, Download, Edit2, Trash2 } from 'lucide-react';
import PrintInvoice from '../components/PrintInvoice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Rentals() {
    const [rentedSearch, setRentedSearch] = useState('');
    const [returnedSearch, setReturnedSearch] = useState('');
    const [rentals, setRentals] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showPrint, setShowPrint] = useState(null);
    const [activeTab, setActiveTab] = useState('Rented');
    const [editingId, setEditingId] = useState(null);
    const [dateFilter, setDateFilter] = useState('');
    const [formData, setFormData] = useState({
        ornamentName: '',
        dailyPrice: '',
        advanceAmount: '',
        customerName: '',
        customerPhone: '',
        startDate: new Date().toISOString().split('T')[0],
        expectedReturnDate: '',
        extraDiscount: 0
    });

    const calculateSubtotal = () => {
        if (!formData.startDate || !formData.expectedReturnDate || !formData.dailyPrice) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.expectedReturnDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Minimum 1 day
        return diffDays * parseFloat(formData.dailyPrice);
    };

    const calculateTotal = () => {
        return calculateSubtotal() - (parseFloat(formData.extraDiscount) || 0);
    };

    const fetchRentals = async () => {
        try {
            const res = await axios.get(`${API_URL}/rentals`);
            setRentals(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Ornament', 'Customer Name', 'Phone', 'Price', 'Advance', 'Extra Discount', 'Status', 'Due Date'];
        const csvRows = [
            headers.join(','),
            ...filteredRentals.map(r => [
                r.id.slice(-6).toUpperCase(),
                `"${r.ornamentName}"`,
                `"${r.customerName}"`,
                r.customerPhone,
                r.rentalPrice,
                r.advanceAmount || 0,
                r.extraDiscount || 0,
                r.status,
                new Date(r.expectedReturnDate).toLocaleDateString('en-GB')
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvRows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `eyeluxe_rentals_${activeTab.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    useEffect(() => {
        fetchRentals();
    }, []);

    const handleEdit = (rental) => {
        setEditingId(rental.id);
        setFormData({
            ornamentName: rental.ornamentName || '',
            dailyPrice: rental.dailyPrice || '',
            advanceAmount: rental.advanceAmount || '',
            customerName: rental.customerName || '',
            customerPhone: rental.customerPhone || '',
            startDate: rental.startDate ? rental.startDate.split('T')[0] : '',
            expectedReturnDate: rental.expectedReturnDate ? rental.expectedReturnDate.split('T')[0] : '',
            extraDiscount: rental.extraDiscount || 0
        });
        setShowModal(true);
    };

    const handleDelete = async (rental) => {
        if (!window.confirm('Are you sure you want to delete this rental?')) return;
        try {
            await axios.delete(`${API_URL}/rentals/${rental.id}`);
            fetchRentals();
        } catch (err) {
            console.error(err);
            alert('Failed to delete rental');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ ornamentName: '', dailyPrice: '', advanceAmount: '', customerName: '', customerPhone: '', startDate: new Date().toISOString().split('T')[0], expectedReturnDate: '', extraDiscount: 0 });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const totalPrice = calculateTotal();
        try {
            if (editingId) {
                await axios.put(`${API_URL}/rentals/${editingId}`, {
                    ...formData,
                    rentalPrice: totalPrice
                });
                closeModal();
            } else {
                const res = await axios.post(`${API_URL}/rentals`, {
                    ...formData,
                    rentalPrice: totalPrice,
                    extraDiscount: parseFloat(formData.extraDiscount) || 0
                });
                const newRental = res.data;
                closeModal();
                setShowPrint({
                    invoiceNo: newRental.id.slice(-6).toUpperCase(),
                    date: new Date().toISOString(),
                    customerInfo: { name: formData.customerName, phone: formData.customerPhone },
                    cartItems: [{
                        name: `${formData.ornamentName} (${Math.round(Math.abs(new Date(formData.expectedReturnDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) || 1} Days)`,
                        quantity: 1,
                        rentalPrice: calculateSubtotal()
                    }],
                    total: totalPrice,
                    extraDiscount: parseFloat(formData.extraDiscount) || 0
                });
            }
            fetchRentals();
        } catch (err) {
            console.error(err);
            alert('Failed to save rental');
        }
    };

    const handleReturn = async (id) => {
        const rental = rentals.find(r => r.id === id);
        if (!rental) return;

        try {
            await axios.put(`${API_URL}/rentals/${id}`, {
                status: 'Returned',
                actualReturnDate: new Date().toISOString()
            });

            // Generate Settlement Bill
            setShowPrint({
                invoiceNo: (rental.id || '').slice(-6).toUpperCase(),
                date: new Date().toISOString(),
                title: 'SETTLEMENT BILL',
                type: 'Rental Return',
                customerInfo: { name: rental.customerName, phone: rental.customerPhone },
                cartItems: [
                    {
                        name: `${rental.ornamentName} (Base Price)`,
                        quantity: 1,
                        rentalPrice: parseFloat(rental.rentalPrice || 0) + parseFloat(rental.extraDiscount || 0)
                    },
                    {
                        name: `Advance Paid (Receipt Ref: #${(rental.id || '').slice(-6).toUpperCase()})`,
                        quantity: 1,
                        rentalPrice: -(parseFloat(rental.advanceAmount) || 0)
                    }
                ],
                total: parseFloat(rental.rentalPrice) - (parseFloat(rental.advanceAmount) || 0),
                extraDiscount: parseFloat(rental.extraDiscount) || 0
            });

            fetchRentals();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredRentals = rentals
        .filter(rental => rental.status === activeTab)
        .filter(rental => {
            if (!dateFilter) return true;
            return rental.expectedReturnDate === dateFilter;
        })
        .filter(rental => {
            const id = (rental.id || '').slice(-6).toLowerCase();
            const s = (activeTab === 'Rented' ? rentedSearch : returnedSearch).toLowerCase();
            return id.includes(s) ||
                (rental.customerName || '').toLowerCase().includes(s) ||
                (rental.customerPhone || '').includes(s) ||
                (rental.ornamentName || '').toLowerCase().includes(s);
        });

    return (
        <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 lg:p-8 rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 w-full sm:w-auto">
                    <div>
                        <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight italic uppercase">RENTAL MANAGEMENT</h2>
                        <p className="text-[10px] lg:text-sm text-slate-400 font-bold uppercase tracking-widest mt-0.5 lg:mt-1">Track & maintain all transactions</p>
                    </div>

                    <div className="relative w-full sm:w-64 lg:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 lg:w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab.toLowerCase()}...`}
                            className="w-full pl-10 pr-4 py-2.5 lg:py-3 bg-slate-50/50 border border-slate-100 rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-bold focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all outline-none"
                            value={activeTab === 'Rented' ? rentedSearch : returnedSearch}
                            onChange={(e) => activeTab === 'Rented' ? setRentedSearch(e.target.value) : setReturnedSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-2 lg:gap-4 w-full sm:w-auto">
                    <button
                        onClick={exportToCSV}
                        className="flex-1 sm:flex-initial btn-secondary flex items-center justify-center gap-2 px-4 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl border-slate-100 shadow-sm text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        <Download className="w-4 h-4 lg:w-5 lg:h-5" /> <span className="hidden lg:inline">Export {activeTab}</span><span className="lg:hidden">Export</span>
                    </button>
                    <button
                        onClick={() => {
                            closeModal();
                            setShowModal(true);
                        }}
                        className="flex-1 sm:flex-initial btn-primary flex items-center justify-center gap-2 px-4 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl shadow-xl shadow-primary-200 text-[9px] lg:text-[10px] font-black uppercase tracking-widest"
                    >
                        <Plus className="w-4 h-4 lg:w-5 lg:h-5" /> <span>New Rental</span>
                    </button>
                </div>
            </div>

            {/* Tabs & Date Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-2 p-1 lg:p-1.5 bg-white rounded-xl lg:rounded-2xl w-full sm:w-fit border border-slate-100 shadow-sm">
                    <button
                        onClick={() => setActiveTab('Rented')}
                        className={`flex-1 sm:flex-initial px-4 lg:px-8 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Rented' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                        Active <span className="hidden sm:inline">Rentals</span> ({rentals.filter(r => r.status === 'Rented').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('Returned')}
                        className={`flex-1 sm:flex-initial px-4 lg:px-8 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Returned' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                        Returned ({rentals.filter(r => r.status === 'Returned').length})
                    </button>
                </div>

                <div className="flex items-center gap-3 bg-white p-1 lg:p-1.5 rounded-xl lg:rounded-2xl border border-slate-100 shadow-sm pr-3 lg:pr-4 group transition-all hover:border-primary-100 w-full sm:w-auto">
                    <div className="flex items-center gap-2 pl-3 border-r border-slate-100 pr-3 shrink-0">
                        <Calendar className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-slate-400 group-hover:text-primary-500" />
                        <label className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Due Date</label>
                    </div>
                    <input
                        type="date"
                        className="text-[10px] lg:text-xs font-black text-slate-700 outline-none bg-transparent cursor-pointer flex-1"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                    {dateFilter && (
                        <button onClick={() => setDateFilter('')} className="p-1 lg:p-1.5 hover:bg-slate-100 text-slate-400 hover:text-rose-500 rounded-lg transition-colors">
                            <X className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-0">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[9px] lg:text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                                <th className="px-4 lg:px-8 py-4 lg:py-5">ID</th>
                                <th className="px-4 lg:px-6 py-4 lg:py-5">Ornament</th>
                                <th className="px-4 lg:px-6 py-4 lg:py-5">Customer</th>
                                <th className="px-4 lg:px-6 py-4 lg:py-5 text-right">Finances</th>
                                <th className="px-4 lg:px-6 py-4 lg:py-5 text-center">Due Date</th>
                                <th className="px-4 lg:px-6 py-4 lg:py-5 text-center">Status</th>
                                <th className="px-4 lg:px-8 py-4 lg:py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredRentals.map((rental) => (
                                <tr key={rental.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <span className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase">
                                            {rental.id.slice(-6).toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 font-black text-slate-800 tracking-tight">
                                        {rental.ornamentName}
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">{rental.customerName}</span>
                                            <span className="text-[10px] text-slate-400 font-bold tracking-tight">{rental.customerPhone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Total</span>
                                                <span className="text-sm font-black text-slate-900">₹{rental.rentalPrice?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-emerald-400 font-black uppercase tracking-tighter">Paid</span>
                                                <span className="text-[11px] font-black text-emerald-600">₹{rental.advanceAmount?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-slate-100">
                                                <span className="text-[10px] text-rose-400 font-black uppercase tracking-tighter">Due</span>
                                                <span className="text-sm font-black text-rose-500">₹{(rental.rentalPrice - (rental.advanceAmount || 0))?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className="text-xs font-black text-slate-600 tracking-tight">
                                            {new Date(rental.expectedReturnDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className={`inline-flex px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${rental.status === 'Returned' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                            {rental.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(rental)}
                                                className="p-2.5 bg-slate-100 text-slate-500 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all"
                                                title="Edit Rental"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rental)}
                                                className="p-2.5 bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                                                title="Delete Rental"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setShowPrint({
                                                    invoiceNo: (rental.id || '').slice(-6).toUpperCase(),
                                                    date: rental.startDate,
                                                    customerInfo: { name: rental.customerName, phone: rental.customerPhone },
                                                    cartItems: [{
                                                        name: rental.ornamentName,
                                                        quantity: 1,
                                                        rentalPrice: parseFloat(rental.rentalPrice || 0) + parseFloat(rental.extraDiscount || 0)
                                                    }],
                                                    total: rental.rentalPrice,
                                                    extraDiscount: rental.extraDiscount || 0
                                                })}
                                                className="p-2.5 bg-slate-100 text-slate-500 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all"
                                                title="View Bill"
                                            >
                                                <Printer className="w-5 h-5" />
                                            </button>
                                            {rental.status === 'Rented' && (
                                                <button
                                                    onClick={() => handleReturn(rental.id)}
                                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-primary-600 transition-all font-black text-[9px] uppercase tracking-widest shadow-lg shadow-slate-100 active:scale-95 whitespace-nowrap"
                                                >
                                                    Return
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredRentals.length === 0 && (
                        <div className="p-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <AlertCircle className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs">No transactions found</h3>
                        </div>
                    )}
                </div>

                {showModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300">
                        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                            {/* Modal Header */}
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                                        {editingId ? 'Edit Rental' : 'New Rental Entry'}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                        {editingId ? 'Update existing rental details' : 'Fill in the details to create a new transaction'}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Body - Scrollable */}
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="col-span-2 group">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary-500 transition-colors">Ornament Name</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none"
                                                value={formData.ornamentName}
                                                onChange={(e) => setFormData({ ...formData, ornamentName: e.target.value })}
                                                placeholder="Enter ornament description..."
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary-500 transition-colors">Daily Price (₹)</label>
                                            <input
                                                type="number"
                                                required
                                                placeholder="e.g. 200"
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none"
                                                value={formData.dailyPrice}
                                                onChange={(e) => setFormData({ ...formData, dailyPrice: e.target.value })}
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary-500 transition-colors">Advance Amount (₹)</label>
                                            <input
                                                type="number"
                                                required
                                                placeholder="0"
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none"
                                                value={formData.advanceAmount}
                                                onChange={(e) => setFormData({ ...formData, advanceAmount: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-span-2 group pt-2 border-t border-slate-50">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary-500 transition-colors">Customer Name</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none"
                                                value={formData.customerName}
                                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                                placeholder="Enter customer's full name"
                                            />
                                        </div>

                                        <div className="col-span-2 group">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary-500 transition-colors">Customer Phone</label>
                                            <input
                                                type="tel"
                                                required
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none"
                                                value={formData.customerPhone}
                                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                                placeholder="+91 XXXXX XXXXX"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary-500 transition-colors">Start Date</label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none cursor-pointer"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary-500 transition-colors">Expected Return</label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none cursor-pointer"
                                                value={formData.expectedReturnDate}
                                                onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-span-2 group">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary-500 transition-colors">Extra Discount (₹)</label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none"
                                                value={formData.extraDiscount}
                                                onChange={(e) => setFormData({ ...formData, extraDiscount: e.target.value })}
                                            />
                                        </div>

                                        {/* Summary Card */}
                                        <div className="col-span-2 p-6 bg-slate-900 rounded-[1.5rem] space-y-4 shadow-lg shadow-slate-200 mt-4 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary-500/20 transition-all duration-500"></div>

                                            <div className="relative z-10 flex justify-between items-center border-b border-white/5 pb-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Subtotal</p>
                                                    <p className="text-xl font-black text-slate-300">₹{calculateSubtotal()?.toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-1">Discount</p>
                                                    <p className="text-xl font-black text-primary-500">-₹{(parseFloat(formData.extraDiscount) || 0).toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="relative z-10 flex justify-between items-center">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Amount</p>
                                                    <p className="text-3xl font-black text-white italic">₹{calculateTotal()?.toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Due on Return</p>
                                                    <p className="text-xl font-black text-primary-500">₹{(calculateTotal() - (formData.advanceAmount || 0))?.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sticky Footer */}
                                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-[1.25rem] text-xs font-black uppercase tracking-widest hover:bg-slate-50 active:scale-[0.98] transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-8 py-4 bg-primary-600 text-white rounded-[1.25rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-200 hover:bg-primary-700 hover:shadow-primary-300 active:scale-[0.98] transition-all"
                                    >
                                        {editingId ? 'Update Rental' : 'Confirm Rental'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            {showPrint && (
                <PrintInvoice
                    bill={showPrint}
                    customer={showPrint.customerInfo}
                    items={showPrint.cartItems}
                    total={showPrint.total}
                    onClose={() => setShowPrint(null)}
                />
            )}
        </div>
    );
}
