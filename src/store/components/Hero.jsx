import React from 'react';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { STORE_SETTINGS } from '../../shared/data/initialData';

export default function Hero({ products }) {
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

            {/* Tamil text */}
            <p className="text-lg sm:text-xl text-[#7e5222]/70 font-medium mb-4">
              கிளாசிக் பேப்பர் பேக்ஸ்
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
              <a
                href="#catalog"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-stone-50 text-[#7e5222] border border-[#7e5222]/30 rounded-full font-semibold transition-all duration-200"
              >
                🎨 Custom Logo Printing
              </a>
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
                🚚 Fast Delivery
              </span>
            </div>
          </div>

          {/* Right: Featured Product Preview */}
          {featuredProduct && (
            <div className="relative animate-slideInUp hidden lg:block">
              <div className="relative bg-white rounded-3xl shadow-2xl shadow-stone-900/10 overflow-hidden border border-stone-100 max-w-sm ml-auto">
                {/* Product Image 4:5 */}
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img
                    src={featuredProduct.images[0]}
                    alt={featuredProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                  {/* Floating price pill */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
                    <p className="text-xs text-stone-500 font-medium">Starting from</p>
                    <p className="text-2xl font-bold text-[#7e5222]">
                      ₹{featuredProduct.tierPricing[featuredProduct.tierPricing.length - 1].price.toFixed(2)}
                      <span className="text-xs text-stone-400 font-normal">/bag</span>
                    </p>
                  </div>

                  {/* Featured badge */}
                  <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    BESTSELLER
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="font-bold text-stone-800 text-lg">{featuredProduct.name}</h3>
                  <p className="text-sm text-stone-500 mt-1">
                    {featuredProduct.gsm} GSM • Min. {featuredProduct.minOrderQty} pcs
                  </p>
                </div>
              </div>

              {/* Decorative floating elements */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-amber-200/50 rounded-2xl -rotate-12 -z-10" />
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-orange-200/50 rounded-full -z-10" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
