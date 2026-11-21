import React, { useState } from 'react';
import { 
  ShoppingCart, CheckCircle2, Clock, Truck, Package, Search, Phone, 
  MapPin, RotateCcw, MessageCircle, AlertCircle, ShieldCheck, XCircle, Check, Zap,
  Eye, Copy, X, ExternalLink, Printer
} from 'lucide-react';
import { Storage } from '../../shared/services/storage';

export default function OrderManager({ orders, products, onUpdateOrders }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [refundModalOrder, setRefundModalOrder] = useState(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const filteredOrders = (orders || []).filter(o => {
    if (!o) return false;
    const matchesFilter = 
      filter === 'ALL' ||
      (filter === 'AUTO' && (o.approvalType === 'AUTOMATIC_SMS_WEBHOOK' || o.paymentVerification === 'AUTO_VERIFIED')) ||
      (filter === 'VERIFY' && (o.status === 'PENDING_VERIFICATION' || o.paymentVerification === 'PENDING_VERIFICATION')) ||
      (filter === 'UNVERIFIED' && (o.status === 'PENDING_PAYMENT' || o.paymentVerification === 'REJECTED' || (!o.status?.includes('PAID') && o.status !== 'PROCESSING' && o.status !== 'SHIPPED'))) ||
      (filter === 'PAID' && (o.status === 'PAID_APPROVED' || o.status === 'PAID')) ||
      (filter === 'PROCESSING' && o.status === 'PROCESSING') ||
      (filter === 'SHIPPED' && o.status === 'SHIPPED') ||
      (filter === 'REFUNDED' && o.status === 'REFUNDED');

    const searchLower = (search || '').toLowerCase().trim();
    if (!searchLower) return matchesFilter;

    const idMatch = (o.id || o.orderId || '').toLowerCase().includes(searchLower);
    const nameMatch = (o.customerName || '').toLowerCase().includes(searchLower);
    const phoneMatch = String(o.phone || '').includes(searchLower);
    const utrMatch = String(o.utr || '').toLowerCase().includes(searchLower);

    return matchesFilter && (idMatch || nameMatch || phoneMatch || utrMatch);
  });

  // Verify Payment Action (Manual Admin Cross-Check against Bank Statement)
  const handleVerifyPayment = (orderId, isApproved) => {
    const target = (orders || []).find(o => o && o.id === orderId);
    if (!target) return;

    const newStatus = isApproved ? 'PAID_APPROVED' : 'PENDING_PAYMENT';
    const newVerification = isApproved ? 'MANUAL_VERIFIED' : 'REJECTED';

    const updated = (orders || []).map(ord => {
      if (ord && ord.id === orderId) {
        return {
          ...ord,
          status: newStatus,
          paymentVerification: newVerification,
          approvalType: isApproved ? 'MANUAL_ADMIN' : ord.approvalType,
          verifiedAt: isApproved ? new Date().toISOString() : null,
          verifiedBy: isApproved ? 'ADMIN' : null
        };
      }
      return ord;
    });

    // If approved, deduct stock
    if (isApproved && target.status !== 'PAID_APPROVED' && target.status !== 'PAID') {
      const storedProducts = Storage.getProducts() || products;
      const targetItems = target.items || [];
      const updatedProducts = (storedProducts || []).map(p => {
        const orderedItem = targetItems.find(it => it && it.name === p.name);
        if (orderedItem) {
          return { ...p, stockUnits: Math.max(0, p.stockUnits - (parseInt(orderedItem.qty) || 0)) };
        }
        return p;
      });
      Storage.saveProducts(updatedProducts);
    }

    Storage.saveOrders(updated);
    onUpdateOrders(updated);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    const target = (orders || []).find(o => o && o.id === orderId);

    const updated = (orders || []).map(ord => {
      if (ord && ord.id === orderId) {
        return { 
          ...ord, 
          status: newStatus,
          refundedAt: newStatus === 'REFUNDED' ? new Date().toISOString() : ord.refundedAt
        };
      }
      return ord;
    });

    // If marked as paid, deduct stock
    if (newStatus === 'PAID_APPROVED' && target && target.status !== 'PAID_APPROVED' && target.status !== 'PAID') {
      const storedProducts = Storage.getProducts() || products;
      const targetItems = target.items || [];
      const updatedProducts = (storedProducts || []).map(p => {
        const orderedItem = targetItems.find(it => it && it.name === p.name);
        if (orderedItem) {
          return { ...p, stockUnits: Math.max(0, p.stockUnits - (parseInt(orderedItem.qty) || 0)) };
        }
        return p;
      });
      Storage.saveProducts(updatedProducts);
    }

    // If REFUNDED: RESTORE STOCK AUTOMATICALLY (+Restock)
    if (newStatus === 'REFUNDED' && target && target.status !== 'REFUNDED') {
      const storedProducts = Storage.getProducts() || products;
      const targetItems = target.items || [];
      const updatedProducts = (storedProducts || []).map(p => {
        const orderedItem = targetItems.find(it => it && it.name === p.name);
        if (orderedItem) {
          return { ...p, stockUnits: (p.stockUnits || 0) + (parseInt(orderedItem.qty) || 0) };
        }
        return p;
      });
      Storage.saveProducts(updatedProducts);
    }

    Storage.saveOrders(updated);
    onUpdateOrders(updated);
    setRefundModalOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Order &amp; Refund Management</h2>
          <p className="text-xs text-slate-500">Track orders, manage production, and issue 1-click refunds with automatic stock restoration.</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search order ID or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'ALL', label: 'All Orders' },
          { id: 'AUTO', label: '⚡ Auto-Verified' },
          { id: 'VERIFY', label: '⏳ Verify UTR (Manual)' },
          { id: 'UNVERIFIED', label: '❌ Not Verified / Unpaid' },
          { id: 'PAID', label: 'Paid & Approved' },
          { id: 'PROCESSING', label: 'In Production' },
          { id: 'SHIPPED', label: 'Shipped' },
          { id: 'REFUNDED', label: 'Refunded' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <ShoppingCart size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No orders found</h3>
          <p className="text-xs text-slate-400 mt-1">Orders placed on the customer store will appear here in real-time.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Ordered Items</th>
                  <th className="py-3.5 px-4">Amount &amp; UTR</th>
                  <th className="py-3.5 px-4">Payment Verification</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4">Actions &amp; Refund</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map(o => (
                  <tr 
                    key={o.id || o.orderId || Math.random()} 
                    onClick={() => setSelectedOrderDetail(o)}
                    className="hover:bg-amber-50/60 transition-colors cursor-pointer group"
                    title="Click to view customer details and shipping address"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                      {o.id || o.orderId || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-amber-900 transition-colors flex items-center gap-1.5">
                        <span>{o.customerName || 'Anonymous Customer'}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                        <Phone size={10} className="text-amber-800" />
                        <span className="font-mono">{o.phone || 'N/A'}</span>
                        {o.phone && (
                          <a
                            href={`https://wa.me/91${String(o.phone).replace(/\D/g, '').slice(-10)}?text=Hello%20${encodeURIComponent(o.customerName || 'Customer')},%20regarding%20your%20order%20${o.id || o.orderId}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="ml-1 text-emerald-600 hover:text-emerald-700 p-0.5"
                            title="Message on WhatsApp"
                          >
                            <MessageCircle size={12} />
                          </a>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate max-w-[160px]" title={o.address || o.city || 'Thanjavur'}>
                        <MapPin size={10} className="text-amber-700 shrink-0" />
                        <span className="truncate">{o.address || o.city || 'Thanjavur'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedOrderDetail(o); }}
                        className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-[#7e5222] bg-amber-100/70 hover:bg-amber-200/90 px-2 py-0.5 rounded-md border border-amber-300 transition-colors shadow-2xs"
                      >
                        <Eye size={10} />
                        <span>View Address &amp; Customer</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      {(o.items || []).map((it, idx) => (
                        <div key={idx} className="text-slate-700">
                          <strong>{it?.qty || 1}x</strong> {it?.name || 'Bag'}
                          {it?.size && <span className="text-[10px] text-slate-400 ml-1">({it.size})</span>}
                        </div>
                      ))}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        ₹{(Number(o.totalAmount || o.amount || 0)).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        UTR: <strong className="text-stone-800">{o.utr || 'None'}</strong>
                      </div>
                    </td>

                    {/* Payment Verification Column */}
                    <td className="py-3.5 px-4">
                      {(o.approvalType === 'AUTOMATIC_SMS_WEBHOOK' || o.paymentVerification === 'AUTO_VERIFIED') && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
                            <ShieldCheck size={13} className="text-emerald-700 stroke-[2.5]" />
                            <span>⚡ Auto-Verified</span>
                          </span>
                          <p className="text-[10px] text-emerald-700 font-medium">Bank SMS Match ✔</p>
                        </div>
                      )}

                      {o.paymentVerification === 'MANUAL_VERIFIED' && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300 shadow-sm">
                            <CheckCircle2 size={13} className="text-blue-700 stroke-[2.5]" />
                            <span>✔ Verified (Admin)</span>
                          </span>
                          <p className="text-[10px] text-blue-700 font-medium">Bank Checked ✔</p>
                        </div>
                      )}

                      {(o.status === 'PENDING_VERIFICATION' || o.paymentVerification === 'PENDING_VERIFICATION') && o.paymentVerification !== 'MANUAL_VERIFIED' && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
                            <Clock size={12} className="text-amber-700" />
                            <span>⏳ Not Verified (Manual UTR)</span>
                          </span>
                          <p className="text-[10px] text-amber-800 font-mono">Needs Admin Check</p>
                        </div>
                      )}

                      {o.paymentVerification === 'REJECTED' && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-sm">
                            <XCircle size={12} className="text-rose-600" />
                            <span>❌ Not Verified (Rejected)</span>
                          </span>
                          <p className="text-[10px] text-rose-600 font-medium">Invalid / Missing</p>
                        </div>
                      )}

                      {o.status === 'PENDING_PAYMENT' && !o.paymentVerification && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-300 shadow-sm">
                            <AlertCircle size={12} className="text-stone-500" />
                            <span>❌ Not Verified (Unpaid)</span>
                          </span>
                          <p className="text-[10px] text-stone-500">Awaiting payment</p>
                        </div>
                      )}

                      {/* Fallback if status is PAID but no explicit verification tag */}
                      {(o.status === 'PAID_APPROVED' || o.status === 'PAID') && !o.approvalType && !o.paymentVerification && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
                            <CheckCircle2 size={13} className="text-emerald-700" />
                            <span>✔ Verified</span>
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Stage Column */}
                    <td className="py-3.5 px-4">
                      {o.status === 'PROCESSING' && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          <Package size={11} /> In Production
                        </span>
                      )}
                      {o.status === 'SHIPPED' && (
                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          <Truck size={11} /> Shipped
                        </span>
                      )}
                      {o.status === 'REFUNDED' && (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          <RotateCcw size={11} /> Refunded
                        </span>
                      )}
                      {(o.status === 'PAID_APPROVED' || o.status === 'PAID') && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                          Ready to Pack
                        </span>
                      )}
                      {(o.status === 'PENDING_PAYMENT' || o.status === 'PENDING_VERIFICATION') && (
                        <span className="text-[11px] text-stone-400">
                          Waiting for Payment
                        </span>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* View Details Button */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedOrderDetail(o); }}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#7e5222] border border-amber-300 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1"
                          title="Open customer details & shipping address"
                        >
                          <Eye size={12} />
                          <span>Details</span>
                        </button>

                        {/* Verify Payment Button */}
                        {(o.status === 'PENDING_VERIFICATION' || o.status === 'PENDING_PAYMENT' || o.paymentVerification === 'REJECTED' || o.paymentVerification === 'PENDING_VERIFICATION') && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleVerifyPayment(o.id, true); }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95"
                              title="Check bank account and confirm payment"
                            >
                              <Check size={12} />
                              <span>Verify &amp; Approve</span>
                            </button>

                            {o.status === 'PENDING_VERIFICATION' && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleVerifyPayment(o.id, false); }}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all"
                                title="Mark UTR as not found in statement"
                              >
                                Reject UTR
                              </button>
                            )}
                          </>
                        )}

                        {/* Production Workflow */}
                        {(o.status === 'PAID_APPROVED' || o.status === 'PAID') && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(o.id, 'PROCESSING'); }}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                              Pack
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleVerifyPayment(o.id, false); }}
                              className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-[11px] font-semibold"
                              title="Mark payment as not received"
                            >
                              Unverify
                            </button>
                          </>
                        )}

                        {o.status === 'PROCESSING' && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(o.id, 'SHIPPED'); }}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            Ship
                          </button>
                        )}

                        {/* Refund Action */}
                        {(o.status === 'PAID_APPROVED' || o.status === 'PAID' || o.status === 'PROCESSING') && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setRefundModalOrder(o); }}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                            title="Process refund"
                          >
                            <RotateCcw size={11} />
                            <span>Refund</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REFUND MODAL & INSTRUCTIONS */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-2 text-rose-700">
              <RotateCcw size={22} />
              <h3 className="text-base font-bold text-slate-900">Process Refund for {refundModalOrder.id}</h3>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Refund Amount:</span>
                <span className="font-extrabold text-slate-900 text-sm">₹{(Number(refundModalOrder.totalAmount || refundModalOrder.amount || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-800">{refundModalOrder.customerName || 'Customer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone (GPay UPI):</span>
                <span className="font-mono font-bold text-amber-900">{refundModalOrder.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction UTR:</span>
                <span className="font-mono text-slate-700">{refundModalOrder.utr || 'N/A'}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <AlertCircle size={13} />
                <span>UPI ID தெரியாமல் ரீஃபண்ட் செய்யும் 2 வழிகள்:</span>
              </div>
              <p>1. <strong>GPay Business App:</strong> உங்கள் வணிக போனில் Transactions &rarr; இந்த UTR-ஐ கிளிக் செய்து <strong>"Refund"</strong> தட்டினால் வாடிக்கையாளர் கணக்கிற்கே பணம் தானாக திரும்பிவிடும்.</p>
              <p>2. <strong>Mobile Number UPI:</strong> வாடிக்கையாளரின் போன் நம்பருக்கு ({refundModalOrder.phone}) Google Pay மூலம் நேரடியாக பணத்தை அனுப்பலாம்.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRefundModalOrder(null)}
                className="flex-1 py-2.5 border rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(refundModalOrder.id, 'REFUNDED')}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1"
              >
                <RotateCcw size={13} />
                <span>Confirm Refund &amp; Restock</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER & CUSTOMER DETAILS MODAL (வாடிக்கையாளர் விவரங்கள் மற்றும் அட்ரஸ் விண்டோ) */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-[#674221] text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black font-mono">
                    Order Ref: {selectedOrderDetail.id || selectedOrderDetail.orderId}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-900 shadow-sm">
                    {selectedOrderDetail.status || 'PAID'}
                  </span>
                </div>
                <p className="text-xs text-amber-200/80 mt-1">
                  Placed on {new Date(selectedOrderDetail.createdAt || selectedOrderDetail.timestamp || Date.now()).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetail(null)}
                className="p-2 hover:bg-white/10 rounded-full text-stone-300 hover:text-white transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              
              {/* Customer Profile & Quick Connect Card */}
              <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                      Customer Profile &amp; Contact
                    </span>
                    <h4 className="text-base font-extrabold text-stone-900 mt-0.5">
                      {selectedOrderDetail.customerName || 'Anonymous Customer'}
                    </h4>
                    <p className="text-xs font-mono text-stone-700 mt-1 flex items-center gap-1.5 font-bold">
                      <Phone size={13} className="text-[#7e5222]" />
                      <span>{selectedOrderDetail.phone || 'No phone provided'}</span>
                    </p>
                  </div>

                  {selectedOrderDetail.phone && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${selectedOrderDetail.phone}`}
                        className="px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-800 rounded-xl font-bold text-xs border border-stone-300 flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                      >
                        <Phone size={13} className="text-[#7e5222]" />
                        <span>Call Customer</span>
                      </a>
                      <a
                        href={`https://wa.me/91${String(selectedOrderDetail.phone).replace(/\D/g, '').slice(-10)}?text=Hello%20${encodeURIComponent(selectedOrderDetail.customerName || 'Customer')},%20we%20are%20processing%20your%20Classic%20Bags%20order%20(${selectedOrderDetail.id || selectedOrderDetail.orderId}).`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                      >
                        <MessageCircle size={14} />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Shipping Address Card */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 shadow-2xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#7e5222] uppercase tracking-wide">
                      <MapPin size={15} />
                      <span>Shipping / Delivery Address (டெலிவரி முகவரி)</span>
                    </div>
                    <p className="text-sm font-semibold text-stone-800 leading-relaxed whitespace-pre-line bg-white p-3 rounded-xl border border-stone-200">
                      {selectedOrderDetail.address || selectedOrderDetail.street || 'Address not entered'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 font-medium">
                      <span>City / Town: <strong className="text-stone-900">{selectedOrderDetail.city || 'Thanjavur'}</strong></span>
                      {selectedOrderDetail.pincode && (
                        <span>Pincode: <strong className="text-stone-900 font-mono">{selectedOrderDetail.pincode}</strong></span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const addrText = `${selectedOrderDetail.customerName}\nPhone: ${selectedOrderDetail.phone}\n${selectedOrderDetail.address || ''}\n${selectedOrderDetail.city || 'Thanjavur'}`;
                      navigator.clipboard.writeText(addrText);
                      setCopiedAddress(true);
                      setTimeout(() => setCopiedAddress(false), 2000);
                    }}
                    className="px-3 py-2 bg-white hover:bg-stone-100 text-stone-700 rounded-xl border border-stone-300 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm"
                    title="Copy full shipping label"
                  >
                    {copiedAddress ? (
                      <>
                        <Check size={13} className="text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Ordered Items Details */}
              <div className="space-y-2">
                <h5 className="font-bold uppercase tracking-wider text-stone-500 text-[11px]">
                  Ordered Bags &amp; Quantities ({selectedOrderDetail.items?.length || 0})
                </h5>
                <div className="space-y-2">
                  {(selectedOrderDetail.items || []).map((it, idx) => (
                    <div key={idx} className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-extrabold text-stone-900 text-sm">{it.name}</div>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-600 mt-1">
                            {it.size && <span className="bg-stone-100 px-2 py-0.5 rounded font-mono font-medium">Size: {it.size}</span>}
                            {it.gsm && <span className="bg-stone-100 px-2 py-0.5 rounded font-medium">{it.gsm} GSM</span>}
                            {it.handle && <span className="bg-stone-100 px-2 py-0.5 rounded font-medium">Handle: {it.handle}</span>}
                            <span className="text-[#7e5222] font-semibold">₹{Number(it.unitPrice || it.price || 0).toFixed(2)} / bag</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-stone-500 font-medium">Qty: <strong className="text-stone-900 text-sm font-black">{it.qty}</strong></div>
                          <div className="text-sm font-black text-emerald-700 mt-0.5">
                            ₹{Number(it.totalPrice || (it.unitPrice * it.qty) || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Custom Logo & Notes if present */}
                      {(it.logoPreview || it.logoFile || it.printNotes) && (
                        <div className="pt-2 border-t border-stone-100 bg-amber-50/50 p-2.5 rounded-xl space-y-1.5">
                          {it.printNotes && (
                            <p className="text-xs text-amber-900">
                              <strong>Print Instructions:</strong> {it.printNotes}
                            </p>
                          )}
                          {(it.logoPreview || it.logoFile) && (
                            <div className="flex items-center gap-3">
                              {it.logoPreview && (
                                <img
                                  src={it.logoPreview}
                                  alt="Custom Logo"
                                  className="w-14 h-14 object-contain bg-white rounded-lg border border-amber-200 p-1 shadow-sm"
                                />
                              )}
                              <div>
                                <p className="text-xs font-bold text-amber-950">Custom Shop Logo Artwork</p>
                                <p className="text-[10px] text-amber-800">{it.logoFile || 'Uploaded image attachment'}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Verification Summary */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400">Total Order Amount</span>
                  <div className="text-2xl font-black text-emerald-700">
                    ₹{Number(selectedOrderDetail.totalAmount || selectedOrderDetail.amount || 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-stone-600 font-mono mt-0.5">
                    UTR: <strong className="text-stone-900">{selectedOrderDetail.utr || 'None'}</strong> • Method: {selectedOrderDetail.paymentMethod || 'UPI Dynamic QR'}
                  </div>
                  {selectedOrderDetail.paymentVerification && (
                    <div className="mt-1">
                      <span className="inline-block text-[11px] font-bold text-emerald-700">
                        ● {selectedOrderDetail.paymentVerification === 'AUTO_VERIFIED' ? 'Auto-Matched via Bank SMS' : 'Verified by Factory Admin'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Workflow Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {(selectedOrderDetail.status === 'PENDING_VERIFICATION' || selectedOrderDetail.status === 'PENDING_PAYMENT') && (
                    <button
                      type="button"
                      onClick={() => {
                        handleVerifyPayment(selectedOrderDetail.id, true);
                        setSelectedOrderDetail(prev => ({ ...prev, status: 'PAID_APPROVED', paymentVerification: 'MANUAL_VERIFIED' }));
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Check size={14} />
                      <span>Verify &amp; Approve Payment</span>
                    </button>
                  )}

                  {selectedOrderDetail.status === 'PAID_APPROVED' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateStatus(selectedOrderDetail.id, 'PROCESSING');
                        setSelectedOrderDetail(prev => ({ ...prev, status: 'PROCESSING' }));
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                    >
                      Start Packing
                    </button>
                  )}

                  {selectedOrderDetail.status === 'PROCESSING' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateStatus(selectedOrderDetail.id, 'SHIPPED');
                        setSelectedOrderDetail(prev => ({ ...prev, status: 'SHIPPED' }));
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                    >
                      Mark as Shipped
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setRefundModalOrder(selectedOrderDetail);
                      setSelectedOrderDetail(null);
                    }}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 flex items-center gap-1 transition-all"
                  >
                    <RotateCcw size={12} />
                    <span>Refund</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
