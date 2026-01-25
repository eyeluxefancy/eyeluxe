import { createPortal } from 'react-dom';
import logo from '../assets/logo.png';

export default function PrintInvoice({ bill, customer, items, total, onClose }) {
    const handlePrint = () => {
        window.print();
    };

    // We use a Portal to move the invoice to the end of <body>.
    // This allows us to hide the entire #root app during print WITHOUT hiding the invoice.
    return createPortal(
        <div id="print-container" className="fixed inset-0 z-[101] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:w-full print:max-w-none print:rounded-none">

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto print:overflow-visible custom-scrollbar">
                    <div className="print-section bg-white">
                        <div className="p-6 md:p-10 border-b-2 border-slate-100 flex justify-between items-center bg-white print:p-2 print:border-b">
                            <div className="flex items-center">
                                <div className="w-32 h-32 md:w-56 md:h-56 overflow-hidden flex items-center justify-center print:w-16 print:h-16">
                                    <img src={logo} alt="EYELUXE Logo" className="w-full scale-[2.2] object-contain mix-blend-multiply translate-y-[12%] translate-x-[-5%]" />
                                </div>
                                <div className="flex flex-col -ml-6 md:-ml-12 print:-ml-2">
                                    <h1 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-1 md:mb-2 print:text-xl">EYELUXE</h1>
                                    <p className="text-[8px] md:text-base text-primary-600 font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase leading-none print:text-[6px]">Cosmetics & Bridal Fancy</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight print:text-xs">{bill?.title || 'INVOICE'}</h2>
                                <div className="mt-1 md:mt-2 print:mt-0">
                                    <p className="text-xs md:text-sm text-slate-500 font-bold tracking-tight print:text-[8px]">#{bill?.invoiceNo || 'DRAFT'}</p>
                                    <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none print:text-[6px]">{new Date(bill?.date || new Date()).toLocaleDateString('en-GB')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 grid grid-cols-2 gap-6 md:gap-10 bg-white print:p-2 print:gap-2">
                            <div>
                                <p className="text-[8px] md:text-[10px] uppercase font-black text-primary-500 tracking-[0.2em] mb-1 md:mb-2 print:mb-0 print:text-[7px]">Bill To</p>
                                <h3 className="text-base md:text-lg font-bold text-slate-900 leading-tight print:text-[10px]">{customer.name}</h3>
                                <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5 md:mt-1 print:text-[8px] print:mt-0">{customer.phone}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] md:text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1 md:mb-2 print:mb-0 print:text-[7px]">Payment Info</p>
                                <div className="inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-2.5 py-0.5 md:py-1 bg-emerald-50 rounded-full border border-emerald-100 print:px-1 print:py-0">
                                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-500"></span>
                                    <span className="text-[7px] md:text-[9px] font-black text-emerald-700 uppercase tracking-wider print:text-[6px]">PAID</span>
                                </div>
                                <p className="text-[10px] md:text-xs text-slate-600 font-bold mt-1.5 md:mt-2 print:text-[8px] print:mt-0.5">Method: <span className="text-slate-900">{bill?.paymentMethod || 'Cash / UPI'}</span></p>
                            </div>
                        </div>

                        <div className="px-6 md:px-8 pb-4 md:pb-6 print:px-2 print:pb-1">
                            <div className="rounded-xl md:2xl border border-slate-100 overflow-hidden shadow-sm print:border-slate-200">
                                <table className="w-full text-left print:table">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-[8px] md:text-[10px] font-black uppercase text-slate-500 tracking-[0.15em] print:bg-slate-50/50 print:table-row">
                                            <th className="px-4 md:px-6 py-2 md:py-3 print:px-1 print:py-1 print:table-cell">Item Details</th>
                                            <th className="px-2 md:px-4 py-2 md:py-3 text-center print:px-1 print:py-1 print:table-cell">Qty</th>
                                            <th className="px-2 md:px-4 py-2 md:py-3 text-right print:px-1 print:py-1 print:table-cell">Price</th>
                                            <th className="px-4 md:px-6 py-2 md:py-3 text-right print:px-1 print:py-1 print:table-cell">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 print:divide-slate-100 print:table-row-group">
                                        {items.map((item, idx) => (
                                            <tr key={idx} className={`text-xs md:text-sm group ${item.rentalPrice < 0 ? 'bg-slate-50/50' : ''} print:text-[9px] print:table-row`}>
                                                <td className="px-4 md:px-6 py-3 md:py-4 print:px-1 print:py-0.5 print:table-cell">
                                                    <p className={`font-bold leading-tight mb-0.5 ${item.rentalPrice < 0 ? 'text-emerald-600' : 'text-slate-800'}`}>{item.name}</p>
                                                    <span className="text-[7px] md:text-[9px] font-black text-primary-400 uppercase tracking-widest print:text-[6px]">{item.rentalPrice < 0 ? 'Deduction' : (bill?.type || 'General Sale')}</span>
                                                </td>
                                                <td className="px-2 md:px-4 py-3 md:py-4 text-center text-slate-600 font-bold print:px-1 print:py-0.5 print:table-cell">{item.quantity}</td>
                                                <td className="px-2 md:px-4 py-3 md:py-4 text-right text-slate-500 font-medium print:px-1 print:py-0.5 print:table-cell">₹{Math.abs(parseFloat(item.sellingPrice || item.rentalPrice || 0)).toLocaleString()}</td>
                                                <td className={`px-4 md:px-6 py-3 md:py-4 text-right font-black ${item.rentalPrice < 0 ? 'text-emerald-600' : 'text-slate-900'} print:px-1 print:py-0.5 print:table-cell`}>
                                                    {item.rentalPrice < 0 ? '-' : ''}₹{Math.abs(parseFloat(item.quantity * (item.sellingPrice || item.rentalPrice || 0))).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="px-6 md:px-8 pb-6 md:pb-8 flex justify-end print:px-2 print:pb-2">
                            <div className="w-56 md:w-72 space-y-2 md:space-y-3 bg-slate-900 p-4 md:p-6 rounded-[1.2rem] md:rounded-[1.5rem] text-white relative overflow-hidden print:bg-slate-900 print:w-40 print:p-2 print:rounded-lg print:space-y-1">
                                <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-primary-500/10 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16 blur-3xl print:hidden"></div>
                                <div className="flex justify-between text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-60 print:text-[7px]">
                                    <span>Subtotal</span>
                                    <span>₹{(parseFloat(total) + parseFloat(bill?.extraDiscount || 0)).toLocaleString()}</span>
                                </div>
                                {parseFloat(bill?.extraDiscount || 0) > 0 && (
                                    <div className="flex justify-between text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-primary-400 print:text-[7px]">
                                        <span>Extra Discount</span>
                                        <span>-₹{parseFloat(bill.extraDiscount).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 md:pt-3 border-t border-white/10 print:pt-1">
                                    <span className="text-[9px] md:text-xs font-black uppercase tracking-widest print:text-[8px]">Total</span>
                                    <span className="text-lg md:text-2xl font-black italic tracking-tighter print:text-base">₹{parseFloat(total).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 md:px-8 pb-8 md:pb-10 print:px-2 print:pb-2">
                            <div className="p-4 md:p-6 bg-slate-50 rounded-xl md:2xl border border-slate-100 flex flex-col items-center text-center print:bg-transparent print:border-none print:p-0">
                                <p className="text-xs md:text-sm text-slate-800 font-black mb-1 uppercase tracking-widest italic leading-tight print:text-[8px]">Your trust is our pride!</p>
                                <p className="text-[8px] md:text-[10px] text-slate-400 font-bold leading-relaxed max-w-sm print:text-[6px]">This receipt confirms your purchase at <span className="text-primary-600">EYELUXE</span>.</p>
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
          @page { 
            margin: 0mm; 
            size: auto; 
          }
          
          /* AGGRESSIVE FIX: Hide the entire app root */
          #root {
            display: none !important;
          }

          /* Ensure the body allows the portal content to be shown */
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
          }

          /* The Portal moves this div to be a sibling of #root, so it's NOT hidden by #root { display: none } */
          #print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            display: block !important;
            background: white !important;
            z-index: 9999 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          #print-container > div {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: 320px !important;
            margin: 0 auto !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            transition: none !important;
            animation: none !important;
          }

          .custom-scrollbar, .overflow-y-auto {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
          }
        }
      `}</style>
        </div>,
        document.body
    );
}
