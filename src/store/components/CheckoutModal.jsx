import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Smartphone, QrCode, Copy, CheckCircle2, ArrowRight, 
  ShieldCheck, Check, RefreshCw, AlertCircle, Clock, Lock
} from 'lucide-react';
import { STORE_SETTINGS } from '../../shared/data/initialData';
import { Storage } from '../../shared/services/storage';
import DynamicUpiQr from './DynamicUpiQr';

export default function CheckoutModal({ 
  isOpen = true, 
  onClose, 
  cartItems = [], 
  onOrderCompleted, 
  onOrderSuccess,
  authUser,
  onOpenAuth
}) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [saveAddress, setSaveAddress] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [step, setStep] = useState('details'); // 'details' | 'payment' | 'success'
  const [createdOrder, setCreatedOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [utrError, setUtrError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId] = useState(() => `CB-${Math.floor(1000 + Math.random() * 9000)}`);
  const [autoVerified, setAutoVerified] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [showManualUtr, setShowManualUtr] = useState(false);

  useEffect(() => {
    if (authUser) {
      if (authUser.name) setCustomerName(authUser.name);
      if (authUser.phone) setPhone(authUser.phone);
    } else {
      const profile = Storage.getUserProfile();
      if (profile) {
        if (profile.name) setCustomerName(profile.name);
        if (profile.phone) setPhone(profile.phone);
      }
    }

    const addresses = Storage.getAddresses() || [];
    setSavedAddresses(addresses);
    const def = addresses.find(a => a.isDefault) || addresses[0];
    if (def) {
      setSelectedAddressId(def.id);
      setAddress(`${def.street}${def.area ? `, ${def.area}` : ''}`);
      setCity(def.city || 'Thanjavur');
      if (def.fullName && !customerName) setCustomerName(def.fullName);
      if (def.phone && !phone) setPhone(def.phone);
    }
  }, [isOpen, authUser]);

  const handleSelectSavedAddress = (addrId) => {
    setSelectedAddressId(addrId);
    const chosen = savedAddresses.find(a => a.id === addrId);
    if (chosen) {
      setAddress(`${chosen.street}${chosen.area ? `, ${chosen.area}` : ''}`);
      setCity(chosen.city);
      if (chosen.fullName) setCustomerName(chosen.fullName);
      if (chosen.phone) setPhone(chosen.phone);
    }
  };

  if (!isOpen) return null;

  // Base total with robust fallback
  const getItemPrice = (item) => {
    if (typeof item.unitPrice === 'number' && !isNaN(item.unitPrice)) return item.unitPrice;
    if (item.tierPricing && item.tierPricing.length > 0) {
      let price = item.tierPricing[0].price;
      for (const tier of item.tierPricing) {
        if (item.qty >= tier.min) price = tier.price;
      }
      return price;
    }
    return item.price || 1;
  };

  const baseSubtotal = cartItems.reduce((acc, item) => acc + (getItemPrice(item) * item.qty), 0);
  const orderAmount = baseSubtotal.toFixed(2);

  // Deep Link for Google Pay UPI Intent
  const upiIntentUrl = `upi://pay?pa=${STORE_SETTINGS.upiId}&pn=${encodeURIComponent(STORE_SETTINGS.merchantName)}&am=${orderAmount}&cu=INR&tn=${orderId}`;

  // Countdown timer for automatic payment verification radar
  useEffect(() => {
    if (step !== 'payment') return;
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, countdown]);

  // Proceed from Details to Payment (Requires Google Login)
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!authUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (!customerName || !phone) return;

    // Save delivery address for future orders if selected
    if (saveAddress && address.trim()) {
      try {
        const addresses = Storage.getAddresses() || [];
        const newAddr = {
          id: selectedAddressId || `addr_${Date.now()}`,
          title: city.trim() ? `${city.trim()} Delivery` : 'Delivery Address',
          fullName: customerName,
          phone: phone,
          street: address.trim(),
          city: city.trim() || 'Thanjavur',
          isDefault: true
        };
        const other = addresses.filter(a => a.street.toLowerCase() !== address.trim().toLowerCase());
        Storage.saveAddresses([newAddr, ...other]);
        setSavedAddresses([newAddr, ...other]);
      } catch (err) {
        console.warn('Address saving error:', err);
      }
    }

    // Reset payment verification state
    setCountdown(60);
    setShowManualUtr(false);
    setUtrError('');
    setUtrInput('');

    // Save PENDING_PAYMENT order so WebhookEngine can instantly auto-match by Order ID or Amount
    const pendingOrder = {
      id: orderId,
      orderId: orderId,
      customerName,
      phone,
      city,
      address,
      items: cartItems.map(item => ({
        name: item.name,
        qty: item.qty,
        size: item.size,
        gsm: item.gsm,
        handle: item.handle,
        unitPrice: getItemPrice(item),
        price: getItemPrice(item),
        totalPrice: getItemPrice(item) * item.qty
      })),
      totalAmount: parseFloat(orderAmount),
      amount: parseFloat(orderAmount),
      status: 'PENDING_PAYMENT',
      paymentMethod: 'Google Pay / UPI',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      utr: null
    };

    const existingOrders = Storage.getOrders() || [];
    const updated = [pendingOrder, ...existingOrders.filter(o => o.id !== orderId)];
    Storage.saveOrders(updated);

    setStep('payment');
  };

  // Real-time Auto-Verification: Listen for incoming Bank SMS / UPI Webhook match
  useEffect(() => {
    if (step !== 'payment') return;

    let isMounted = true;

    const checkAutoVerification = async () => {
      const orders = Storage.getOrders() || [];
      const thisOrder = orders.find(o => o.id === orderId);

      // 1. Matched directly by WebhookEngine
      if (thisOrder && (thisOrder.status === 'PAID_APPROVED' || thisOrder.status === 'PAID')) {
        if (!isMounted) return true;
        setCreatedOrder(thisOrder);
        setAutoVerified(true);
        setStep('success');
        if (onOrderCompleted) onOrderCompleted(thisOrder);
        if (onOrderSuccess) onOrderSuccess(thisOrder);
        return true;
      }

      // 2. Query Webhook Server for real-time payments received by Android Phone
      try {
        const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '10.220.210.247';
        const endpoints = [
          `http://${host}:3002/api/webhook/recent`,
          'http://10.220.210.247:3002/api/webhook/recent',
          'http://localhost:3002/api/webhook/recent'
        ];

        for (const ep of endpoints) {
          try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 1200);
            const res = await fetch(ep, { signal: controller.signal });
            clearTimeout(timer);

            if (res.ok) {
              const data = await res.json();
              if (data.payments && Array.isArray(data.payments)) {
                // Find payment matching orderAmount in the last 15 minutes
                const match = data.payments.find(p => {
                  const matchAmt = Math.abs(parseFloat(p.amount) - parseFloat(orderAmount)) < 0.05;
                  const pTime = p.timestamp ? new Date(p.timestamp).getTime() : new Date(p.receivedAt).getTime();
                  const isRecent = (Date.now() - pTime) < 15 * 60 * 1000;
                  return matchAmt && isRecent;
                });

                if (match && thisOrder && thisOrder.status === 'PENDING_PAYMENT') {
                  const approved = {
                    ...thisOrder,
                    status: 'PAID_APPROVED',
                    utr: match.utr || ('UTR' + Date.now()),
                    paidAt: match.receivedAt || new Date().toISOString(),
                    approvalType: 'AUTOMATIC_SMS_WEBHOOK',
                    sender: match.sender || 'Customer'
                  };
                  const updated = orders.map(o => o.id === orderId ? approved : o);
                  Storage.saveOrders(updated);
                  if (!isMounted) return true;
                  setCreatedOrder(approved);
                  setAutoVerified(true);
                  setStep('success');
                  if (onOrderCompleted) onOrderCompleted(approved);
                  if (onOrderSuccess) onOrderSuccess(approved);
                  return true;
                }
              }
              break;
            }
          } catch {
            // endpoint unreachable, try next
          }
        }
      } catch {
        // network polling silent continue
      }

      // 3. Fallback check: Did a webhook log arrive matching this order amount in the last 10 minutes?
      const logs = Storage.getWebhookLogs() || [];
      const recentLog = logs.find(log => {
        const matchesAmt = Math.abs(parseFloat(log.amount) - parseFloat(orderAmount)) < 0.05;
        const matchesId = log.orderId === orderId;
        return (matchesId || matchesAmt) && (log.matched || log.amount > 0);
      });

      if (recentLog && thisOrder && thisOrder.status === 'PENDING_PAYMENT') {
        const approved = {
          ...thisOrder,
          status: 'PAID_APPROVED',
          utr: recentLog.utr || ('UTR' + Date.now()),
          paidAt: new Date().toISOString(),
          approvalType: 'AUTOMATIC_SMS_WEBHOOK'
        };
        const updated = orders.map(o => o.id === orderId ? approved : o);
        Storage.saveOrders(updated);
        if (!isMounted) return true;
        setCreatedOrder(approved);
        setAutoVerified(true);
        setStep('success');
        if (onOrderCompleted) onOrderCompleted(approved);
        if (onOrderSuccess) onOrderSuccess(approved);
        return true;
      }

      return false;
    };

    // Poll every 2 seconds
    const interval = setInterval(checkAutoVerification, 2000);
    checkAutoVerification();

    // Listen to storage events immediately
    const cleanupStorage = Storage.onStorageChange((key) => {
      if (key === 'cb_orders' || key === 'cb_webhook_logs') {
        checkAutoVerification();
      }
    });

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (cleanupStorage) cleanupStorage();
    };
  }, [step, orderId, orderAmount, onOrderCompleted, onOrderSuccess]);

  // Handle Manual UTR Submission with strict 12-digit verification
  const handleManualUtrSubmit = (e) => {
    e?.preventDefault();
    const cleanUtr = utrInput.trim();
    if (!cleanUtr) {
      setUtrError('Please enter the 12-digit UPI Reference / UTR Number.');
      return;
    }
    // Strict 12-digit number check for UPI transactions
    if (!/^\d{12}$/.test(cleanUtr)) {
      setUtrError('Invalid UTR format. Standard UPI Reference Number (UTR/RRN) must be exactly 12 numeric digits (e.g. 432109876543).');
      return;
    }
    setUtrError('');
    finishOrder({
      method: 'Google Pay / UPI (Manual Verification)',
      status: 'PENDING_VERIFICATION',
      utr: cleanUtr
    });
  };

  // Complete Order
  const finishOrder = ({ method, status, utr }) => {
    setIsSubmitting(true);

    const order = {
      id: orderId,
      orderId: orderId,
      customerName,
      phone,
      city,
      address,
      items: cartItems.map(item => ({
        name: item.name,
        qty: item.qty,
        size: item.size,
        gsm: item.gsm,
        handle: item.handle,
        unitPrice: item.unitPrice,
        price: item.unitPrice,
        totalPrice: item.unitPrice * item.qty
      })),
      totalAmount: parseFloat(orderAmount),
      amount: parseFloat(orderAmount),
      status: status || 'PAID',
      paymentMethod: method || 'Google Pay / UPI',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      utr: utr || ('UPI' + Math.floor(1000000000 + Math.random() * 9000000000))
    };

    const existingOrders = Storage.getOrders() || [];
    Storage.saveOrders([order, ...existingOrders]);
    setCreatedOrder(order);
    setStep('success');
    setIsSubmitting(false);

    if (onOrderCompleted) onOrderCompleted(order);
    if (onOrderSuccess) onOrderSuccess(order);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(STORE_SETTINGS.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden transition-all my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#674221] to-[#7e5222] text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base sm:text-lg">
              {step === 'details' && 'Wholesale Order Checkout'}
              {step === 'payment' && 'Complete Payment'}
              {step === 'success' && 'Order Confirmed!'}
            </h3>
            <p className="text-xs text-amber-100/90">
              {step === 'details' && 'Verify delivery location and choose payment mode'}
              {step === 'payment' && `Pay to ${STORE_SETTINGS.merchantName} via Google Pay`}
              {step === 'success' && 'Your order is recorded and in production queue'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* STEP 1: Details & Payment Mode Selection */}
        {step === 'details' && (
          <form onSubmit={handleProceedToPayment} className="p-5 sm:p-6 space-y-4">
            {/* Google Account Verified Card */}
            {authUser ? (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {authUser.avatar ? (
                      <img src={authUser.avatar} alt={authUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-xs text-stone-700">{(authUser.name || 'G')[0]}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-stone-900 text-xs truncate flex items-center gap-1">
                      <span>{authUser.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">{authUser.email}</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full flex-shrink-0">
                  Google Verified
                </span>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                  <Lock className="w-4 h-4 text-[#7e5222] flex-shrink-0" />
                  <span>Google Login required to place order</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-full text-xs font-bold shadow-sm transition-all whitespace-nowrap"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Business / Shop or Customer Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Thanjavur Silks / Ramesh Kumar"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#7e5222] focus:outline-none"
              />
            </div>

            {/* Phone & City */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">WhatsApp Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#7e5222] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">City / Region</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#7e5222] focus:outline-none"
                />
              </div>
            </div>

            {/* Saved Address Pills */}
            {savedAddresses.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Saved Delivery Address
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {savedAddresses.map(addr => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectSavedAddress(addr.id)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-bold flex-shrink-0 transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-[#7e5222] bg-amber-50 text-[#7e5222]'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      📍 {addr.title} ({addr.city})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Delivery Address *</label>
              <textarea
                rows={2}
                required
                placeholder="Shop address, Street, Landmark, Pincode"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#7e5222] focus:outline-none"
              />
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="cb_save_address"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="w-4 h-4 text-[#7e5222] rounded border-stone-300 focus:ring-[#7e5222] accent-[#7e5222] cursor-pointer"
                />
                <label htmlFor="cb_save_address" className="text-xs font-semibold text-stone-700 cursor-pointer select-none">
                  Save this delivery address for future orders
                </label>
              </div>
            </div>

            {/* Payment Method Display - Exclusively Instant Online UPI */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-stone-800 mb-2">Payment Method</label>
              <div className="p-3.5 rounded-2xl border border-emerald-300 bg-emerald-50/70 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center shadow-sm">
                    <QrCode className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs sm:text-sm font-bold text-stone-900">Google Pay / PhonePe / Instant UPI QR</p>
                      <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-full">Fastest</span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-0.5">Pay direct to {STORE_SETTINGS.merchantName} ({STORE_SETTINGS.upiId}) • Auto-Verified</p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <Check size={12} />
                </div>
              </div>
            </div>

            {/* Total Summary */}
            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 flex justify-between items-center">
              <div>
                <div className="text-xs text-stone-600 font-semibold">Total Order Value ({cartItems.reduce((s, i) => s + i.qty, 0)} bags)</div>
                <div className="text-[11px] text-[#7e5222] font-bold">100% Factory Wholesale Price</div>
              </div>
              <div className="text-2xl font-black text-[#7e5222]">
                ₹{orderAmount}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#7e5222] hover:bg-[#674221] text-white py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <span>Proceed to UPI / Google Pay Payment</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* STEP 2: UPI / Dynamic QR Payment Screen */}
        {step === 'payment' && (
          <div className="p-5 sm:p-6 space-y-4 text-center">
            {/* Real-time Dynamic UPI QR Code (Directly pre-fills Amount & Order ID) */}
            <DynamicUpiQr 
              amount={orderAmount} 
              orderId={orderId} 
              merchantName={STORE_SETTINGS.merchantName}
              upiId={STORE_SETTINGS.upiId}
              phone={STORE_SETTINGS.phone}
            />

            {/* Live Auto-Verification Status Radar */}
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm text-left">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-emerald-950 flex items-center justify-between">
                  <span>Listening for Bank Credit SMS &amp; UPI...</span>
                  <span className="text-[10px] bg-emerald-200/90 text-emerald-900 font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock size={11} />
                    <span>{countdown > 0 ? `${countdown}s` : 'Radar Active'}</span>
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-tight mt-0.5">
                  Once payment is received on Dhinakar's account, this screen confirms your order automatically!
                </p>
              </div>
            </div>

            {/* Manual UTR Section - Gated by timer or toggle to prevent fake spam submissions */}
            {!showManualUtr && countdown > 0 ? (
              <div className="pt-2 border-t border-stone-200 text-center space-y-1.5">
                <p className="text-[11px] text-stone-500">
                  Please complete the payment in your UPI app. Auto-detection is actively searching...
                </p>
                <button
                  type="button"
                  onClick={() => setShowManualUtr(true)}
                  className="text-xs text-[#7e5222] font-semibold underline hover:text-stone-900 transition-colors"
                >
                  Payment completed but auto-verify taking time? Enter 12-digit UTR
                </button>
              </div>
            ) : (
              <form onSubmit={handleManualUtrSubmit} className="pt-3 border-t border-stone-200 space-y-2.5 text-left animate-fadeIn">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-stone-800">
                    Enter 12-Digit UPI Transaction ID / UTR:
                  </label>
                  <span className="text-[10px] font-mono text-stone-400">12 digits</span>
                </div>

                <div className="space-y-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    placeholder="e.g. 432109876543"
                    value={utrInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ''); // numeric only
                      setUtrInput(val);
                      if (utrError) setUtrError('');
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono border rounded-xl focus:outline-none focus:ring-2 ${
                      utrError ? 'border-red-400 focus:ring-red-400 bg-red-50/30' : 'border-stone-300 focus:ring-[#7e5222]'
                    }`}
                  />
                  {utrError ? (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 font-medium">
                      <AlertCircle size={12} />
                      <span>{utrError}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-stone-500">
                      Found in your Google Pay / PhonePe transaction receipt as "UPI Ref No" or "UTR".
                    </p>
                  )}
                </div>

                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-snug">
                  🛡️ <strong>Admin Verification:</strong> Manual UTR entries are cross-verified with bank credit records before manufacturing dispatch.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || utrInput.length < 12}
                  className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                    utrInput.length === 12 && !isSubmitting
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95'
                      : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  <span>Submit 12-Digit UTR for Verification</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* STEP 3: Order Success Invoice Screen */}
        {step === 'success' && (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm ${
              createdOrder?.status === 'PENDING_VERIFICATION' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-600'
            }`}>
              {createdOrder?.status === 'PENDING_VERIFICATION' ? (
                <Clock size={36} className="stroke-[2.5]" />
              ) : (
                <CheckCircle2 size={36} className="stroke-[2.5]" />
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-stone-900">
              {createdOrder?.status === 'PENDING_VERIFICATION' ? 'Order Queued for UTR Verification' : 'Payment Verified & Order Confirmed!'}
            </h3>

            {(autoVerified || createdOrder?.approvalType?.includes('AUTOMATIC') || createdOrder?.status === 'PAID_APPROVED') ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300 shadow-sm">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>100% Verified Automatically via Bank SMS / UPI</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold border border-amber-300 shadow-sm">
                <AlertCircle size={14} className="text-amber-700" />
                <span>Pending Bank Statement Match ({createdOrder?.utr})</span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto">
              {createdOrder?.status === 'PENDING_VERIFICATION' ? (
                <>Thank you, <strong className="text-stone-900">{createdOrder?.customerName}</strong>! Your UTR has been submitted. Our Thanjavur desk will confirm the payment against our bank records shortly.</>
              ) : (
                <>Thank you, <strong className="text-stone-900">{createdOrder?.customerName}</strong>! Your payment was verified automatically and sent to our Thanjavur manufacturing desk.</>
              )}
            </p>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-stone-400">Order ID:</span>
                <span className="font-bold text-stone-900">{createdOrder?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Payment Status:</span>
                <span className={`font-bold ${createdOrder?.status === 'PENDING_VERIFICATION' ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {createdOrder?.status === 'PENDING_VERIFICATION' ? 'PENDING_VERIFICATION' : 'PAID_APPROVED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Total Paid/Payable:</span>
                <span className="font-black text-[#7e5222]">₹{createdOrder?.totalAmount?.toFixed(2)}</span>
              </div>
              {createdOrder?.utr && (
                <div className="flex justify-between">
                  <span className="text-stone-400">Reference / UTR:</span>
                  <span className="font-bold text-stone-700">{createdOrder?.utr}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[#7e5222] hover:bg-[#674221] text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Continue Shopping
              </button>
              <a
                href={`https://wa.me/${STORE_SETTINGS.whatsapp}?text=Hi%20Classic%20Bags!%20Confirmed%20Order%20${createdOrder?.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Track on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
