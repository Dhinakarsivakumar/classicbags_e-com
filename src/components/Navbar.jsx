import React from 'react';
import { ShoppingBag, ShieldCheck, Phone, MapPin, LayoutDashboard, Store } from 'lucide-react';

export default function Navbar({ 
  cartCount, 
  onOpenCart, 
  currentView, 
  onViewChange,
  unreadOrdersCount = 0 
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#fbf7ee]/95 backdrop-blur-md border-b border-[#e5d8be]">
      {/* Top micro banner */}
      <div className="bg-[#7e5222] text-[#fbf7ee] text-xs px-4 py-1.5 flex justify-between items-center tracking-wide">
        <div className="flex items-center gap-2">
          <MapPin size={13} className="text-amber-300" />
          <span className="truncate">Plot No. 38, 6th St, LIC Colony, Medical College Rd, Thanjavur</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 font-medium text-amber-200">
            <ShieldCheck size={13} /> 100% Eco-Friendly Certified
          </span>
          <a href="tel:+919843275685" className="hover:underline flex items-center gap-1 text-white">
            <Phone size={12} /> +91 98432 75685
          </a>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div 
          onClick={() => onViewChange('shop')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-[#7e5222] flex items-center justify-center text-white shadow-md shadow-amber-900/20 group-hover:scale-105 transition-transform">
            <ShoppingBag size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-stone-900">CLASSIC BAGS</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 border border-amber-300 uppercase">Thanjavur</span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium -mt-0.5">கிளாசிக் பேக்ஸ் • Wholesale Paper Bags</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* View Switcher: Shop vs Admin */}
          <button
            onClick={() => onViewChange(currentView === 'shop' ? 'admin' : 'shop')}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all border ${
              currentView === 'admin'
                ? 'bg-amber-700 text-white border-amber-800 shadow-inner'
                : 'bg-white/80 text-stone-700 border-stone-300 hover:border-amber-600 hover:text-amber-800 shadow-sm'
            }`}
          >
            {currentView === 'shop' ? (
              <>
                <LayoutDashboard size={16} className="text-amber-600" />
                <span>Admin Dashboard</span>
                {unreadOrdersCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {unreadOrdersCount}
                  </span>
                )}
              </>
            ) : (
              <>
                <Store size={16} className="text-amber-600" />
                <span>Customer Store View</span>
              </>
            )}
          </button>

          {/* Cart Button (Always visible on Shop view) */}
          {currentView === 'shop' && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-[#7e5222] hover:bg-[#674221] text-white px-3.5 py-2 rounded-lg text-sm font-semibold shadow-md shadow-stone-800/10 transition-transform active:scale-95"
            >
              <ShoppingBag size={18} />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-amber-400 text-stone-900 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center -ml-1">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
