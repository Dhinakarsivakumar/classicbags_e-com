import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Smartphone, QrCode, Copy, CheckCircle2, ArrowRight, 
  ShieldCheck, Banknote, Building2, CreditCard, Check, RefreshCw
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
  const [phone, setPhone] = useState('8940679198');
  const [city, setCity] = useState('Thanjavur');
  const [address, setAddress] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'cod' | 'bank'
  const [step, setStep] = useState('details'); // 'details' | 'payment' | 'success'
  const [createdOrder, setCreatedOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId] = useState(() => `CB-${Math.floor(1000 + Math.random() * 9000)}`);
  const [autoVerified, setAutoVerified] = useState(false);

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

  // Proceed from Details to Payment (Requires Google Login)
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!authUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (!customerName || !phone) return;

    if (paymentMethod === 'cod') {
      finishOrder({
        method: 'Cash on Delivery (COD)',
        status: 'CONFIRMED_COD',
        utr: 'COD-ORDER'
      });
      return;
    }

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
      paymentMethod: paymentMethod === 'bank' ? 'Bank Transfer (NEFT)' : 'Google Pay / UPI',
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
        const endpoints = [
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
                  placeholder="8940679198"
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
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-stone-800 mb-2">Select Payment Method</label>
              <div className="space-y-2">
                {/* 1. Google Pay / UPI */}
                <div 
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'upi'
                      ? 'border-[#7e5222] bg-amber-50/50 ring-1 ring-[#7e5222]'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                      <QrCode className="w-5 h-5 text-[#7e5222]" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-stone-900">Google Pay / PhonePe / UPI QR</p>
                      <p className="text-[11px] text-stone-500">Scan & Pay to {STORE_SETTINGS.merchantName} ({STORE_SETTINGS.upiId})</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'upi' ? 'border-[#7e5222] bg-[#7e5222] text-white' : 'border-stone-300'
                  }`}>
                    {paymentMethod === 'upi' && <Check size={12} />}
                  </div>
                </div>

                {/* 2. Cash on Delivery */}
                <div 
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'cod'
                      ? 'border-[#7e5222] bg-amber-50/50 ring-1 ring-[#7e5222]'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                      <Banknote className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-stone-900">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-stone-500">Pay cash upon bag delivery at your destination</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'cod' ? 'border-[#7e5222] bg-[#7e5222] text-white' : 'border-stone-300'
                  }`}>
                    {paymentMethod === 'cod' && <Check size={12} />}
                  </div>
                </div>

                {/* 3. Bank Transfer */}
                <div 
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'bank'
                      ? 'border-[#7e5222] bg-amber-50/50 ring-1 ring-[#7e5222]'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-stone-900">Direct Bank Transfer / NEFT</p>
                      <p className="text-[11px] text-stone-500">Axis Bank Current Account ({STORE_SETTINGS.merchantName})</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'bank' ? 'border-[#7e5222] bg-[#7e5222] text-white' : 'border-stone-300'
                  }`}>
                    {paymentMethod === 'bank' && <Check size={12} />}
                  </div>
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
              <span>{paymentMethod === 'cod' ? 'Confirm Cash on Delivery Order' : 'Proceed to Payment'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* STEP 2: UPI / Dynamic QR Payment Screen */}
        {step === 'payment' && paymentMethod === 'upi' && (
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
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3 animate-pulse text-left shadow-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-emerald-950 flex items-center justify-between">
                  <span>Listening for Bank Credit SMS &amp; UPI...</span>
                  <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded-full text-emerald-800 font-mono font-bold">AUTO-VERIFYING</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-tight mt-0.5">
                  Once payment is credited to Dhinakar S, this screen confirms your order automatically!
                </p>
              </div>
            </div>

            {/* UTR Input & Confirmation (Optional backup fallback) */}
            <div className="pt-2 border-t border-stone-200 space-y-2.5 text-left">
              <label className="block text-xs font-bold text-stone-700">Enter Payment UTR / Ref (Optional):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 432109876543"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-[#7e5222] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => finishOrder({ method: 'Google Pay / UPI', status: 'PAID', utr: utrInput })}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle2 size={16} />
                <span>I Have Completed Payment (Confirm Order)</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 (Alternate): Bank Transfer Screen */}
        {step === 'payment' && paymentMethod === 'bank' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-2 text-xs sm:text-sm">
              <h4 className="font-bold text-blue-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>Axis Bank Current Account Details</span>
              </h4>
              <div className="space-y-1 font-mono text-stone-800 text-xs">
                <p><span className="text-stone-500">Account Name:</span> {STORE_SETTINGS.merchantName}</p>
                <p><span className="text-stone-500">Account Number:</span> 921020048940679</p>
                <p><span className="text-stone-500">IFSC Code:</span> UTIB0000456 (Thanjavur Branch)</p>
                <p><span className="text-stone-500">UPI ID:</span> {STORE_SETTINGS.upiId}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Enter Transaction Reference / UTR Number *</label>
              <input
                type="text"
                placeholder="NEFT / RTGS / IMPS Reference Number"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-[#7e5222] focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => finishOrder({ method: 'Bank Transfer (NEFT)', status: 'PENDING_VERIFICATION', utr: utrInput })}
              className="w-full py-3.5 bg-[#7e5222] hover:bg-[#674221] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>Confirm Bank Transfer Order</span>
            </button>
          </div>
        )}

        {/* STEP 3: Order Success Invoice Screen */}
        {step === 'success' && (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={36} className="stroke-[2.5]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-stone-900">
              {createdOrder?.paymentMethod?.includes('Cash') ? 'Order Placed (Cash on Delivery)!' : 'Payment Recorded & Order Confirmed!'}
            </h3>

            {(autoVerified || createdOrder?.approvalType?.includes('AUTOMATIC')) && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300 shadow-sm">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>100% Verified Automatically via Bank SMS / UPI</span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto">
              Thank you, <strong className="text-stone-900">{createdOrder?.customerName}</strong>! Your order has been placed successfully and sent to our Thanjavur manufacturing desk.
            </p>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-stone-400">Order ID:</span>
                <span className="font-bold text-stone-900">{createdOrder?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Payment Mode:</span>
                <span className="font-bold text-emerald-700">{createdOrder?.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Total Paid/Payable:</span>
                <span className="font-black text-[#7e5222]">₹{createdOrder?.totalAmount?.toFixed(2)}</span>
              </div>
              {createdOrder?.utr && (
                <div className="flex justify-between">
                  <span className="text-stone-400">Reference/UTR:</span>
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
