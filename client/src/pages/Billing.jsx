import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, Trash2, Printer, Search, User, Phone, ShoppingBag, Receipt, ChevronDown, Ban } from 'lucide-react';
import PrintInvoice from '../components/PrintInvoice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Billing() {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState({ name: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [showPrint, setShowPrint] = useState(null);
    const [extraDiscount, setExtraDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [bills, setBills] = useState([]);
    const [showInvoices, setShowInvoices] = useState(false);
    const [invoiceSearch, setInvoiceSearch] = useState('');
    const [invoicePeriod, setInvoicePeriod] = useState('all');
    const invoicesRef = useRef(null);

    const toggleInvoices = () => {
        setShowInvoices(prev => {
            const next = !prev;
            if (next) {
                // wait for the section to render, then smooth-scroll to it
                setTimeout(() => {
                    invoicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 60);
            }
            return next;
        });
    };

    const fetchBills = async () => {
        try {
            const res = await axios.get(`${API_URL}/billing`);
            setBills(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            const res = await axios.get(`${API_URL}/products`);
            setProducts(res.data);
        };
        fetchProducts();
        fetchBills();
    }, []);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const periodStart = () => {
        const now = new Date();
        if (invoicePeriod === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (invoicePeriod === 'week') {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            d.setDate(d.getDate() - d.getDay());
            return d;
        }
        if (invoicePeriod === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
        if (invoicePeriod === 'year') return new Date(now.getFullYear(), 0, 1);
        return null; // all
    };

    const filteredBills = bills.filter(bill => {
        const q = invoiceSearch.toLowerCase().trim();
        const matchesSearch = !q ||
            (bill.invoiceNo || '').toLowerCase().includes(q) ||
            (bill.customerName || '').toLowerCase().includes(q) ||
            (bill.customerPhone || '').includes(q);
        const start = periodStart();
        const matchesPeriod = !start || (bill.date && new Date(bill.date) >= start);
        return matchesSearch && matchesPeriod;
    });

    // A cancelled sale stays visible in the list (full history/audit trail)
    // but must never count toward the displayed total.
    const filteredBillsTotal = filteredBills
        .filter(b => b.status !== 'Cancelled')
        .reduce((sum, b) => sum + Number(b.total || 0), 0);

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

    const decrementFromCart = (id) => {
        setCart(prev => prev.flatMap(item => {
            if (item.id !== id) return [item];
            if (item.quantity <= 1) return [];
            return [{ ...item, quantity: item.quantity - 1 }];
        }));
    };

    const cartQty = (id) => cart.find(item => item.id === id)?.quantity || 0;

    const calculateSubtotal = () => {
        return cart.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() - (parseFloat(extraDiscount) || 0);
    };

    const handleSubmit = async () => {
        if (!customer.name || cart.length === 0) return alert("Please fill customer details and add items");

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/billing`, {
                customerName: customer.name,
                customerPhone: customer.phone,
                items: cart,
                subtotal: calculateSubtotal(),
                extraDiscount: parseFloat(extraDiscount) || 0,
                total: calculateTotal(),
                paymentMethod: paymentMethod,
                date: new Date().toISOString()
            });
            setShowPrint({ ...res.data, customerInfo: customer, cartItems: cart });
            setCart([]);
            setCustomer({ name: '', phone: '' });
            setExtraDiscount(0);
            setPaymentMethod('Cash');
            fetchBills();
        } catch (err) {
            alert(err.response?.data?.error || "Billing failed");
        } finally {
            setLoading(false);
        }
    };

    // Cancel a sale. This never hard-deletes the invoice — it stays visible
    // in the list with a Cancelled badge (full financial/audit history is
    // preserved). Whether stock is restored depends on an explicit answer
    // to "did the goods come back to the shop?", never an automatic guess.
    const cancelBill = async (bill) => {
        if (bill.status === 'Cancelled') return; // already cancelled, nothing to do

        if (!window.confirm(`Cancel invoice #${bill.invoiceNo}? This cannot be undone.`)) return;

        const restoreStock = window.confirm(
            "Were the item(s) returned to the shop?\n\n" +
            "Click OK to restore them to stock.\n" +
            "Click Cancel if the goods were NOT returned (stock stays as sold)."
        );

        try {
            await axios.put(`${API_URL}/billing/${bill.id}/cancel`, { restoreStock });
            fetchBills();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to cancel invoice");
        }
    };

    return (
        <div className="space-y-4 lg:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 lg:p-8 rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-slate-100 mb-2">
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight italic uppercase">PRODUCT BILLING</h2>
                    <p className="text-[10px] lg:text-sm text-slate-400 font-bold uppercase tracking-widest mt-0.5 lg:mt-1">Generate invoices and manage sales</p>
                </div>
                <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
                    <button
                        onClick={toggleInvoices}
                        className={`flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl border text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${showInvoices ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                        <Receipt className="w-4 h-4 lg:w-5 lg:h-5" />
                        <span className="hidden sm:inline">{showInvoices ? 'Hide' : 'Show'} Recent Invoices</span>
                        <span className="sm:hidden">Invoices</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showInvoices ? 'rotate-180' : ''}`} />
                    </button>
                    <div className="flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2 lg:py-3 bg-emerald-50 text-emerald-600 rounded-xl lg:rounded-2xl border border-emerald-100 shadow-sm">
                        <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
                        <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest">{cart.length} <span className="hidden sm:inline">Items in Cart</span></span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                {/* Product Selection */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div className="flex items-center gap-3 shrink-0">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5 text-primary-500" /> Select Products
                                </h3>
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {filteredProducts.length}
                                </span>
                            </div>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                            {filteredProducts.length === 0 && (
                                <div className="sm:col-span-2 py-16 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                        <Search className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                        {products.length === 0 ? 'No products in inventory yet' : 'No products match your search'}
                                    </p>
                                </div>
                            )}
                            {filteredProducts.map(product => {
                                const qty = cartQty(product.id);
                                const outOfStock = product.stock < 1;
                                const maxed = qty >= product.stock;
                                const lowStock = product.stock > 0 && product.stock < 5;
                                return (
                                    <div
                                        key={product.id}
                                        className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${outOfStock
                                            ? 'border-slate-100 bg-slate-50/60 opacity-60'
                                            : qty > 0
                                                ? 'border-primary-300 bg-primary-50/40 shadow-sm'
                                                : 'border-slate-100 hover:border-primary-200 hover:bg-primary-50/20'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${qty > 0 ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-600'}`}>
                                                <ShoppingBag className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-bold text-slate-800 leading-tight truncate">{product.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${outOfStock
                                                        ? 'bg-rose-100 text-rose-600'
                                                        : lowStock
                                                            ? 'bg-amber-100 text-amber-600'
                                                            : 'bg-emerald-100 text-emerald-600'}`}>
                                                        {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            <p className="text-lg font-black text-primary-600">₹{product.sellingPrice}</p>
                                            {qty === 0 ? (
                                                <button
                                                    type="button"
                                                    disabled={outOfStock}
                                                    onClick={() => addToCart(product)}
                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-900"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Add
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2 bg-white border border-primary-200 rounded-xl p-1 shadow-sm">
                                                    <button
                                                        type="button"
                                                        onClick={() => decrementFromCart(product.id)}
                                                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-rose-100 hover:text-rose-600 active:scale-90 transition-all"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-7 text-center font-black text-slate-900 tabular-nums">{qty}</span>
                                                    <button
                                                        type="button"
                                                        disabled={maxed}
                                                        onClick={() => addToCart(product)}
                                                        className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Cart & Billing Info */}
                <div className="space-y-4 lg:space-y-6 lg:sticky lg:top-24 h-fit">
                    <div className="card bg-slate-900 text-white border-0 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="flex items-center justify-between mb-4 lg:mb-6 relative z-10">
                            <h3 className="text-lg lg:text-xl font-bold flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 text-primary-400" /> Current Bill
                            </h3>
                            <span className="px-2.5 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-300">
                                {cart.reduce((n, i) => n + i.quantity, 0)} item{cart.reduce((n, i) => n + i.quantity, 0) === 1 ? '' : 's'}
                            </span>
                        </div>

                        <div className="space-y-3 mb-6 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Customer Details</span>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Customer Name"
                                        className="w-full bg-slate-800 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-slate-500 outline-none transition-all"
                                        value={customer.name}
                                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                    />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        className="w-full bg-slate-800 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-slate-500 outline-none transition-all"
                                        value={customer.phone}
                                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar-dark -mr-2 pr-2 relative z-10">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-3">
                                        <ShoppingCart className="w-6 h-6 text-slate-600" />
                                    </div>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Cart is empty</p>
                                    <p className="text-slate-600 text-[11px] mt-1">Add products to start a bill</p>
                                </div>
                            ) : cart.map(item => (
                                <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-slate-800/80 last:border-0">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-sm truncate">{item.name}</p>
                                        <p className="text-[11px] text-slate-400">₹{item.sellingPrice} each</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 shrink-0">
                                        <button onClick={() => decrementFromCart(item.id)} className="w-6 h-6 rounded-md bg-slate-700 text-slate-300 flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-400 active:scale-90 transition-all">
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="w-6 text-center text-sm font-black tabular-nums">{item.quantity}</span>
                                        <button
                                            onClick={() => addToCart(item)}
                                            disabled={item.quantity >= item.stock}
                                            className="w-6 h-6 rounded-md bg-primary-600 text-white flex items-center justify-center hover:bg-primary-500 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="w-16 text-right shrink-0">
                                        <span className="font-black text-sm">₹{(item.quantity * item.sellingPrice).toLocaleString()}</span>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-slate-600 hover:text-rose-500 transition-colors shrink-0">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
                            <div className="flex justify-between items-center px-3">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subtotal</span>
                                <span className="text-sm font-bold text-slate-300">₹{calculateSubtotal()}</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Extra Discount (₹)</span>
                                <input
                                    type="number"
                                    className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 text-sm font-bold text-right text-primary-400 outline-none"
                                    value={extraDiscount}
                                    onChange={(e) => setExtraDiscount(e.target.value)}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Payment Method</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setPaymentMethod('Cash')}
                                        className={`py-2 rounded-xl text-[10px] font-black transition-all border ${paymentMethod === 'Cash' ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-900/40' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                                    >
                                        CASH
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('UPI')}
                                        className={`py-2 rounded-xl text-[10px] font-black transition-all border ${paymentMethod === 'UPI' ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-900/40' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                                    >
                                        UPI
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between text-lg pt-2">
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
            </div>

            {/* Billing History Section */}
            {showInvoices && (
            <div ref={invoicesRef} className="scroll-mt-24 bg-white rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="px-6 lg:px-8 py-6 border-b border-slate-100 bg-white space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Recent Invoices</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">History of all generated bills</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                                Total: ₹{filteredBillsTotal.toLocaleString()}
                            </span>
                            <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                {filteredBills.length} {filteredBills.length === 1 ? 'sale' : 'sales'}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                        <div className="flex gap-1 p-1 bg-slate-50 rounded-2xl border border-slate-100 w-full sm:w-fit overflow-x-auto custom-scrollbar">
                            {['all', 'today', 'week', 'month', 'year'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setInvoicePeriod(p)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${invoicePeriod === p ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full lg:w-80 group shrink-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search invoice, name or phone..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all outline-none"
                                value={invoiceSearch}
                                onChange={(e) => setInvoiceSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left min-w-[620px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    <th className="px-8 py-5">Invoice No</th>
                                    <th className="px-6 py-5">Date</th>
                                    <th className="px-6 py-5">Customer</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5 text-right">Total</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredBills.map(bill => {
                                    const isCancelled = bill.status === 'Cancelled';
                                    return (
                                    <tr key={bill.id} className={`hover:bg-slate-50/50 transition-colors group ${isCancelled ? 'opacity-50' : ''}`}>
                                        <td className="px-8 py-4">
                                            <span className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-sm">
                                                {bill.invoiceNo || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-500">
                                            {new Date(bill.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700 underline decoration-primary-200 decoration-2 underline-offset-4">{bill.customerName}</span>
                                                <span className="text-[10px] text-slate-400 font-bold tracking-tight mt-0.5">{bill.customerPhone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isCancelled ? (
                                                <span className="inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100" title={bill.cancelReason || undefined}>
                                                    Cancelled{bill.stockRestored ? ' · Restocked' : ''}
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    Completed
                                                </span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 font-black text-base text-right font-mono italic ${isCancelled ? 'text-slate-400 line-through' : 'text-primary-600'}`}>₹{bill.total?.toLocaleString()}</td>
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setShowPrint({ ...bill, customerInfo: { name: bill.customerName, phone: bill.customerPhone }, cartItems: bill.items })}
                                                    className="p-2.5 bg-slate-50 text-slate-500 hover:bg-primary-50 hover:text-primary-600 rounded-xl border border-slate-100 transition-all active:scale-95"
                                                    title="Reprint Invoice"
                                                >
                                                    <Printer className="w-4 h-4 lg:w-5 lg:h-5" />
                                                </button>
                                                {!isCancelled && (
                                                    <button
                                                        onClick={() => cancelBill(bill)}
                                                        className="p-2.5 bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl border border-slate-100 transition-all active:scale-95"
                                                        title="Cancel Sale"
                                                    >
                                                        <Ban className="w-4 h-4 lg:w-5 lg:h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredBills.length === 0 && (
                            <div className="p-20 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <ShoppingCart className="w-8 h-8 text-slate-200" />
                                </div>
                                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    {bills.length === 0 ? 'No invoice history found' : 'No invoices match your search'}
                                </h3>
                            </div>
                        )}
                    </div>
                </div>
                )}
                {showPrint && (
                    <PrintInvoice
                        bill={showPrint}
                        customer={showPrint.customerInfo}
                        items={showPrint.cartItems}
                        total={showPrint.total}
                        onClose={() => setShowPrint(null)}
                    />
                )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar-dark::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar-dark::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
            `}</style>
        </div>
    );
}
