import React, { useState } from 'react';
import { ShoppingCart, CheckCircle2, Clock, Truck, Package, Search, Phone, MapPin, RotateCcw, MessageCircle, AlertCircle } from 'lucide-react';
import { Storage } from '../../shared/services/storage';

export default function OrderManager({ orders, products, onUpdateOrders }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [refundModalOrder, setRefundModalOrder] = useState(null);

  const filteredOrders = (orders || []).filter(o => {
    if (!o) return false;
    const matchesFilter = 
      filter === 'ALL' ||
      (filter === 'VERIFY' && o.status === 'PENDING_VERIFICATION') ||
      (filter === 'PENDING' && o.status === 'PENDING_PAYMENT') ||
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
          { id: 'VERIFY', label: 'Verify UTR (Manual)' },
          { id: 'PENDING', label: 'Pending Payment' },
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
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Actions &amp; Refund</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map(o => (
                  <tr key={o.id || o.orderId || Math.random()} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{o.id || o.orderId || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{o.customerName || 'Anonymous Customer'}</div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                        <Phone size={10} className="text-amber-800" />
                        <span className="font-mono">{o.phone || 'N/A'}</span>
                        {o.phone && (
                          <a
                            href={`https://wa.me/91${o.phone}?text=Hello%20${encodeURIComponent(o.customerName || 'Customer')},%20regarding%20your%20order%20${o.id || o.orderId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-1 text-emerald-600 hover:text-emerald-700 p-0.5"
                            title="Message on WhatsApp"
                          >
                            <MessageCircle size={12} />
                          </a>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin size={10} /> {o.city || 'Thanjavur'}
                      </div>
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
                        Ref: {o.utr || 'Pending'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {o.status === 'PENDING_VERIFICATION' && (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          <Clock size={12} className="text-amber-700" /> Verify UTR
                        </span>
                      )}
                      {(o.status === 'PAID_APPROVED' || o.status === 'PAID') && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 size={12} /> Paid &amp; Approved
                        </span>
                      )}
                      {o.status === 'PENDING_PAYMENT' && (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          <Clock size={12} /> Pending GPay
                        </span>
                      )}
                      {o.status === 'PROCESSING' && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          <Package size={12} /> In Production
                        </span>
                      )}
                      {o.status === 'SHIPPED' && (
                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          <Truck size={12} /> Shipped
                        </span>
                      )}
                      {o.status === 'REFUNDED' && (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          <RotateCcw size={12} /> Refunded (Restocked)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(o.status === 'PENDING_VERIFICATION' || o.status === 'PENDING_PAYMENT') && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, 'PAID_APPROVED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                          >
                            <CheckCircle2 size={12} />
                            <span>{o.status === 'PENDING_VERIFICATION' ? 'Verify & Approve' : 'Approve'}</span>
                          </button>
                        )}
                        {(o.status === 'PAID_APPROVED' || o.status === 'PAID') && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, 'PROCESSING')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            Pack
                          </button>
                        )}
                        {o.status === 'PROCESSING' && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, 'SHIPPED')}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            Ship
                          </button>
                        )}

                        {/* Refund Action */}
                        {(o.status === 'PAID_APPROVED' || o.status === 'PAID' || o.status === 'PROCESSING') && (
                          <button
                            onClick={() => setRefundModalOrder(o)}
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
    </div>
  );
}
