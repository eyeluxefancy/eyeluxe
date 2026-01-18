import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, ShoppingBag, Download } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Inventory() {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        purchasePrice: '',
        mrp: '',
        sellingPrice: '',
        stock: '',
        expiryDate: ''
    });

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/products`);
            setProducts(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToCSV = () => {
        const headers = ['Product Name', 'Purchase Price', 'MRP', 'Selling Price', 'Stock', 'Expiry Date'];
        const csvRows = [
            headers.join(','),
            ...filteredProducts.map(p => [
                `"${p.name}"`,
                p.purchasePrice,
                p.mrp,
                p.sellingPrice,
                p.stock,
                p.expiryDate ? new Date(p.expiryDate).toLocaleDateString('en-GB') : 'N/A'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvRows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `eyeluxe_inventory_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/products`, formData);
            setShowModal(false);
            setFormData({ name: '', purchasePrice: '', mrp: '', sellingPrice: '', stock: '', expiryDate: '' });
            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 lg:p-8 rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 w-full sm:w-auto">
                    <div>
                        <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight italic uppercase">INVENTORY MANAGEMENT</h2>
                        <p className="text-[10px] lg:text-sm text-slate-400 font-bold uppercase tracking-widest mt-0.5 lg:mt-1">Track your business assets</p>
                    </div>

                    <div className="relative w-full sm:w-64 lg:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2.5 lg:py-3 bg-slate-50/50 border border-slate-100 rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-bold focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex gap-2 lg:gap-4 w-full sm:w-auto">
                    <button onClick={exportToCSV} className="flex-1 sm:flex-initial btn-secondary flex items-center justify-center gap-2 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl border-slate-100 shadow-sm text-[9px] lg:text-xs font-black uppercase tracking-widest">
                        <Download className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span className="hidden sm:inline">Export Data</span><span className="sm:hidden">Export</span>
                    </button>
                    <button onClick={() => setShowModal(true)} className="flex-1 sm:flex-initial btn-primary flex items-center justify-center gap-2 px-4 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl shadow-xl shadow-primary-200 text-[9px] lg:text-xs font-black uppercase tracking-widest">
                        <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span>Add Product</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left min-w-[700px] lg:min-w-0">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[9px] lg:text-sm text-slate-500 uppercase tracking-wider font-semibold">
                                <th className="px-3 lg:px-6 py-3 lg:py-4">Product Name</th>
                                <th className="px-3 lg:px-6 py-3 lg:py-4">Purchase / MRP</th>
                                <th className="px-3 lg:px-6 py-3 lg:py-4">Selling Price</th>
                                <th className="px-3 lg:px-6 py-3 lg:py-4">Stock</th>
                                <th className="px-3 lg:px-6 py-3 lg:py-4">Expiry</th>
                                <th className="px-3 lg:px-6 py-3 lg:py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                                        <div className="flex items-center gap-2 lg:gap-3">
                                            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
                                                <ShoppingBag className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
                                            </div>
                                            <span className="font-semibold text-slate-700 text-xs lg:text-sm">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                                        <div>
                                            <p className="text-slate-900 font-medium text-xs lg:text-sm">₹{product.purchasePrice}</p>
                                            <p className="text-[10px] lg:text-xs text-slate-400">MRP: ₹{product.mrp}</p>
                                        </div>
                                    </td>
                                    <td className="px-3 lg:px-6 py-3 lg:py-4 font-bold text-primary-600 text-xs lg:text-sm">₹{product.sellingPrice}</td>
                                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-[9px] lg:text-xs font-bold ${product.stock < 5 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {product.stock} <span className="hidden sm:inline">in stock</span>
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 lg:px-6 py-3 lg:py-4 text-[10px] lg:text-sm text-slate-500">
                                        {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'}
                                    </td>
                                    <td className="px-3 lg:px-6 py-3 lg:py-4 text-right">
                                        <div className="flex justify-end gap-1 lg:gap-2">
                                            <button className="p-1.5 lg:p-2 bg-slate-50 hover:bg-white rounded-lg border border-slate-100 text-slate-500 hover:text-primary-600 transition-all">
                                                <Edit2 className="w-3.5 h-3.5  lg:w-4 lg:h-4" />
                                            </button>
                                            <button className="p-1.5 lg:p-2 bg-slate-50 hover:bg-white rounded-lg border border-slate-100 text-slate-500 hover:text-rose-600 transition-all">
                                                <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
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
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Add New Product</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Register a new item to your stock</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="col-span-2 group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary-500 transition-colors">Product Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter product name..."
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary-500 transition-colors">Purchase Price</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none"
                                            value={formData.purchasePrice}
                                            onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                                            placeholder="₹ 0.00"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary-500 transition-colors">MRP Price</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none"
                                            value={formData.mrp}
                                            onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                                            placeholder="₹ 0.00"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary-500 transition-colors">Selling Price</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none"
                                            value={formData.sellingPrice}
                                            onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                                            placeholder="₹ 0.00"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary-500 transition-colors">Stock Quantity</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            placeholder="0 units"
                                        />
                                    </div>
                                    <div className="col-span-2 group pt-2 border-t border-slate-50">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary-500 transition-colors">Expiry Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none cursor-pointer"
                                            value={formData.expiryDate}
                                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-[1.25rem] text-xs font-black uppercase tracking-widest hover:bg-slate-50 active:scale-[0.98] transition-all">Cancel</button>
                                <button type="submit" className="flex-1 px-8 py-4 bg-primary-600 text-white rounded-[1.25rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-200 hover:bg-primary-700 active:scale-[0.98] transition-all">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
