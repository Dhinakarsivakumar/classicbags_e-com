import React from 'react';
import { Leaf, Award, Truck, Sparkles, MessageCircle, ArrowDown } from 'lucide-react';

export default function Hero({ onExploreClick, onCustomOrderClick }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f5ebd4] to-[#fbf9f5] border-b border-[#e9dcbe] pt-8 pb-14 px-4 sm:px-6 lg:px-8">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-orange-300/20 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left copy */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-100/90 text-amber-900 border border-amber-300/80 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm">
              <Sparkles size={14} className="text-amber-600" />
              <span>Direct Manufacturer Wholesale • Thanjavur</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.15]">
              Eco-Friendly Paper Bags & Custom Packaging{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-800 to-stone-900 block mt-1 font-tamil">
                கிளாசிக் பேப்பர் பேக்ஸ்
              </span>
            </h1>

            <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              We manufacture certified virgin brown kraft, white luxury boutique bags, and greaseproof bakery bags with custom multi-color brand printing in Thanjavur. Best tiered factory pricing with instant Google Pay checkout.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onExploreClick}
                className="flex items-center gap-2 bg-[#7e5222] hover:bg-[#674221] text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-950/15 transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
              >
                <span>Browse Bag Catalog</span>
                <ArrowDown size={16} />
              </button>

              <button
                onClick={onCustomOrderClick}
                className="flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 px-5 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all hover:border-amber-600"
              >
                <Sparkles size={16} className="text-amber-600" />
                <span>Custom Logo Printing</span>
              </button>

              <a
                href="https://wa.me/919843275685?text=Hello%20Classic%20Bags%20Thanjavur,%20I%20want%20wholesale%20paper%20bags%20quotation."
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all"
              >
                <MessageCircle size={16} />
                <span>WhatsApp Order</span>
              </a>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-amber-200/60 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2 text-left">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                  <Leaf size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">100% Bio</div>
                  <div className="text-[11px] text-stone-500">Plastic-Free</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-left">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-900">
                  <Award size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">80 - 180 GSM</div>
                  <div className="text-[11px] text-stone-500">Heavy Duty</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-left">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-900">
                  <Truck size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Fast Delivery</div>
                  <div className="text-[11px] text-stone-500">TN & Pan-India</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right visual card - Aspect Ratio Friendly */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-sm lg:max-w-none bg-white p-3.5 rounded-2xl shadow-xl shadow-stone-900/10 border border-[#e5d8be]">
              {/* Product Badge */}
              <div className="absolute top-6 left-6 z-20 bg-stone-900/90 text-white backdrop-blur-sm text-xs px-3 py-1 rounded-full font-semibold shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Factory Direct • Thanjavur Stock
              </div>

              {/* 4:5 Mobile Ratio friendly preview */}
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80"
                  alt="Classic Paper Bags"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />
                
                {/* Floating stock pill */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-stone-200/80 shadow-lg flex items-center justify-between">
                  <div>
                    <div className="text-xs text-stone-500 font-semibold">Bulk Price Starting at</div>
                    <div className="text-base font-extrabold text-[#7e5222]">₹3.80 <span className="text-xs font-normal text-stone-600">/ bag</span></div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-md">
                      Instant GPay Auto-Approve
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
