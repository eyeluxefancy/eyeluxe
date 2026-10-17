import { createPortal } from 'react-dom';
import logo from '../assets/logo.png';

// Resolve a line item's unit price, whichever field the data happens to
// carry: a freshly-created bill passes sellingPrice/rentalPrice straight
// from the cart, while a reloaded bill from the database carries `price`.
const unitPrice = (item) => parseFloat(item.price ?? item.sellingPrice ?? item.rentalPrice ?? 0);

export default function PrintInvoice({ bill, customer, items, total, onClose }) {
    const handlePrint = () => {
        window.print();
    };

    const subtotal = parseFloat(total) + parseFloat(bill?.extraDiscount || 0);
    const discount = parseFloat(bill?.extraDiscount || 0);
    const dateStr = new Date(bill?.date || new Date()).toLocaleDateString('en-GB');

    // We use a Portal to move the invoice to the end of <body>.
    // This allows us to hide the entire #root app during print WITHOUT hiding the invoice.
    return createPortal(
        <div id="print-container" className="fixed inset-0 z-[101] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
            {/* On-screen preview card — fully hidden when printing (print:hidden).
                What actually prints is the plain .receipt-plain block below. */}
            <div className="print:hidden bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="bg-white">
                        <div className="p-6 md:p-10 border-b-2 border-slate-100 flex justify-between items-center bg-white">
                            <div className="flex items-center">
                                <div className="w-32 h-32 md:w-56 md:h-56 overflow-hidden flex items-center justify-center">
                                    <img src={logo} alt="EYELUXE Logo" className="w-full scale-[2.2] object-contain mix-blend-multiply translate-y-[12%] translate-x-[-5%]" />
                                </div>
                                <div className="flex flex-col -ml-6 md:-ml-12">
                                    <h1 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-1 md:mb-2">EYELUXE</h1>
                                    <p className="text-[8px] md:text-base text-primary-600 font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase leading-none">Cosmetics & Bridal Fancy</p>
                                    <p className="text-[8px] md:text-[10px] text-slate-400 font-black mt-1">Ph: <span className="text-slate-600">8078768999</span></p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">{bill?.title || 'INVOICE'}</h2>
                                <div className="mt-1 md:mt-2">
                                    <p className="text-xs md:text-sm text-slate-500 font-bold tracking-tight">#{bill?.invoiceNo || 'DRAFT'}</p>
                                    <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{dateStr}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 grid grid-cols-2 gap-6 md:gap-10 bg-white">
                            <div>
                                <p className="text-[8px] md:text-[10px] uppercase font-black text-primary-500 tracking-[0.2em] mb-1 md:mb-2">Bill To</p>
                                <h3 className="text-base md:text-lg font-bold text-slate-900 leading-tight">{customer.name}</h3>
                                <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5 md:mt-1">{customer.phone}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] md:text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1 md:mb-2">Payment Info</p>
                                <div className="inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-2.5 py-0.5 md:py-1 bg-emerald-50 rounded-full border border-emerald-100">
                                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-500"></span>
                                    <span className="text-[7px] md:text-[9px] font-black text-emerald-700 uppercase tracking-wider">PAID</span>
                                </div>
                                <p className="text-[10px] md:text-xs text-slate-600 font-bold mt-1.5 md:mt-2">Method: <span className="text-slate-900">{bill?.paymentMethod || 'Cash / UPI'}</span></p>
                            </div>
                        </div>

                        <div className="px-6 md:px-8 pb-4 md:pb-6">
                            <div className="rounded-xl md:2xl border border-slate-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-[8px] md:text-[10px] font-black uppercase text-slate-500 tracking-[0.15em]">
                                            <th className="px-4 md:px-6 py-2 md:py-3">Item Details</th>
                                            <th className="px-2 md:px-4 py-2 md:py-3 text-center">Qty</th>
                                            <th className="px-2 md:px-4 py-2 md:py-3 text-right">Price</th>
                                            <th className="px-4 md:px-6 py-2 md:py-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {items.map((item, idx) => (
                                            <tr key={idx} className={`text-xs md:text-sm group ${item.rentalPrice < 0 ? 'bg-slate-50/50' : ''}`}>
                                                <td className="px-4 md:px-6 py-3 md:py-4">
                                                    <p className={`font-bold leading-tight mb-0.5 ${item.rentalPrice < 0 ? 'text-emerald-600' : 'text-slate-800'}`}>{item.name}</p>
                                                    <span className="text-[7px] md:text-[9px] font-black text-primary-400 uppercase tracking-widest">{item.rentalPrice < 0 ? 'Deduction' : (bill?.type || 'General Sale')}</span>
                                                </td>
                                                <td className="px-2 md:px-4 py-3 md:py-4 text-center text-slate-600 font-bold">{item.quantity}</td>
                                                <td className="px-2 md:px-4 py-3 md:py-4 text-right text-slate-500 font-medium">₹{Math.abs(unitPrice(item)).toLocaleString()}</td>
                                                <td className={`px-4 md:px-6 py-3 md:py-4 text-right font-black ${item.rentalPrice < 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                    {item.rentalPrice < 0 ? '-' : ''}₹{Math.abs(parseFloat(item.quantity) * unitPrice(item)).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="px-6 md:px-8 pb-6 md:pb-8 flex justify-end">
                            <div className="w-56 md:w-72 space-y-2 md:space-y-3 bg-slate-900 p-4 md:p-6 rounded-[1.2rem] md:rounded-[1.5rem] text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-primary-500/10 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16 blur-3xl"></div>
                                <div className="flex justify-between text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-60">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-primary-400">
                                        <span>Extra Discount</span>
                                        <span>-₹{discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 md:pt-3 border-t border-white/10">
                                    <span className="text-[9px] md:text-xs font-black uppercase tracking-widest">Total</span>
                                    <span className="text-lg md:text-2xl font-black italic tracking-tighter">₹{parseFloat(total).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 md:px-8 pb-8 md:pb-10">
                            <div className="p-4 md:p-6 bg-slate-50 rounded-xl md:2xl border border-slate-100 flex flex-col items-center text-center">
                                <p className="text-xs md:text-sm text-slate-800 font-black mb-1 uppercase tracking-widest italic leading-tight">Your trust is our pride!</p>
                                <p className="text-[8px] md:text-[10px] text-slate-400 font-bold leading-relaxed max-w-sm">This receipt confirms your purchase at <span className="text-primary-600">EYELUXE</span>.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white border-t border-slate-100 flex gap-4 shrink-0">
                    <button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase text-[10px] tracking-[0.2em] active:scale-95 leading-none">Close</button>
                    <button onClick={handlePrint} className="flex-[2.5] py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-500 transition-all flex items-center justify-center gap-4 uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-primary-200 active:scale-[0.98] leading-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        Confirm & Print Bill
                    </button>
                </div>
            </div>

            {/* ── The actual printed receipt ──────────────────────────────
                Plain classic POS layout: centered header text, dashed-line
                separators, flex rows (no <table>, no boxes, no rounded
                corners). This is what a thermal printer actually renders —
                simple left/right rows can never get clipped the way a
                multi-column boxed table did. Hidden on screen; shown only
                when printing. */}
            <div className="receipt-plain hidden">
                {/* Header: brand on the left, invoice no. on the right —
                    each side can wrap independently, so neither side is
                    ever pushed off the page by the other. */}
                <div className="r-head">
                    <div className="r-brand">
                        <h1>EYELUXE</h1>
                        <p>Cosmetics &amp; Bridal Fancy</p>
                        <p>Ph: 8078768999</p>
                    </div>
                    <div className="r-invoice-no">
                        <p className="r-invoice-label">{bill?.title || 'INVOICE'}</p>
                        <p>#{bill?.invoiceNo || 'DRAFT'}</p>
                        <p>{dateStr}</p>
                    </div>
                </div>

                <div className="r-hr r-hr-solid" />

                {/* Customer on the left, payment status on the right */}
                <div className="r-row r-customer-row">
                    <span className="r-customer-name">{customer?.name || 'No Name'}{customer?.phone ? ` · ${customer.phone}` : ''}</span>
                    <span className="r-pay-status">
                        <span className="r-pay-badge">● PAID</span>
                        <span className="r-pay-method">Method: {bill?.paymentMethod || 'Cash'}</span>
                    </span>
                </div>

                <div className="r-hr" />

                {/* Item table header */}
                <div className="r-cols r-cols-head">
                    <span className="r-col-name">Item Details</span>
                    <span className="r-col-qty">Qty</span>
                    <span className="r-col-price">Price</span>
                    <span className="r-col-amt">Amount</span>
                </div>

                <div className="r-hr" />

                {items.map((item, idx) => {
                    const price = unitPrice(item);
                    const lineTotal = parseFloat(item.quantity) * price;
                    const isDeduction = item.rentalPrice < 0;
                    return (
                        <div key={idx} className="r-cols r-item-row">
                            <span className="r-col-name">
                                {item.name}
                                <span className="r-item-type">{isDeduction ? 'Deduction' : (bill?.type || 'General Sale')}</span>
                            </span>
                            <span className="r-col-qty">{item.quantity}</span>
                            <span className="r-col-price">₹{Math.abs(price).toLocaleString()}</span>
                            <span className="r-col-amt">{isDeduction ? '-' : ''}₹{Math.abs(lineTotal).toLocaleString()}</span>
                        </div>
                    );
                })}

                <div className="r-hr" />

                <div className="r-row r-subtle">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                    <div className="r-row r-subtle">
                        <span>Discount</span>
                        <span>-₹{discount.toLocaleString()}</span>
                    </div>
                )}

                <div className="r-hr r-hr-solid" />

                <div className="r-row r-total">
                    <span>TOTAL</span>
                    <span>₹{parseFloat(total).toLocaleString()}</span>
                </div>

                <div className="r-hr" />

                <div className="r-center r-footer">
                    <p>Your trust is our pride!</p>
                    <p>This receipt confirms your purchase at EYELUXE.</p>
                </div>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

        /* Plain receipt — screen defaults (irrelevant until printed, since
           the block is display:none outside @media print) */
        .receipt-plain, .receipt-plain * {
          box-sizing: border-box;
          font-family: Arial, Helvetica, sans-serif;
        }
        .r-center { text-align: center; }

        /* Header: brand (left) + invoice no./date (right). Each side wraps
           independently (flex-wrap + min-width:0) so a long brand line can
           never push the invoice number off the page, and vice versa. */
        .r-head { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 8px; }
        .r-brand { flex: 1 1 auto; min-width: 0; }
        .r-brand h1 { font-size: 18px; font-weight: 900; margin: 0; letter-spacing: 0.01em; }
        .r-brand p { font-size: 10px; font-weight: 700; margin: 2px 0 0; text-transform: uppercase; }
        .r-invoice-no { flex-shrink: 0; text-align: right; font-size: 10px; font-weight: 700; }
        .r-invoice-no p { margin: 0; }
        .r-invoice-label { text-transform: uppercase; font-size: 11px !important; font-weight: 900 !important; }

        .r-hr { border-top: 1px dashed #000; margin: 5px 0; }
        .r-hr-solid { border-top: 1.5px solid #000; border-top-style: solid; }

        /* flex-wrap + flex-shrink:0 on the right-hand span means a long
           label wraps onto its own line instead of ever pushing the value
           (the part that must never be cut off) past the page edge. */
        .r-row { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 2px 8px; font-size: 11px; font-weight: 700; }
        .r-row > span:first-child { text-align: left; flex: 1 1 auto; min-width: 0; }
        .r-row > span:last-child { text-align: right; white-space: nowrap; flex-shrink: 0; }
        .r-total { font-size: 15px; font-weight: 900; }

        /* Customer + payment status row */
        .r-customer-name { text-transform: uppercase; }
        .r-pay-status { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
        .r-pay-badge { font-size: 10px; }
        .r-pay-method { font-size: 10px; font-weight: 700; }

        /* Item "table" — built from flex rows, not a real <table>, so a
           column can shrink/wrap instead of clipping. Qty/Price/Amount get
           a fixed width (flex-shrink:0); the name column takes whatever
           space is left and wraps if it has to. */
        .r-cols { display: flex; align-items: flex-start; gap: 4px; font-size: 11px; font-weight: 700; padding: 3px 0; }
        .r-cols-head { text-transform: uppercase; font-size: 10px; font-weight: 900; }
        .r-col-name { flex: 1 1 auto; min-width: 0; word-break: break-word; text-align: left; }
        .r-col-qty { flex: 0 0 16px; text-align: center; }
        .r-col-price { flex: 0 0 34px; text-align: right; }
        .r-col-amt { flex: 0 0 40px; text-align: right; font-weight: 900; }
        .r-item-row { border-bottom: 1px dashed #000; }
        .r-item-row:last-of-type { border-bottom: none; }
        .r-item-type { display: block; font-size: 9px; font-weight: 700; text-transform: uppercase; margin-top: 1px; }

        .r-footer p { font-size: 10px; font-weight: 700; margin: 2px 0; text-transform: uppercase; letter-spacing: 0.03em; }

        @media print {
          @page {
            margin: 0mm;
            /* Standard 80mm thermal roll. A properly configured 80mm
               printer (most Bluetooth ESC/POS printers included) has a
               genuine ~72mm printable width — rendering at the correct
               width avoids the printer/OS having to upscale a smaller
               image, which is what actually causes blurry small text. */
            size: 80mm auto;
          }

          /* Hide the whole app; only #print-container (moved to <body> by
             the Portal) and, inside it, the plain receipt are shown. */
          #root {
            display: none !important;
          }

          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
          }

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
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            transition: none !important;
            animation: none !important;
          }

          .receipt-plain {
            display: block !important;
            width: 100% !important;
            /* 60mm content width on an 80mm roll. Our flex-based "columns"
               (not a <table>) wrap instead of clipping if a specific
               printer's real printable area is ever narrower than this —
               see .r-cols / .r-col-name above. */
            max-width: 60mm !important;
            margin: 0 auto !important;
            padding: 4px 3px !important;
            color: #000 !important;
          }

          /* Plain solid black, no artificial stroke/shadow thickening.
             A text-shadow/text-stroke "double strike" can look fine on a
             direct vector print but renders as thick, blurred text once a
             different pipeline (e.g. an Android ESC/POS Bluetooth print
             service) rasterizes the page into a bitmap first — the small
             offset strokes get smeared together. Plain bold weight is
             crisp across every printing path. */
          .receipt-plain * {
            color: #000 !important;
          }
        }
      `}</style>
        </div>,
        document.body
    );
}
