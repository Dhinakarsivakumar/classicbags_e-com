import React, { useState } from 'react';
import { Star, ShoppingCart, SlidersHorizontal, Image as ImageIcon, Heart, ShoppingBag } from 'lucide-react';

export default function ProductCard({ 
  product, 
  onSelect, 
  onQuickAdd, 
  isWishlisted = false, 
  onToggleWishlist 
}) {
  const { name, tamilName, images, category, gsm, rating, reviews, tierPricing, minOrderQty, featured, stockUnits, sizes } = product;

  const [hoverIndex, setHoverIndex] = useState(0);

  const categoryLabels = {
    kraft: 'Kraft',
    luxury: 'Boutique',
    food: 'Food Grade',
    custom: 'Custom Print',
  };

  const categoryColors = {
    kraft: 'bg-amber-100 text-amber-800',
    luxury: 'bg-purple-100 text-purple-800',
    food: 'bg-green-100 text-green-800',
    custom: 'bg-blue-100 text-blue-800',
  };

  const currentImage = (images && images.length > 0) ? (images[hoverIndex] || images[0]) : '';

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-stone-100 hover:border-stone-200 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image with 4:5 Mobile Ratio and hover preview */}
      <div 
        onClick={() => onSelect(product)}
        onMouseEnter={() => { if (images && images.length > 1) setHoverIndex(1); }}
        onMouseLeave={() => setHoverIndex(0)}
        className="relative aspect-[4/5] sm:aspect-square overflow-hidden cursor-pointer bg-stone-100"
      >
        {currentImage ? (
          <img
            src={currentImage}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50/70 via-stone-100 to-amber-100/50 p-6 text-center select-none">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-amber-200 flex items-center justify-center text-[#7e5222] mb-3 group-hover:scale-110 transition-transform duration-300">
              <ShoppingBag className="w-8 h-8 text-[#7e5222]" />
            </div>
            <span className="text-xs font-bold text-stone-800 tracking-tight">{name}</span>
            <span className="text-[10px] text-amber-800/80 font-medium bg-amber-100/70 px-2.5 py-0.5 rounded-full mt-1.5 border border-amber-200">
              📷 Photo ready to upload
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Category badge */}
        <span className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full ${categoryColors[category] || 'bg-stone-100 text-stone-700'}`}>
          {categoryLabels[category] || category}
        </span>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(product);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 ${
            isWishlisted
              ? 'bg-white text-rose-500'
              : 'bg-white/80 hover:bg-white text-stone-600 hover:text-rose-500'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* GSM badge */}
        <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-1 rounded-lg">
          {gsm} GSM
        </span>

        {/* Photos dots & count */}
        {images && images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <ImageIcon size={10} className="text-white/80" />
            <span className="text-[10px] text-white/90 font-medium">{images.length}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="text-stone-500 font-semibold uppercase tracking-wider text-[10px]">{categoryLabels[category] || category}</span>
            <div className="flex items-center gap-1 text-amber-600 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{rating}</span>
              <span className="text-stone-400 font-normal">({reviews})</span>
            </div>
          </div>

          <h3 
            onClick={() => onSelect(product)}
            className="text-base font-bold text-stone-800 hover:text-[#7e5222] transition-colors cursor-pointer line-clamp-1"
          >
            {name}
          </h3>

          {/* Tier pricing preview */}
          <div className="mt-3 bg-stone-50 rounded-xl p-2.5 border border-stone-100">
            <div className="text-[11px] text-stone-500 font-medium mb-1.5 flex justify-between">
              <span>Bulk Tier Pricing:</span>
              <span className="text-[#7e5222] font-semibold">
                {product.id === 'cb-001' ? '100 Bags = ₹1.00 (Test Offer)' : `From ₹${tierPricing[tierPricing.length - 1].price.toFixed(2)}`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center">
              {tierPricing.map((tier, idx) => (
                <div key={idx} className="bg-white rounded-lg py-1 px-0.5 border border-stone-200/60">
                  <div className="text-[10px] text-stone-400">{tier.min}+</div>
                  <div className="text-xs font-bold text-stone-800">₹{tier.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
          <button
            onClick={() => onSelect(product)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-[#7e5222] text-xs font-bold rounded-xl transition-colors border border-amber-200/60"
          >
            <SlidersHorizontal size={13} />
            <span>Customize</span>
          </button>
          <button
            onClick={() => onQuickAdd(product)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#7e5222] hover:bg-[#674221] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
          >
            <ShoppingCart size={13} />
            <span>Add Min ({minOrderQty})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
