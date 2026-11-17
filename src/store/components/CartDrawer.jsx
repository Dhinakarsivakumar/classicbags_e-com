import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, Image as ImageIcon, Shield, ArrowRight } from 'lucide-react';

export default function CartDrawer({ items, onClose, onUpdateQty, onRemove, getUnitPrice, subtotal, onCheckout }) {
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
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-stone-200">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
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
                          onClick={() => onUpdateQty(item.id, item.qty - 50)}
                          className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-16 text-center text-sm font-bold text-stone-800">
                          {item.qty.toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => onUpdateQty(item.id, item.qty + 50)}
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

            {/* Checkout button */}
            <button
              onClick={onCheckout}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#7e5222] hover:bg-[#674221] text-white rounded-full font-semibold transition-all shadow-lg active:scale-[0.98]"
            >
              Proceed to Google Pay Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
