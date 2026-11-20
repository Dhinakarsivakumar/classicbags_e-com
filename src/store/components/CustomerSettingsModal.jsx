import React, { useState, useEffect } from 'react';
import { 
  X, Package, MapPin, User, CheckCircle2, Clock, Truck, 
  Plus, Trash2, Phone, Building2, Save, Copy, ExternalLink,
  ChevronRight, Sparkles, ShieldCheck, ShoppingBag, AlertCircle
} from 'lucide-react';
import { Storage } from '../../shared/services/storage';
import { STORE_SETTINGS } from '../../shared/data/initialData';

export default function CustomerSettingsModal({ 
  isOpen, 
  onClose, 
  activeTab: initialTab = 'orders', 
  onSelectProduct,
  onOpenAdmin
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [profile, setProfile] = useState({ name: '', phone: '', email: '', businessName: '' });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState('');
  const [newAddress, setNewAddress] = useState({
    title: 'Shop',
    fullName: '',
    phone: '',
    street: '',
    area: '',
    city: '',
    pincode: '',
    isDefault: false
  });
  const [saveSuccess, setSaveSuccess] = useState('');
  const authUser = Storage.getAuthUser();
  const isAdminUser = (authUser && Storage.isAdminEmail(authUser.email)) || Storage.isAdminAuthenticated();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      loadData();
    }
  }, [isOpen, initialTab]);

  const loadData = () => {
    const allOrders = Storage.getOrders() || [];
    setOrders(allOrders);
    setAddresses(Storage.getAddresses() || []);
    const p = Storage.getUserProfile();
    setProfile(p);
    if (!newAddress.fullName) {
      setNewAddress(prev => ({ 
        ...prev, 
        fullName: p.name || '', 
        phone: p.phone || '' 
      }));
    }
  };

  if (!isOpen) return null;

  // Save Profile Handler
  const handleSaveProfile = (e) => {
    e.preventDefault();
    Storage.saveUserProfile(profile);
    setSaveSuccess('Profile updated successfully!');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  // Add Address Handler
  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.fullName) return;

    const updated = [
      ...addresses.map(a => newAddress.isDefault ? { ...a, isDefault: false } : a),
      {
        id: `addr-${Date.now()}`,
        ...newAddress
      }
    ];
    setAddresses(updated);
    Storage.saveAddresses(updated);
    setIsAddingAddress(false);
    setNewAddress({
      title: 'Shop',
      fullName: profile.name || '',
      phone: profile.phone || '',
      street: '',
      area: '',
      city: '',
      pincode: '',
      isDefault: false
    });
    setSaveSuccess('New delivery address saved!');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  // Delete Address
  const handleDeleteAddress = (id) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    Storage.saveAddresses(updated);
  };

  // Set Default Address
  const handleSetDefaultAddress = (id) => {
    const updated = addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    setAddresses(updated);
    Storage.saveAddresses(updated);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedUtr(text);
    setTimeout(() => setCopiedUtr(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/75 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
      {/* Modal Dialog */}
      <div 
        className="relative bg-white w-full sm:max-w-4xl h-[94vh] sm:h-[88vh] sm:max-h-[780px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-stone-200 animate-slideUp sm:animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        {/* MOBILE HEADER (Phones Only) */}
        <div className="md:hidden bg-gradient-to-r from-[#674221] to-[#7e5222] text-white p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-amber-200">
              {(profile.name || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">
                {profile.businessName || profile.name || 'Account Settings'}
              </h3>
              <p className="text-[11px] text-amber-200/90 flex items-center gap-1">
                <span>{profile.phone || 'Not set'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MOBILE EQUAL-WIDTH SEGMENTED BAR */}
        <div className="md:hidden bg-[#fbf7ee] p-2 border-b border-stone-200 flex-shrink-0">
          <div className={`grid ${isAdminUser ? 'grid-cols-4' : 'grid-cols-3'} gap-1 bg-stone-200/70 p-1 rounded-2xl`}>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-1 text-center rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                activeTab === 'orders'
                  ? 'bg-white text-[#7e5222] shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`py-2 px-1 text-center rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                activeTab === 'addresses'
                  ? 'bg-white text-[#7e5222] shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Addresses</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 text-center rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                activeTab === 'profile'
                  ? 'bg-white text-[#7e5222] shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>

            {isAdminUser && (
              <button
                onClick={() => {
                  if (onOpenAdmin) onOpenAdmin();
                }}
                className="py-2 px-1 text-center rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 bg-amber-600 text-white shadow-sm animate-pulse"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* DESKTOP SIDEBAR (Visible on md and up) */}
        <div className="hidden md:flex w-64 bg-[#fbf7ee] border-r border-stone-200 flex-col flex-shrink-0">
          {/* User Profile Card */}
          <div className="p-5 border-b border-stone-200/80 bg-gradient-to-br from-[#f8f2e4] to-[#fbf7ee]">
            <span className="text-[10px] font-bold tracking-wider text-[#7e5222] uppercase bg-amber-100 px-2 py-0.5 rounded-full inline-block mb-3">
              Customer Portal
            </span>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#7e5222] text-amber-100 flex items-center justify-center font-bold text-base shadow">
                {(profile.name || 'C').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-stone-900 text-sm truncate">
                  {profile.businessName || profile.name || 'Classic Customer'}
                </h3>
                <p className="text-xs text-stone-500 truncate mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#7e5222]" />
                  <span>{profile.phone || 'Not set'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5 flex-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#7e5222] text-white shadow-md shadow-amber-900/20'
                  : 'text-stone-600 hover:bg-amber-100/50 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>My Orders</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
              }`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'addresses'
                  ? 'bg-[#7e5222] text-white shadow-md shadow-amber-900/20'
                  : 'text-stone-600 hover:bg-amber-100/50 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4" />
                <span>Saved Addresses</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'addresses' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
              }`}>
                {addresses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'profile'
                  ? 'bg-[#7e5222] text-white shadow-md shadow-amber-900/20'
                  : 'text-stone-600 hover:bg-amber-100/50 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4" />
                <span>Profile Settings</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            {isAdminUser && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (onOpenAdmin) onOpenAdmin();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs bg-gradient-to-r from-stone-900 to-[#674221] text-amber-200 hover:from-black hover:to-[#55361b] shadow-md border border-amber-500/30 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>Admin Control</span>
                  </div>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 font-extrabold px-1.5 py-0.5 rounded border border-amber-400/30">
                    OWNER
                  </span>
                </button>
              </div>
            )}
          </nav>

          {/* Helpline Footer */}
          <div className="p-4 border-t border-stone-200 bg-white/60">
            <p className="text-[11px] text-stone-500 font-semibold mb-1">Factory Order Desk</p>
            <a 
              href={`https://wa.me/${STORE_SETTINGS.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#7e5222] hover:underline font-bold flex items-center gap-1.5"
            >
              <span>+91 {STORE_SETTINGS.phone}</span>
            </a>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
          {/* Desktop Content Header */}
          <div className="hidden md:flex px-6 py-4 border-b border-stone-100 items-center justify-between bg-stone-50/40">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                {activeTab === 'orders' && 'Order History & Status Tracking'}
                {activeTab === 'addresses' && 'Saved Delivery Locations'}
                {activeTab === 'profile' && 'Business Profile & Contact'}
              </h2>
              <p className="text-xs text-stone-500">
                {activeTab === 'orders' && 'Instant zero-fee Google Pay payment matching and production progress'}
                {activeTab === 'addresses' && 'Manage your store, warehouse, and boutique shipping destinations'}
                {activeTab === 'profile' && 'Your contact information for invoices and dispatch SMS/WhatsApp alerts'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {saveSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2 animate-fadeIn shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="font-medium">{saveSuccess}</span>
              </div>
            )}

            {/* TAB 1: MY ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 text-[#7e5222] mx-auto flex items-center justify-center mb-3 shadow-sm">
                      <Package className="w-7 h-7 opacity-75" />
                    </div>
                    <h3 className="text-base font-bold text-stone-800">No Orders Placed Yet</h3>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                      Your factory wholesale orders will appear here automatically after checkout.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#7e5222] hover:bg-[#674221] text-white rounded-full font-bold text-xs transition-all shadow-md active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Browse Bags Catalog</span>
                    </button>
                  </div>
                ) : (
                  orders.map((order, idx) => {
                    const isPaid = order.status === 'PAID' || order.status === 'PAID_APPROVED';
                    const orderDate = new Date(order.timestamp || order.createdAt || Date.now()).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    });

                    return (
                      <div 
                        key={order.orderId || order.id || idx}
                        className="border border-stone-200 rounded-3xl p-4 sm:p-5 hover:border-amber-300 transition-all bg-white shadow-sm"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-stone-900 text-sm sm:text-base">
                                {order.orderId || order.id}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isPaid
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                                {isPaid ? 'PAID & CONFIRMED' : 'PENDING PAYMENT'}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-400 mt-0.5">{orderDate}</p>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-stone-400 uppercase font-semibold block">Total</span>
                            <span className="text-base sm:text-lg font-black text-[#7e5222]">
                              ₹{(order.totalAmount || order.total || order.amount || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Live Payment Verification Status Indicator */}
                        <div className="mt-2.5">
                          {(order.approvalType === 'AUTOMATIC_SMS_WEBHOOK' || order.paymentVerification === 'AUTO_VERIFIED') ? (
                            <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-[11px] font-medium">
                              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                              <span><strong>Payment Verification:</strong> ⚡ 100% Auto-Verified via Bank SMS ✔</span>
                            </div>
                          ) : order.paymentVerification === 'MANUAL_VERIFIED' ? (
                            <div className="flex items-center gap-1.5 text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 text-[11px] font-medium">
                              <CheckCircle2 className="w-4 h-4 text-blue-700 flex-shrink-0" />
                              <span><strong>Payment Verification:</strong> ✔ Manually Verified &amp; Approved by Admin</span>
                            </div>
                          ) : (order.status === 'PENDING_VERIFICATION' || order.paymentVerification === 'PENDING_VERIFICATION') ? (
                            <div className="flex items-center gap-1.5 text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-300 text-[11px] font-medium">
                              <Clock className="w-4 h-4 text-amber-700 flex-shrink-0" />
                              <span><strong>Payment Verification:</strong> ⏳ 12-Digit UTR Submitted ({order.utr || 'Pending'}) • Admin Verifying against Bank Records</span>
                            </div>
                          ) : order.paymentVerification === 'REJECTED' ? (
                            <div className="flex items-center gap-1.5 text-rose-800 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-300 text-[11px] font-medium">
                              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                              <span><strong>Payment Verification:</strong> ❌ UTR Not Verified / Statement Mismatch • Contact Store on WhatsApp</span>
                            </div>
                          ) : isPaid ? (
                            <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-[11px] font-medium">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                              <span><strong>Payment Verification:</strong> ✔ Confirmed &amp; In Production</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-stone-700 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 text-[11px] font-medium">
                              <AlertCircle className="w-4 h-4 text-stone-500 flex-shrink-0" />
                              <span><strong>Payment Verification:</strong> ❌ Not Verified (Payment Pending)</span>
                            </div>
                          )}
                        </div>

                        {/* Order Items */}
                        <div className="py-3 space-y-2">
                          {order.items?.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center justify-between text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                              <div>
                                <span className="font-bold text-stone-800">{item.name}</span>
                                <p className="text-[10px] text-stone-500">
                                  Size: {item.size} • Qty: {item.qty || item.quantity} units {item.gsm ? `• ${item.gsm} GSM` : ''}
                                </p>
                              </div>
                              <span className="font-bold text-stone-900">
                                ₹{(item.totalPrice || item.lineTotal || ((item.price || item.unitPrice) * (item.qty || item.quantity)) || 0).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Order Timeline Progress */}
                        <div className="pt-3 border-t border-stone-100 bg-[#fdfbf7] -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3.5 sm:p-4 rounded-b-3xl">
                          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Order Milestones</p>
                          <div className="grid grid-cols-4 gap-1 text-center">
                            <div className="flex flex-col items-center">
                              <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-[9px] font-bold">
                                ✓
                              </div>
                              <span className="text-[10px] font-bold text-stone-800 mt-1">Placed</span>
                            </div>

                            <div className="flex flex-col items-center">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                isPaid ? 'bg-green-500 text-white' : 'bg-amber-400 text-stone-900 animate-pulse'
                              }`}>
                                {isPaid ? '✓' : '•'}
                              </div>
                              <span className="text-[10px] font-bold text-stone-800 mt-1">Paid (UPI)</span>
                            </div>

                            <div className="flex flex-col items-center">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                isPaid ? 'bg-amber-500 text-white animate-pulse' : 'bg-stone-200 text-stone-400'
                              }`}>
                                ⚙
                              </div>
                              <span className="text-[10px] font-medium text-stone-600 mt-1">Production</span>
                            </div>

                            <div className="flex flex-col items-center">
                              <div className="w-5 h-5 rounded-full bg-stone-200 text-stone-400 flex items-center justify-center text-[9px]">
                                🚚
                              </div>
                              <span className="text-[10px] font-medium text-stone-400 mt-1">Dispatched</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-stone-200/60 text-[11px] text-stone-500">
                            {order.utr ? (
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-stone-700">UTR:</span>
                                <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-200 text-stone-800">
                                  {order.utr}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(order.utr)}
                                  className="text-[#7e5222] hover:text-[#674221] p-0.5"
                                  title="Copy UTR"
                                >
                                  {copiedUtr === order.utr ? 'Copied!' : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            ) : (
                              <span className="text-amber-700 font-medium">Awaiting UPI match</span>
                            )}

                            <a
                              href={`https://wa.me/${STORE_SETTINGS.whatsapp}?text=Hi%20Classic%20Bags!%20Inquiring%20about%20Order%20${order.orderId || order.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-green-700 hover:text-green-800 flex items-center gap-1"
                            >
                              <span>WhatsApp Status</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <p className="text-xs text-stone-600">
                    Manage your delivery locations.
                  </p>
                  {!isAddingAddress && (
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#7e5222] hover:bg-[#674221] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Address</span>
                    </button>
                  )}
                </div>

                {/* Add Address Form */}
                {isAddingAddress && (
                  <form onSubmit={handleAddAddress} className="p-4 sm:p-5 bg-amber-50/70 border border-amber-200 rounded-3xl space-y-3.5 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#7e5222]" />
                        <span>New Delivery Location</span>
                      </h4>
                      <button 
                        type="button" 
                        onClick={() => setIsAddingAddress(false)}
                        className="text-stone-400 hover:text-stone-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">Label (e.g. Shop, Warehouse)</label>
                        <input
                          type="text"
                          value={newAddress.title}
                          onChange={e => setNewAddress({ ...newAddress, title: e.target.value })}
                          placeholder="Main Shop / Showroom"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">Contact Person Name</label>
                        <input
                          type="text"
                          value={newAddress.fullName}
                          onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })}
                          placeholder="Full Name"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={newAddress.phone}
                          onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                          placeholder="8940679198"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          value={newAddress.pincode}
                          onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })}
                          placeholder="613007"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={newAddress.street}
                        onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                        placeholder="Plot No. 38, 6th Street, Medical College Road"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">Area / Landmark</label>
                        <input
                          type="text"
                          value={newAddress.area}
                          onChange={e => setNewAddress({ ...newAddress, area: e.target.value })}
                          placeholder="LIC Colony"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">City</label>
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                          placeholder="Thanjavur"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="isDefaultAddr2"
                        checked={newAddress.isDefault}
                        onChange={e => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                        className="rounded border-stone-300 text-[#7e5222] focus:ring-[#7e5222]"
                      />
                      <label htmlFor="isDefaultAddr2" className="text-xs text-stone-700 font-medium">
                        Set as primary default address
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-3.5 py-1.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#7e5222] text-white rounded-xl text-xs font-bold hover:bg-[#674221] shadow-sm"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                {/* Address Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {addresses.map(addr => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-3xl border transition-all flex flex-col justify-between ${
                        addr.isDefault
                          ? 'border-[#7e5222] bg-amber-50/40 shadow-sm ring-1 ring-[#7e5222]/20'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-stone-900 text-xs sm:text-sm">{addr.title}</span>
                            {addr.isDefault && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#7e5222] text-white">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="font-bold text-stone-800 text-xs">{addr.fullName}</p>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          {addr.street}, {addr.area && `${addr.area}, `}{addr.city} – {addr.pincode}
                        </p>
                        <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#7e5222]" />
                          <span>{addr.phone}</span>
                        </p>
                      </div>

                      {!addr.isDefault && (
                        <div className="mt-3 pt-2.5 border-t border-stone-100">
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-xs text-[#7e5222] hover:text-[#674221] font-bold hover:underline flex items-center gap-1"
                          >
                            <span>Set as Default</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PROFILE */}
            {activeTab === 'profile' && (
              <div className="max-w-lg space-y-4">
                {isAdminUser && (
                  <div className="p-4 bg-gradient-to-r from-stone-900 via-stone-850 to-[#674221] text-white rounded-2xl border border-amber-600/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-white">Classic Bags Factory Owner</h4>
                          <span className="text-[10px] bg-amber-500/30 text-amber-300 font-extrabold px-1.5 py-0.5 rounded">
                            VERIFIED
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-200/80 mt-0.5">
                          Owner access to factory inventory, webhooks &amp; cloud orders.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenAdmin) onOpenAdmin();
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition-transform active:scale-95 whitespace-nowrap flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Open Admin</span>
                    </button>
                  </div>
                )}

                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#7e5222] flex items-center justify-center font-bold flex-shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Buyer Account Profile</h4>
                    <p className="text-[11px] text-stone-500">
                      Details used for invoice generation and delivery updates.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Business / Retail Store Name
                    </label>
                    <div className="relative">
                      <Building2 className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={profile.businessName || ''}
                        onChange={e => setProfile({ ...profile, businessName: e.target.value })}
                        placeholder="Classic Silks & Readymades"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Contact Person Name
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={profile.name || ''}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        placeholder="Your Name or Shop Name"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      WhatsApp Order Phone
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={profile.phone || ''}
                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={profile.email || ''}
                      onChange={e => setProfile({ ...profile, email: e.target.value })}
                      placeholder="e.g. customer@gmail.com"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#7e5222] hover:bg-[#674221] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
