import React from 'react';
import { ShoppingBag, Phone, MapPin, Leaf } from 'lucide-react';
import { STORE_SETTINGS } from '../../shared/data/initialData';

export default function Navbar({ cartItemCount, onCartOpen }) {
  return (
    <header className="sticky top-0 z-50">
      {/* Micro Banner */}
      <div className="bg-[#674221] text-amber-50 text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-1.5 truncate">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{STORE_SETTINGS.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Leaf className="w-3 h-3 text-green-300" />
            <span className="font-medium">100% Eco-Certified</span>
          </div>
          <a
            href={`tel:${STORE_SETTINGS.phone}`}
            className="flex items-center gap-1.5 hover:text-amber-200 transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span className="font-medium">{STORE_SETTINGS.phone}</span>
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-[#fbf7ee]/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7e5222] to-[#674221] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#674221] tracking-tight leading-none">
                  CLASSIC BAGS
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-[#7e5222] bg-amber-100 px-1.5 py-0.5 rounded">
                    THANJAVUR
                  </span>
                  <span className="text-[10px] text-stone-400">Since 2018</span>
                </div>
              </div>
            </a>

            {/* Right: Nav links + Cart */}
            <div className="flex items-center gap-6">
              <a
                href="#catalog"
                className="hidden md:block text-sm font-medium text-stone-600 hover:text-[#7e5222] transition-colors"
              >
                Products
              </a>
              <a
                href={`https://wa.me/${STORE_SETTINGS.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:block text-sm font-medium text-stone-600 hover:text-green-600 transition-colors"
              >
                WhatsApp
              </a>

              {/* Cart Button */}
              <button
                onClick={onCartOpen}
                className="relative flex items-center gap-2 px-4 py-2 bg-[#7e5222] hover:bg-[#674221] text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="text-sm font-semibold hidden sm:inline">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-fadeIn">
                    {cartItemCount > 9999 ? '9k+' : cartItemCount.toLocaleString('en-IN')}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
