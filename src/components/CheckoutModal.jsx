import React, { useState, useEffect } from 'react';
import { X, QrCode, Smartphone, CheckCircle, ShieldCheck, Copy, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { STORE_SETTINGS } from '../data/initialData';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  onOrderCreated,
  activePendingOrder,
  onSimulateWebhook
}) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Thanjavur');
  const [address, setAddress] = useState('');
  const [step, setStep] = useState('details'); // 'details' | 'payment' | 'success'
  const [utrInput, setUtrInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Base total
  const baseSubtotal = cartItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

  // Dynamic Unique Paise generation (e.g., adds 0.12 - 0.99 for 100% automated matching)
  const uniquePaise = React.useMemo(() => {
    return Math.floor(Math.random() * 88 + 11) / 100;
  }, [isOpen]);

  const exactPayableAmount = (baseSubtotal + uniquePaise).toFixed(2);
  const orderId = React.useMemo(() => {
    return 'CB-' + Math.floor(1000 + Math.random() * 9000);
  }, [isOpen]);

  // Deep Link for Google Pay UPI Intent
  const upiIntentUrl = `upi://pay?pa=${STORE_SETTINGS.upiId}&pn=${encodeURIComponent(STORE_SETTINGS.merchantName)}&am=${exactPayableAmount}&cu=INR&tn=${orderId}`;

  // QR Code URL (Generates real scannable UPI QR code)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiIntentUrl)}`;

  // Automatically watch if this order got approved by the Webhook Listener!
  useEffect(() => {
    if (activePendingOrder && activePendingOrder.id === orderId && activePendingOrder.status === 'PAID_APPROVED') {
      setStep('success');
    }
  }, [activePendingOrder, orderId]);

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!customerName || !phone) return;

    const newOrder = {
      id: orderId,
      customerName,
      phone,
      city,
      address,
      items: cartItems.map(item => ({
        name: item.name,
        qty: item.quantity,
        price: item.unitPrice,
        size: item.size,
        gsm: item.gsm
      })),
      totalAmount: parseFloat(exactPayableAmount),
      status: 'PENDING_PAYMENT',
      paymentMethod: 'Google Pay for Business',
      timestamp: new Date().toISOString(),
      exactAmountWithPaise: parseFloat(exactPayableAmount)
    };

    onOrderCreated(newOrder);
    setStep('payment');
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(STORE_SETTINGS.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-4">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h2 className="text-base sm:text-lg font-black text-stone-900">
              {step === 'details' && 'Wholesale Delivery Details'}
              {step === 'payment' && 'Google Pay for Business Checkout'}
              {step === 'success' && 'Order Approved & Confirmed!'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* STEP 1: Customer Information */}
        {step === 'details' && (
          <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Business / Shop Name or Contact Person *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senthil Silks / Ramesh Kumar"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">WhatsApp Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="98432XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">City / Region</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Delivery Address</label>
              <textarea
                rows={2}
                placeholder="Shop address, Street, Landmark"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            {/* Total summary */}
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 flex justify-between items-center">
              <div>
                <div className="text-xs text-stone-500 font-semibold">Total Payable Amount</div>
                <div className="text-xs text-amber-900">(Includes Dynamic Matching Paise)</div>
              </div>
              <div className="text-xl font-black text-[#7e5222]">
                ₹{exactPayableAmount}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#7e5222] hover:bg-[#674221] text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all"
            >
              <span>Continue to Google Pay</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* STEP 2: Google Pay Payment Screen */}
        {step === 'payment' && (
          <div className="p-6 space-y-5 text-center">
            
            {/* Amount Banner */}
            <div className="bg-[#fbf7ee] p-4 rounded-2xl border border-[#dec07a]">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Exact Payment Amount</span>
              <div className="text-3xl font-black text-[#7e5222] mt-0.5">
                ₹{exactPayableAmount}
              </div>
              <p className="text-[11px] text-amber-900 mt-1 font-semibold">
                Order ID: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300">{orderId}</span>
              </p>
            </div>

            {/* Mobile: Direct GPay Launch Button */}
            <div className="block sm:hidden">
              <a
                href={upiIntentUrl}
                className="flex items-center justify-center gap-3 w-full bg-stone-900 hover:bg-black text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all"
              >
                <Smartphone size={20} className="text-amber-400" />
                <span>Tap to Pay with Google Pay</span>
              </a>
              <p className="text-[11px] text-stone-400 mt-2">Opens your phone's Google Pay directly.</p>
            </div>

            {/* Desktop: Dynamic QR Code */}
            <div className="hidden sm:flex flex-col items-center">
              <div className="p-3 bg-white rounded-2xl border-2 border-stone-800 shadow-md inline-block">
                <img
                  src={qrCodeUrl}
                  alt="Google Pay QR Code"
                  className="w-48 h-48 rounded-xl object-contain"
                />
              </div>
              <p className="text-xs text-stone-600 font-medium mt-2 flex items-center gap-1">
                <QrCode size={14} className="text-stone-800" />
                <span>Scan with Google Pay / Any UPI App on your phone</span>
              </p>
            </div>

            {/* UPI ID copy */}
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
              <div className="text-left font-mono truncate text-stone-700">
                <span className="text-stone-400 select-none">UPI ID: </span>
                {STORE_SETTINGS.upiId}
              </div>
              <button
                onClick={copyUpiId}
                className="ml-2 px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-300 rounded text-stone-700 font-semibold flex items-center gap-1"
              >
                <Copy size={12} />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Real-time Listening Banner */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800 animate-pulse">
              <Loader2 size={16} className="animate-spin text-emerald-600" />
              <span>Listening for Google Pay notification signal on server...</span>
            </div>

            {/* Demo Simulation Action for user testing */}
            <div className="pt-2 border-t border-stone-200">
              <p className="text-[11px] text-stone-400 mb-2">Simulate real-time Android Notification trigger:</p>
              <button
                type="button"
                onClick={() => {
                  onSimulateWebhook({
                    amount: parseFloat(exactPayableAmount),
                    utr: '4321' + Math.floor(10000000 + Math.random() * 90000000),
                    orderId: orderId,
                    sender: customerName || 'Valued Customer'
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-colors"
              >
                <RefreshCw size={13} className="text-amber-800" />
                <span>⚡ Simulate Google Pay Payment Notification</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Auto-Approval Success Screen */}
        {step === 'success' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle size={36} className="stroke-[2.5]" />
            </div>

            <h3 className="text-2xl font-black text-stone-900">Payment Received & Order Approved!</h3>
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              Your Google Pay payment of <strong className="text-stone-900">₹{exactPayableAmount}</strong> was automatically captured via Webhook. Stock has been deducted and dispatch preparation has begun in Thanjavur.
            </p>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-stone-400">Order Reference:</span>
                <span className="font-bold text-stone-900">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Payment Mode:</span>
                <span className="font-bold text-emerald-700">Google Pay for Business (Auto-Approved)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Dispatch Location:</span>
                <span className="font-bold text-stone-900">LIC Colony, Thanjavur</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-[#7e5222] hover:bg-[#674221] text-white py-3 rounded-xl font-bold text-sm shadow-md"
            >
              Done & Return to Store
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
