import React from 'react';
import { ShoppingBag, Star, Sparkles, Layers, SlidersHorizontal } from 'lucide-react';

export default function ProductCard({ product, onSelectProduct, onQuickAdd }) {
  const isLowStock = product.stockUnits < 10000;

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-amber-400/80 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image container with strict Aspect Ratio (4:5 on mobile, 1:1 on desktop) */}
      <div 
        onClick={() => onSelectProduct(product)}
        className="relative aspect-[4/5] sm:aspect-square w-full bg-[#f4ebd4]/40 overflow-hidden cursor-pointer"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category tag */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-stone-900/80 text-white backdrop-blur-sm shadow-sm">
            {product.categoryName}
          </span>
          {product.featured && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-400 text-stone-900 shadow-sm inline-flex items-center gap-1">
              <Sparkles size={10} /> BESTSELLER
            </span>
          )}
        </div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm ${
            isLowStock
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            {product.stockUnits.toLocaleString()} units in stock
          </span>
        </div>

        {/* Quick GSM badge */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-800 shadow-sm border border-stone-200/60 flex items-center gap-1">
          <Layers size={12} className="text-amber-700" />
          <span>{product.gsm} GSM</span>
        </div>
      </div>

      {/* Body content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-semibold text-amber-800">{product.tamilName}</span>
            <div className="flex items-center gap-1 text-amber-600 text-xs font-bold">
              <Star size={13} fill="currentColor" />
              <span>{product.rating}</span>
              <span className="text-stone-400 font-normal">({product.reviewsCount})</span>
            </div>
          </div>

          <h3 
            onClick={() => onSelectProduct(product)}
            className="font-extrabold text-stone-900 text-base sm:text-lg group-hover:text-amber-800 transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          <p className="text-stone-500 text-xs line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>

          {/* Bulk Tier pricing table preview */}
          <div className="mt-3.5 bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
            <div className="text-[11px] font-semibold text-stone-600 mb-1.5 flex justify-between">
              <span>Tiered Bulk Pricing:</span>
              <span className="text-amber-800 font-bold">Save up to 35%</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
              {product.tierPricing.map((tier, idx) => (
                <div key={idx} className="bg-white py-1 px-1 rounded border border-stone-200">
                  <div className="text-stone-500 font-medium">{tier.minQty}+ pcs</div>
                  <div className="font-extrabold text-stone-900">₹{tier.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
          <button
            onClick={() => onSelectProduct(product)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-bold py-2.5 px-3 rounded-xl transition-colors border border-stone-300"
          >
            <SlidersHorizontal size={14} className="text-amber-800" />
            <span>Customize</span>
          </button>

          <button
            onClick={() => onQuickAdd(product)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#7e5222] hover:bg-[#674221] text-white text-xs sm:text-sm font-bold py-2.5 px-3 rounded-xl shadow-sm transition-all"
          >
            <ShoppingBag size={14} />
            <span>Add Min ({product.minOrderQty})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
