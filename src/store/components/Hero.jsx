import React from 'react';
import { ArrowRight, MessageCircle, Sparkles, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import { STORE_SETTINGS } from '../../shared/data/initialData';

export default function Hero({ products, onCustomizeClick }) {
  const featuredProduct = products.find(p => p.featured) || products[0];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#fbf7ee] via-[#f4ebd4] to-[#fbf7ee]">
      {/* Decorative blurred circles */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl" />
      <div className="absolute top-40 right-1/3 w-64 h-64 bg-yellow-100/40 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="animate-fadeIn">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur rounded-full border border-amber-200 mb-6">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-xs sm:text-sm font-semibold text-[#7e5222]">
                Direct Manufacturer Wholesale • Thanjavur
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-[#3d2510] leading-tight mb-3">
              Eco-Friendly{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7e5222] to-amber-600">
                Paper Bags
              </span>{' '}
              & Custom Packaging
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-[#7e5222]/80 font-medium mb-4">
              Premium Kraft Packaging • Thanjavur
            </p>

            {/* Description */}
            <p className="text-stone-600 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              Wholesale kraft paper bags manufactured in Thanjavur. 100% biodegradable,
              custom logo printing available. Direct factory prices from ₹2.30/bag.
              Serving retail chains, bakeries, and boutiques across Tamil Nadu.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-8">
              <a
                href="#catalog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#7e5222] hover:bg-[#674221] text-white rounded-full font-semibold transition-all duration-200 shadow-lg shadow-amber-900/20 hover:shadow-xl active:scale-95"
              >
                Browse Catalog
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => {
                  if (onCustomizeClick) {
                    onCustomizeClick();
                  } else {
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-stone-50 text-[#7e5222] border border-[#7e5222]/30 rounded-full font-semibold transition-all duration-200 shadow-sm active:scale-95"
              >
                <SlidersHorizontal className="w-4 h-4" />
                🎨 Custom Logo Printing
              </button>
              <a
                href={`https://wa.me/${STORE_SETTINGS.whatsapp}?text=Hi%20Classic%20Bags!%20I'd%20like%20to%20place%20a%20wholesale%20order.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold transition-all duration-200 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Order
              </a>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                🌱 100% Biodegradable
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-200">
                📏 80–180 GSM Range
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                🚚 Fast Delivery Thanjavur
              </span>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={featuredProduct?.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'}
                    alt="Featured Paper Bag"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 bg-gradient-to-t from-stone-900 via-stone-900/90 to-transparent absolute inset-0 flex flex-col justify-end text-white">
                  <div className="inline-block bg-amber-500 text-stone-900 text-xs font-bold px-3 py-1 rounded-full mb-2 self-start">
                    ★ Wholesale Top Seller
                  </div>
                  <h3 className="text-xl font-bold">{featuredProduct?.name}</h3>
                  <p className="text-xs text-amber-200 font-medium mb-3">{featuredProduct?.tamilName}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/20">
                    <div>
                      <span className="text-xs text-stone-300">Wholesale from</span>
                      <p className="text-2xl font-extrabold text-amber-400">
                        ₹{featuredProduct?.pricePerUnit?.toFixed(2)} <span className="text-xs text-white font-normal">/ unit</span>
                      </p>
                    </div>
                    <button
                      onClick={() => onCustomizeClick ? onCustomizeClick() : null}
                      className="px-4 py-2 bg-white text-[#7e5222] rounded-xl text-xs font-bold hover:bg-amber-50 transition-colors shadow"
                    >
                      Customize Now ➔
                    </button>
                  </div>
                </div>
              </div>

              {/* Float pill */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-800">Direct From Factory</p>
                  <p className="text-[11px] text-stone-500">No middlemen commission</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
