import logo from '../assets/logo.png';

export default function PrintInvoice({ bill, customer, items, total, onClose }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[101] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:w-full print:max-w-none print:rounded-none">

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto print:overflow-visible custom-scrollbar">
                    <div className="print-section">
                        <div className="p-10 border-b-2 border-slate-100 flex justify-between items-center bg-white">
                            <div className="flex items-center">
                                <div className="w-56 h-56 overflow-hidden flex items-center justify-center">
                                    <img src={logo} alt="EYELUXE Logo" className="w-full scale-[2.2] object-contain mix-blend-multiply translate-y-[12%] translate-x-[-5%]" />
                                </div>
                                <div className="flex flex-col -ml-12">
                                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-2">EYELUXE</h1>
                                    <p className="text-base text-primary-600 font-bold tracking-[0.3em] uppercase leading-none">Cosmetics & Bridal Fancy</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">{bill?.title || 'INVOICE'}</h2>
                                <div className="mt-2">
                                    <p className="text-sm text-slate-500 font-bold tracking-tight">#{bill?.invoiceNo || 'DRAFT'}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{new Date(bill?.date || new Date()).toLocaleDateString('en-GB')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-2 gap-10 bg-white">
                            <div>
                                <p className="text-[10px] uppercase font-black text-primary-500 tracking-[0.2em] mb-2">Bill To</p>
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">{customer.name}</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">{customer.phone}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-2">Payment Info</p>
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider">PAID</span>
                                </div>
                                <p className="text-xs text-slate-600 font-bold mt-2">Method: <span className="text-slate-900">Cash / UPI</span></p>
                            </div>
                        </div>

                        <div className="px-8 pb-6">
                            <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-500 tracking-[0.15em]">
                                            <th className="px-6 py-3">Item Details</th>
                                            <th className="px-4 py-3 text-center">Qty</th>
                                            <th className="px-4 py-3 text-right">Price</th>
                                            <th className="px-6 py-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {items.map((item, idx) => (
                                            <tr key={idx} className={`text-sm group ${item.rentalPrice < 0 ? 'bg-slate-50/50' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <p className={`font-bold leading-tight mb-0.5 ${item.rentalPrice < 0 ? 'text-emerald-600' : 'text-slate-800'}`}>{item.name}</p>
                                                    <span className="text-[9px] font-black text-primary-400 uppercase tracking-widest">{item.rentalPrice < 0 ? 'Deduction' : (bill?.type || 'General Sale')}</span>
                                                </td>
                                                <td className="px-4 py-4 text-center text-slate-600 font-bold">{item.quantity}</td>
                                                <td className="px-4 py-4 text-right text-slate-500 font-medium">₹{Math.abs(parseFloat(item.sellingPrice || item.rentalPrice || 0)).toLocaleString()}</td>
                                                <td className={`px-6 py-4 text-right font-black ${item.rentalPrice < 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                    {item.rentalPrice < 0 ? '-' : ''}₹{Math.abs(parseFloat(item.quantity * (item.sellingPrice || item.rentalPrice || 0))).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="px-8 pb-8 flex justify-end">
                            <div className="w-72 space-y-3 bg-slate-900 p-6 rounded-[1.5rem] text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-60">
                                    <span>Subtotal</span>
                                    <span>₹{(parseFloat(total) + parseFloat(bill?.extraDiscount || 0)).toLocaleString()}</span>
                                </div>
                                {parseFloat(bill?.extraDiscount || 0) > 0 && (
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-primary-400">
                                        <span>Extra Discount</span>
                                        <span>-₹{parseFloat(bill.extraDiscount).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                                    <span className="text-xs font-black uppercase tracking-widest">Grand Total</span>
                                    <span className="text-2xl font-black italic tracking-tighter">₹{parseFloat(total).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 pb-10">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                                <p className="text-sm text-slate-800 font-black mb-1 uppercase tracking-widest italic leading-tight">Your trust is our pride!</p>
                                <p className="text-[10px] text-slate-400 font-bold leading-relaxed max-w-sm">This receipt confirms your purchase at <span className="text-primary-600">EYELUXE</span>.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white border-t border-slate-100 flex gap-4 print:hidden shrink-0">
                    <button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase text-[10px] tracking-[0.2em] active:scale-95 leading-none">Close</button>
                    <button onClick={handlePrint} className="flex-[2.5] py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-500 transition-all flex items-center justify-center gap-4 uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-primary-200 active:scale-[0.98] leading-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        Confirm & Print Bill
                    </button>
                </div>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        
        @media print {
          @page { margin: 0; size: auto; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 0;
            margin: 0;
            background: white !important;
          }
          .custom-scrollbar { overflow: visible !important; height: auto !important; }
        }
      `}</style>
        </div>
    );
}
