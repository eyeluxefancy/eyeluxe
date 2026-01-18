import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Trash2, Printer, Search, User, Phone } from 'lucide-react';
import PrintInvoice from '../components/PrintInvoice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Billing() {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState({ name: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [showPrint, setShowPrint] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            const res = await axios.get(`${API_URL}/products`);
            setProducts(res.data);
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            if (existing.quantity >= product.stock) return alert("Out of stock!");
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            if (product.stock < 1) return alert("Out of stock!");
            setCart([...cart, { ...product, quantity: 1, type: 'product' }]);
        }
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const calculateTotal = () => {
        return cart.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);
    };

    const handleSubmit = async () => {
        if (!customer.name || cart.length === 0) return alert("Please fill customer details and add items");

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/billing`, {
                customerName: customer.name,
                customerPhone: customer.phone,
                items: cart,
                total: calculateTotal(),
                date: new Date().toISOString()
            });
            setShowPrint({ ...res.data, customerInfo: customer, cartItems: cart });
            setCart([]);
            setCustomer({ name: '', phone: '' });
        } catch (err) {
            alert(err.response?.data?.error || "Billing failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 lg:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 lg:p-8 rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-slate-100 mb-2">
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight italic uppercase">PRODUCT BILLING</h2>
                    <p className="text-[10px] lg:text-sm text-slate-400 font-bold uppercase tracking-widest mt-0.5 lg:mt-1">Generate invoices and manage sales</p>
                </div>
                <div className="flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2 lg:py-3 bg-emerald-50 text-emerald-600 rounded-xl lg:rounded-2xl border border-emerald-100 shadow-sm">
                    <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest">{cart.length} Items in Cart</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                {/* Product Selection */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2 shrink-0">
                                <ShoppingCart className="w-5 h-5 text-primary-500" /> Select Products
                            </h3>
                            <div className="relative w-full md:w-64 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="p-4 border border-slate-100 rounded-xl hover:border-primary-200 hover:bg-primary-50/30 transition-all group cursor-pointer" onClick={() => addToCart(product)}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-800">{product.name}</h4>
                                            <p className="text-sm text-slate-500">Stock: {product.stock}</p>
                                            <p className="text-lg font-bold text-primary-600 mt-2">₹{product.sellingPrice}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cart & Billing Info */}
                <div className="space-y-4 lg:space-y-6">
                    <div className="card bg-slate-900 text-white border-0 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <h3 className="text-lg lg:text-xl font-bold flex items-center gap-2 mb-4 lg:mb-6">
                            <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" /> Current Bill
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-primary-400" />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Details</span>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <input
                                    type="text"
                                    placeholder="Customer Name"
                                    className="w-full bg-slate-800 border-0 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 text-sm placeholder:text-slate-600"
                                    value={customer.name}
                                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    className="w-full bg-slate-800 border-0 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 text-sm placeholder:text-slate-600"
                                    value={customer.phone}
                                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 min-h-[200px]">
                            {cart.length === 0 && <p className="text-slate-500 text-center py-8 italic">No items added yet</p>}
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-800">
                                    <div>
                                        <p className="font-bold text-sm">{item.name}</p>
                                        <p className="text-xs text-slate-400">{item.quantity} x ₹{item.sellingPrice}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold">₹{item.quantity * item.sellingPrice}</span>
                                        <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-rose-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
                            <div className="flex justify-between text-lg">
                                <span className="font-semibold text-slate-400">Grand Total</span>
                                <span className="font-black text-2xl text-primary-400">₹{calculateTotal()}</span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-900/40 disabled:opacity-50"
                            >
                                {loading ? "Processing..." : <><Printer className="w-5 h-5" /> Generate & Print Bill</>}
                            </button>
                        </div>
                    </div>
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
        </div>
    );
}
