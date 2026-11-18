import React, { useState, useMemo, useRef } from 'react';
import { X, Upload, ShoppingCart, Minus, Plus, Image as ImageIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export default function ProductCustomizerModal({ product, onClose, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedGsm, setSelectedGsm] = useState(product.gsm);
  const [selectedHandle, setSelectedHandle] = useState(product.handles[0]);
  const [qty, setQty] = useState(product.minOrderQty);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [printNotes, setPrintNotes] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const fileInputRef = useRef(null);

  const images = (product.images && product.images.length > 0) 
    ? product.images 
    : ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'];

  const currentImage = images[activeImageIndex] || images[0];

  const gsmOptions = [90, 120, 150, 180];
  const qtyPresets = product.minOrderQty === 1 ? [1, 5, 25, 50, 100] : [100, 500, 1000, 2500, 5000];

  // Calculate price from tier pricing
  const unitPrice = useMemo(() => {
    let price = product.tierPricing[0].price;
    for (const tier of product.tierPricing) {
      if (qty >= tier.min) price = tier.price;
    }
    const gsmDiff = selectedGsm - product.gsm;
    const gsmAdjustment = product.pricePerUnit < 0.1 ? 0 : gsmDiff * 0.01;
    return Math.max(price + gsmAdjustment, 0.01);
  }, [qty, selectedGsm, product]);

  const totalPrice = unitPrice * qty;

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    onAddToCart({
      productId: product.id,
      name: product.name,
      image: currentImage,
      size: selectedSize,
      gsm: selectedGsm,
      handle: selectedHandle,
      qty,
      tierPricing: product.tierPricing,
      unitPrice,
      price: unitPrice,
      logoFile,
      logoPreview,
      printNotes,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-5xl sm:mx-4 bg-white sm:rounded-3xl overflow-hidden animate-fadeIn flex flex-col shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-stone-600" />
        </button>

        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-12 gap-0">
            
            {/* Left: Flipkart-style Multi-Image Gallery (5 columns) */}
            <div className="md:col-span-6 bg-stone-50 p-4 sm:p-6 flex flex-col justify-between border-r border-stone-200">
              
              {/* Main Preview Container with 4:5 aspect ratio */}
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-white shadow-inner border border-stone-200 group">
                <img
                  src={currentImage}
                  alt={`${product.name} view ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Left / Right Carousel Controls if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-stone-800 transition-all opacity-80 group-hover:opacity-100"
                      title="Previous photo"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-stone-800 transition-all opacity-80 group-hover:opacity-100"
                      title="Next photo"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Photo counter badge */}
                {images.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {activeImageIndex + 1} / {images.length} Photos
                  </div>
                )}

                {/* Logo overlay if uploaded */}
                {logoPreview && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
                    <div className="bg-white/85 p-3 rounded-xl shadow-lg border border-amber-300 max-w-[120px] max-h-[120px] flex items-center justify-center">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Bottom title pill */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
                  <h2 className="text-white text-base sm:text-lg font-bold">{product.name}</h2>
                  <p className="text-amber-200 text-xs">{product.tamilName}</p>
                </div>
              </div>

              {/* Flipkart-Style Thumbnail Row */}
              {images.length > 1 && (
                <div className="mt-4 pt-3 border-t border-stone-200">
                  <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase tracking-wider">
                    Product Angles &amp; Views (Click to preview):
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto pb-1">
                    {images.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-16 h-18 aspect-[4/5] rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 ${
                          activeImageIndex === idx
                            ? 'border-[#7e5222] ring-2 ring-[#7e5222]/30 scale-105 shadow-md'
                            : 'border-stone-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {activeImageIndex === idx && (
                          <div className="absolute bottom-0 inset-x-0 bg-[#7e5222] text-white text-[9px] text-center font-bold py-0.2">
                            View {idx + 1}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Customization Options (7 columns) */}
            <div className="md:col-span-6 p-6 sm:p-8 space-y-5">
              <div>
                <h3 className="text-xl font-bold text-stone-800 mb-1">Customize Your Wholesale Order</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{product.description}</p>
              </div>

              {/* Size selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                  Bag Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedSize === size
                          ? 'bg-[#7e5222] text-white shadow-sm'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* GSM selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                  Paper Thickness (GSM)
                </label>
                <div className="flex flex-wrap gap-2">
                  {gsmOptions.map(g => (
                    <button
                      key={g}
                      onClick={() => setSelectedGsm(g)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedGsm === g
                          ? 'bg-[#7e5222] text-white shadow-sm'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {g} GSM
                    </button>
                  ))}
                </div>
              </div>

              {/* Handle type */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                  Handle Style
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.handles.map(handle => (
                    <button
                      key={handle}
                      onClick={() => setSelectedHandle(handle)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedHandle === handle
                          ? 'bg-[#7e5222] text-white shadow-sm'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {handle}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                    Quantity
                  </label>
                  <span className="text-xs font-bold text-emerald-800">
                    ₹{unitPrice.toFixed(2)} / bag
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
                    <button
                      onClick={() => setQty(prev => {
                        const step = prev <= 10 ? 1 : 50;
                        return Math.max(product.minOrderQty, prev - step);
                      })}
                      className="px-3 py-2 hover:bg-stone-100 text-stone-600 font-bold"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => setQty(Math.max(product.minOrderQty, parseInt(e.target.value) || product.minOrderQty))}
                      className="w-20 text-center font-bold text-stone-800 bg-transparent text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => setQty(prev => {
                        const step = prev < 10 ? 1 : 50;
                        return prev + step;
                      })}
                      className="px-3 py-2 hover:bg-stone-100 text-stone-600 font-bold"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {qtyPresets.map(preset => (
                      <button
                        key={preset}
                        onClick={() => setQty(preset)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                          qty === preset
                            ? 'bg-[#7e5222] text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logo upload */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                  Custom Logo Printing (Optional)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-200 hover:border-[#7e5222] rounded-2xl p-3 text-center cursor-pointer transition-colors bg-stone-50/50"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  {logoFile ? (
                    <div className="flex items-center justify-center gap-2 text-xs text-[#7e5222] font-semibold">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{logoFile} (Click to change)</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
                      <Upload className="w-4 h-4 text-stone-400" />
                      <span>Upload shop logo (PNG, JPG)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Print notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wide">
                  Print Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g., Shop name in Red, address on back"
                  value={printNotes}
                  onChange={(e) => setPrintNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-[#7e5222]"
                />
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-100 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="text-xs text-stone-500">Estimated Total ({qty.toLocaleString()} Bags)</div>
            <div className="text-xl font-black text-[#7e5222]">
              ₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <button
            onClick={() => {
              handleAddToCart();
              onClose();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#7e5222] hover:bg-[#674221] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <ShoppingCart size={16} />
            <span>Add to Cart</span>
          </button>
        </div>

      </div>
    </div>
  );
}
