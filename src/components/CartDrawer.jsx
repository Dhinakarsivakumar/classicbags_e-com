import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQty, onRemoveItem, onProceedToCheckout }) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#7e5222]" />
              <h2 className="text-base font-extrabold text-stone-900">Your Bag Order Cart</h2>
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                {cartItems.length} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-100">
            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag size={48} className="mx-auto text-stone-300 stroke-[1.5]" />
                <h3 className="mt-4 font-bold text-stone-700 text-sm">Your order cart is empty</h3>
                <p className="text-stone-400 text-xs mt-1">Browse our paper bag catalog to add wholesale items.</p>
                <button
                  onClick={onClose}
                  className="mt-5 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item, index) => (
                <div key={index} className="py-4 flex gap-3.5 items-start">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-20 object-cover rounded-xl bg-stone-100 border border-stone-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-900 truncate">{item.name}</h4>
                    <p className="text-[11px] text-stone-500">{item.size} • {item.gsm} GSM</p>
                    {item.customLogoName && (
                      <span className="inline-block mt-0.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        Logo: {item.customLogoName}
                      </span>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      {/* Quantity input */}
                      <div className="flex items-center gap-1.5 border border-stone-200 rounded-lg p-0.5 bg-stone-50">
                        <button
                          onClick={() => onUpdateQty(index, Math.max(50, item.quantity - 50))}
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-stone-600 hover:bg-white rounded"
                        >
                          -
                        </button>
                        <span className="text-xs font-extrabold px-1 text-stone-800">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQty(index, item.quantity + 50)}
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-stone-600 hover:bg-white rounded"
                        >
                          +
                        </button>
                      </div>

                      {/* Total */}
                      <div className="text-right">
                        <div className="text-xs font-black text-[#7e5222]">
                          ₹{(item.unitPrice * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-stone-400">@ ₹{item.unitPrice.toFixed(2)}/pc</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(index)}
                    className="text-stone-300 hover:text-red-500 p-1"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="flex justify-between items-center text-sm font-bold text-stone-800">
                <span>Order Total:</span>
                <span className="text-xl font-black text-[#7e5222]">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Zero gateway fee • Direct Google Pay Auto-Approval</span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#7e5222] hover:bg-[#674221] text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.99]"
              >
                <span>Proceed to Google Pay Checkout</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
