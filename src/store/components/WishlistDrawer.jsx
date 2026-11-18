import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function WishlistDrawer({ 
  isOpen, 
  onClose, 
  wishlistItems, 
  onRemoveFromWishlist, 
  onMoveToCart, 
  onClearWishlist 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/50 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="bg-[#fbf7ee] px-6 py-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-900">Wishlist</h2>
                <p className="text-xs text-stone-500">{wishlistItems.length} saved items</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {wishlistItems.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-300 mx-auto flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-stone-800">Your Wishlist is Empty</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Click the ❤️ icon on any bag in the catalog to save it here for fast ordering.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-2.5 bg-[#7e5222] hover:bg-[#674221] text-white rounded-full text-xs font-bold transition-all shadow-md"
                >
                  Explore Bags
                </button>
              </div>
            ) : (
              wishlistItems.map(item => (
                <div
                  key={item.id}
                  className="group relative bg-[#fdfbf7] border border-stone-200 rounded-2xl p-3.5 flex gap-3.5 hover:shadow-md transition-all"
                >
                  {/* Thumbnail (4:5 Aspect Ratio) */}
                  <div className="w-20 h-24 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                    <img
                      src={item.images?.[0] || item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-stone-900 text-xs line-clamp-1">{item.name}</h4>
                        <button
                          onClick={() => onRemoveFromWishlist(item.id)}
                          className="text-stone-300 hover:text-rose-500 transition-colors p-1"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-[#7e5222] font-medium capitalize">{item.category} Bag</p>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        {item.gsm} GSM • Min Order: {item.minOrderQty} pcs
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="font-extrabold text-stone-900 text-sm">
                        ₹{item.pricePerUnit?.toFixed(2)} <span className="text-[10px] font-normal text-stone-500">/ bag</span>
                      </span>

                      <button
                        onClick={() => onMoveToCart(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#7e5222] hover:bg-[#674221] text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Move to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {wishlistItems.length > 0 && (
            <div className="p-6 bg-[#fbf7ee] border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Total Items:</span>
                <span className="font-bold text-stone-900">{wishlistItems.length} items</span>
              </div>
              <button
                onClick={onClearWishlist}
                className="w-full py-2.5 text-center text-xs text-stone-500 hover:text-red-600 font-medium transition-colors"
              >
                Clear Wishlist
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
