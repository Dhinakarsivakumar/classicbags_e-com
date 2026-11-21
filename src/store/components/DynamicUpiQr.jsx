import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, ShieldCheck, RefreshCw, QrCode } from 'lucide-react';
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

  // Dynamic UPI URL formatted cleanly for Personal (P2P) UPI compliance
  const numAmount = parseFloat(amount || 0).toFixed(2);
  const cleanPayee = (merchantName || 'Dhinakar S').replace(/[()]/g, '').trim();
  const upiIntentUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(cleanPayee)}&am=${numAmount}&cu=INR&tn=${encodeURIComponent(orderId || 'ClassicBags')}`;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    QRCode.toDataURL(upiIntentUrl, {
      width: 360,
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
      {/* DIRECT DYNAMIC UPI QR CARD (Visible directly on Mobile & Desktop) */}
      {/* ============================================================== */}
      <div className="w-full bg-white rounded-3xl border-2 border-stone-800 shadow-2xl overflow-hidden transition-all">
        {/* Google 4-Color Accent Bar */}
        <div className="h-2 w-full grid grid-cols-4">
          <div className="bg-[#4285F4]" />
          <div className="bg-[#34A853]" />
          <div className="bg-[#FBBC05]" />
          <div className="bg-[#EA4335]" />
        </div>

        {/* Card Header */}
        <div className="pt-4 pb-2 px-4 sm:px-5 text-center">
          {/* Google Pay Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold mb-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              <path fill="#34A853" d="M11 7h2v6h-2z"/>
              <path fill="#FBBC05" d="M11 15h2v2h-2z"/>
            </svg>
            <span>Scan &amp; Pay with Any UPI App</span>
          </div>

          <h4 className="text-base sm:text-lg font-black tracking-tight text-stone-900">{cleanPayee}</h4>
          <div className="mt-1 inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
            ● Live Dynamic QR Code
          </div>
        </div>

        {/* DIRECT QR Code Canvas / Image Display */}
        <div className="px-4 sm:px-5 py-2 flex flex-col items-center">
          <div className="relative p-2.5 bg-white rounded-2xl border-2 border-stone-300 shadow-inner w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] flex items-center justify-center">
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
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">₹{numAmount}</span>
            <span className="text-[11px] text-stone-500 block mt-0.5">Order Ref: <strong className="text-stone-800 font-mono">{orderId}</strong></span>
          </div>
        </div>

        {/* Card Footer with UPI ID & Accepted Brands */}
        <div className="px-4 sm:px-5 pb-4 pt-2 text-center border-t border-stone-100 mt-2 bg-stone-50/50">
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

      {/* Copy UPI Button */}
      <div className="mt-3 w-full">
        <button
          type="button"
          onClick={handleCopyUpi}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold border border-stone-300 transition-colors shadow-sm"
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

      {/* Safety Notice */}
      <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-2">
        <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0" />
        <span>Direct 100% verified settlement to {cleanPayee}</span>
      </div>
    </div>
  );
}
