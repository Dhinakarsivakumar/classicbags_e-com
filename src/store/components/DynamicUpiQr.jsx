import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Smartphone, ShieldCheck, RefreshCw, QrCode, ArrowRight } from 'lucide-react';
import { STORE_SETTINGS } from '../../shared/data/initialData';

export default function DynamicUpiQr({ 
  amount, 
  orderId, 
  merchantName = STORE_SETTINGS.merchantName,
  upiId = STORE_SETTINGS.upiId,
  phone = STORE_SETTINGS.phone
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQrOnMobile, setShowQrOnMobile] = useState(false);

  // Dynamic UPI URL formatted cleanly for Personal (P2P) UPI compliance
  const numAmount = parseFloat(amount || 0).toFixed(2);
  const cleanPayee = (merchantName || 'Dhinakar S').replace(/[()]/g, '').trim();
  const upiIntentUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(cleanPayee)}&am=${numAmount}&cu=INR&tn=${encodeURIComponent(orderId || 'ClassicBags')}`;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    QRCode.toDataURL(upiIntentUrl, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#111827',
        light: '#ffffff'
      }
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate dynamic UPI QR code:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [upiIntentUrl]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      
      {/* ============================================================== */}
      {/* 1. MOBILE VIEW (Visible on phones): 1-Tap Direct UPI Pay Buttons */}
      {/* ============================================================== */}
      <div className="block sm:hidden w-full space-y-3">
        {/* Payable Amount Summary Banner */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 rounded-3xl border border-amber-200 text-center shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Total Payable Amount</span>
          <div className="text-3xl font-black text-[#7e5222] my-0.5">
            ₹{numAmount}
          </div>
          <div className="text-xs text-stone-600 font-medium">
            Payee: <strong className="text-stone-900">{cleanPayee}</strong> ({upiId})
          </div>
          <div className="text-[11px] text-amber-800 font-mono mt-1">
            Order Ref: <span className="bg-white px-2 py-0.5 rounded border border-amber-300 font-bold">{orderId}</span>
          </div>
        </div>

        {/* Primary 1-Tap Pay with Google Pay Button */}
        <a
          href={upiIntentUrl}
          className="flex items-center justify-between w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white p-3.5 rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <path fill="#34A853" d="M11 7h2v6h-2z"/>
                <path fill="#FBBC05" d="M11 15h2v2h-2z"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="text-xs font-medium text-blue-100">Recommended UPI App</div>
              <div className="text-sm font-black">Pay ₹{numAmount} with Google Pay</div>
            </div>
          </div>
          <ArrowRight size={18} className="text-blue-100" />
        </a>

        {/* Secondary: Pay with PhonePe / Paytm / Any UPI App */}
        <a
          href={upiIntentUrl}
          className="flex items-center justify-between w-full bg-gradient-to-r from-[#5f259f] to-[#00baf2] hover:opacity-95 text-white p-3 rounded-2xl font-bold shadow-md active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Smartphone size={18} className="text-white" />
            </div>
            <div className="text-left">
              <div className="text-[11px] text-purple-100">PhonePe • Paytm • BHIM • Cred</div>
              <div className="text-xs font-bold">Open Any Other UPI App</div>
            </div>
          </div>
          <ArrowRight size={16} className="text-white/80" />
        </a>

        {/* Copy UPI Option */}
        <div className="bg-stone-50 p-2 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
          <div className="text-left font-mono truncate text-stone-700 font-semibold px-1">
            <span className="text-stone-400 select-none">UPI: </span>
            {upiId}
          </div>
          <button
            type="button"
            onClick={handleCopyUpi}
            className="px-3 py-1 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg text-[#7e5222] font-bold shadow-sm"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Mobile: Optional Toggle to view QR code (in case paying from another device) */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setShowQrOnMobile(!showQrOnMobile)}
            className="text-[11px] text-[#7e5222] font-semibold hover:underline inline-flex items-center gap-1"
          >
            <QrCode size={13} />
            <span>{showQrOnMobile ? 'Hide QR Code' : 'Paying from another phone? View QR Code'}</span>
          </button>

          {showQrOnMobile && (
            <div className="mt-2 p-3 bg-white rounded-2xl border border-stone-200 flex flex-col items-center animate-fadeIn shadow-sm">
              <div className="w-[180px] h-[180px] p-2 bg-white rounded-xl border border-stone-300">
                {qrDataUrl && <img src={qrDataUrl} alt="UPI QR" className="w-full h-full object-contain" />}
              </div>
              <span className="text-[10px] text-stone-500 mt-1">Scan using any UPI App</span>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. DESKTOP VIEW (Visible on PC / Laptop / Tablet): Prominent QR */}
      {/* ============================================================== */}
      <div className="hidden sm:block w-full">
        {/* Official UPI / Google Pay Card Frame */}
        <div className="w-full bg-white rounded-3xl border-2 border-stone-800 shadow-2xl overflow-hidden transition-all">
          {/* Google 4-Color Accent Bar */}
          <div className="h-2 w-full grid grid-cols-4">
            <div className="bg-[#4285F4]" />
            <div className="bg-[#34A853]" />
            <div className="bg-[#FBBC05]" />
            <div className="bg-[#EA4335]" />
          </div>

          {/* Card Header */}
          <div className="pt-4 pb-2 px-5 text-center">
            {/* Google Pay Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold mb-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <path fill="#34A853" d="M11 7h2v6h-2z"/>
                <path fill="#FBBC05" d="M11 15h2v2h-2z"/>
              </svg>
              <span>Google Pay • Scan & Pay</span>
            </div>

            <h4 className="text-base font-black tracking-tight text-stone-900">{cleanPayee}</h4>
            <p className="text-xs text-stone-500 font-medium">{phone}</p>
            <div className="mt-1 inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
              ● Live Dynamic QR Code
            </div>
          </div>

          {/* QR Code Canvas / Image Display */}
          <div className="px-5 py-2 flex flex-col items-center">
            <div className="relative p-2.5 bg-white rounded-2xl border border-stone-300 shadow-inner w-[240px] h-[240px] flex items-center justify-center">
              {loading ? (
                <div className="flex flex-col items-center gap-2 text-stone-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#7e5222]" />
                  <span className="text-xs font-semibold">Generating QR...</span>
                </div>
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`Dynamic UPI QR Code for ₹${numAmount} to ${cleanPayee}`}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-xs text-red-500">Failed to render QR Code</div>
              )}
            </div>

            {/* Amount Badge inside the card */}
            <div className="mt-3 text-center">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">Pre-Filled Amount</span>
              <span className="text-2xl font-black text-emerald-700">₹{numAmount}</span>
              <span className="text-[11px] text-stone-500 block">Order Ref: <strong className="text-stone-800 font-mono">{orderId}</strong></span>
            </div>
          </div>

          {/* Card Footer with UPI ID & Accepted Brands */}
          <div className="px-5 pb-4 pt-2 text-center border-t border-stone-100 mt-2 bg-stone-50/50">
            <div className="text-[11px] font-mono text-stone-600 font-semibold mb-2">
              UPI ID: <span className="text-stone-900 font-bold select-all">{upiId}</span>
            </div>

            {/* Supported UPI Apps Pills */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 bg-white rounded border border-stone-200 text-[10px] font-bold text-stone-700">GPay</span>
              <span className="px-2 py-0.5 bg-white rounded border border-stone-200 text-[10px] font-bold text-purple-700">PhonePe</span>
              <span className="px-2 py-0.5 bg-white rounded border border-stone-200 text-[10px] font-bold text-sky-600">Paytm</span>
              <span className="px-2 py-0.5 bg-white rounded border border-stone-200 text-[10px] font-bold text-orange-600">BHIM</span>
              <span className="px-2 py-0.5 bg-white rounded border border-stone-200 text-[10px] font-bold text-stone-600">Any UPI</span>
            </div>
          </div>
        </div>

        {/* Copy UPI Button for Desktop */}
        <div className="mt-3">
          <button
            type="button"
            onClick={handleCopyUpi}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold border border-stone-300 transition-colors"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-700 font-bold">UPI ID Copied ({upiId})</span>
              </>
            ) : (
              <>
                <Copy size={14} className="text-stone-500" />
                <span>Copy UPI ID ({upiId})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Safety Notice (Visible across both views) */}
      <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-2">
        <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0" />
        <span>Direct 100% verified settlement to {cleanPayee}</span>
      </div>
    </div>
  );
}
