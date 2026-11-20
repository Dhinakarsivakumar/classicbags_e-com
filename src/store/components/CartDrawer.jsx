import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, Image as ImageIcon, Shield, ArrowRight } from 'lucide-react';

export default function CartDrawer({ items, onClose, onUpdateQty, onRemove, getUnitPrice, subtotal, onCheckout, authUser }) {
  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-slideInRight flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#7e5222]" />
            <h2 className="text-lg font-bold text-stone-800">
              Your Cart
            </h2>
            <span className="bg-[#7e5222] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-stone-600" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-9 h-9 text-stone-300" />
              </div>
              <h3 className="text-lg font-semibold text-stone-700 mb-1">Your cart is empty</h3>
              <p className="text-sm text-stone-400 mb-6">Browse our eco-friendly paper bags and add your first order.</p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#7e5222] hover:bg-[#674221] text-white rounded-full font-semibold transition-all"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            /* Item List */
            <div className="p-4 space-y-3">
              {items.map(item => {
                const unitPrice = getUnitPrice(item.tierPricing, item.qty);
                const lineTotal = unitPrice * item.qty;

                return (
                  <div
                    key={item.id}
                    className="bg-stone-50 rounded-2xl p-4 border border-stone-100 animate-fadeIn"
                  >
                    <div className="flex gap-3">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100 border border-stone-200 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-7 h-7 text-stone-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name */}
                        <h4 className="font-semibold text-sm text-stone-800 truncate">{item.name}</h4>

                        {/* Details */}
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-stone-400">{item.size}</span>
                          <span className="text-xs text-stone-300">•</span>
                          <span className="text-xs text-stone-400">{item.gsm} GSM</span>
                          {item.logoFile && (
                            <>
                              <span className="text-xs text-stone-300">•</span>
                              <span className="inline-flex items-center gap-0.5 text-xs text-blue-600">
                                <ImageIcon className="w-3 h-3" />
                                Logo
                              </span>
                            </>
                          )}
                        </div>

                        {/* Unit price */}
                        <p className="text-xs text-stone-400 mt-1">
                          ₹{unitPrice.toFixed(2)} / bag
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => onRemove(item.id)}
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors group"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400 group-hover:text-red-600" />
                      </button>
                    </div>

                    {/* Qty Stepper & Line Total */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-200">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQty(item.id, item.qty - (item.qty <= 10 ? 1 : 50))}
                          className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-16 text-center text-sm font-bold text-stone-800">
                          {item.qty.toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => onUpdateQty(item.id, item.qty + (item.qty < 10 ? 1 : 50))}
                          className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-base font-bold text-[#7e5222]">
                        ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 p-5 space-y-4 bg-white">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-stone-600 font-medium">Subtotal</span>
              <span className="text-xl font-extrabold text-stone-900">
                ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              <span>Zero gateway fee • Direct Google Pay</span>
            </div>

            {/* Checkout button - Requires Google Login */}
            <button
              onClick={onCheckout}
              className={`w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-[0.98] ${
                authUser
                  ? 'bg-[#7e5222] hover:bg-[#674221] text-white shadow-amber-950/20'
                  : 'bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-300 shadow-md'
              }`}
            >
              {!authUser ? (
                <>
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign In with Google to Checkout</span>
                </>
              ) : (
                <>
                  <span>Proceed to Google Pay Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
