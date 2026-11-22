import React, { useState } from 'react';
import { Phone, MapPin, ShieldCheck, Mail } from 'lucide-react';
import { STORE_SETTINGS } from '../../shared/data/initialData';

export default function Footer({ onOpenAdmin }) {
  const [tapCount, setTapCount] = useState(0);

  const handleSecretTap = () => {
    const next = tapCount + 1;
    if (next >= 3) {
      setTapCount(0);
      if (onOpenAdmin) onOpenAdmin();
    } else {
      setTapCount(next);
      setTimeout(() => setTapCount(0), 1800);
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-400 text-xs py-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-extrabold text-white text-base tracking-tight">{STORE_SETTINGS.storeName}</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">Thanjavur</span>
          </div>
          <p className="text-stone-400 leading-relaxed text-xs">
            {STORE_SETTINGS.tagline}. Manufacturing high-quality virgin kraft paper bags, luxury boutique packaging, and oil-resistant food bags directly from our factory in Thanjavur.
          </p>
          <div className="mt-4 flex items-center gap-2 text-emerald-400 font-medium">
            <ShieldCheck size={16} />
            <span>100% Biodegradable & Recyclable</span>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white text-sm mb-3">Factory & Store Address</h4>
          <p className="flex items-start gap-2 text-stone-300">
            <MapPin size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <span>{STORE_SETTINGS.location}</span>
          </p>
          <p className="flex items-center gap-2 mt-3 text-stone-300">
            <Phone size={14} className="text-amber-500" />
            <a href={`https://wa.me/${STORE_SETTINGS.whatsapp || '919843275685'}`} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <span>{STORE_SETTINGS.phone}</span>
              <span className="text-[10px] bg-emerald-900/60 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-700/50">WhatsApp</span>
            </a>
          </p>
          <p className="flex items-center gap-2 mt-2 text-stone-300">
            <Mail size={14} className="text-amber-500" />
            <span>orders@classicbags.thanjavur</span>
          </p>
        </div>

        <div>
          <h4 className="font-bold text-white text-sm mb-3">Google Pay Zero-Touch Order</h4>
          <p className="text-stone-400 leading-relaxed text-xs">
            Seamless UPI checkout with automatic order verification. No transaction fees, no gateway middlemen. Direct manufacturer pricing for wholesale and retail buyers.
          </p>
          <div className="mt-4 p-3 bg-stone-800/80 rounded-xl border border-stone-700 text-[11px] text-stone-300">
            <span className="text-amber-400 font-bold">Factory Hours:</span> Mon – Sat: 9:30 AM – 7:30 PM
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-stone-500 text-[11px] gap-2 select-none">
        <span 
          onClick={handleSecretTap}
          className="cursor-default hover:text-stone-400 transition-colors"
          title="Classic Bags Thanjavur"
        >
          © {new Date().getFullYear()} Classic Bags Thanjavur. All rights reserved.
        </span>
        <span>Factory Direct Wholesale Paper Bags</span>
      </div>
    </footer>
  );
}
