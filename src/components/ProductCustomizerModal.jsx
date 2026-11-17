import React, { useState } from 'react';
import { X, Upload, CheckCircle2, ShoppingBag, Sparkles, Layers, ArrowRight } from 'lucide-react';

export default function ProductCustomizerModal({ product, onClose, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedHandle, setSelectedHandle] = useState(product.handles[0]);
  const [selectedGsm, setSelectedGsm] = useState(product.gsm);
  const [quantity, setQuantity] = useState(product.minOrderQty);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoName, setLogoName] = useState('');
  const [customPrintInstructions, setCustomPrintInstructions] = useState('');

  if (!product) return null;

  // Calculate unit price based on tiered pricing slabs
  const calculateUnitPrice = (qty) => {
    let price = product.pricePerUnit;
    const sortedTiers = [...product.tierPricing].sort((a, b) => b.minQty - a.minQty);
    for (const tier of sortedTiers) {
      if (qty >= tier.minQty) {
        price = tier.price;
        break;
      }
    }
    // slight gsm adjustment (+₹0.50 if higher GSM than default)
    const gsmDiff = (selectedGsm - product.gsm) * 0.02;
    return Math.max(1, price + gsmDiff);
  };

  const unitPrice = calculateUnitPrice(quantity);
  const totalPrice = unitPrice * quantity;

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    onAddToCart({
      productId: product.id,
      name: product.name,
      tamilName: product.tamilName,
      image: product.images[0],
      size: selectedSize,
      handle: selectedHandle,
      gsm: selectedGsm,
      quantity,
      unitPrice,
      totalPrice,
      customLogo: logoPreview,
      customLogoName: logoName,
      customPrintInstructions
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">{product.categoryName}</span>
            <h2 className="text-lg sm:text-xl font-black text-stone-900">{product.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto">
          
          {/* Left Column: Visual Bag Mockup with uploaded logo preview */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#f4ebd4]/50 border-2 border-dashed border-amber-300 flex items-center justify-center p-4">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover rounded-xl"
              />

              {/* Dynamic Logo Mockup Overlay */}
              {logoPreview && (
                <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                  <div className="bg-white/80 p-3 rounded-xl shadow-lg border border-amber-300 max-w-[120px] max-h-[120px] flex items-center justify-center">
                    <img src={logoPreview} alt="Client Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
              )}

              {/* Specs Badge */}
              <div className="absolute bottom-3 left-3 right-3 bg-stone-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl text-center text-xs">
                <span>{selectedSize} • {selectedGsm} GSM • {selectedHandle}</span>
              </div>
            </div>

            {/* Logo upload field */}
            <div className="w-full mt-4">
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                <span>Custom Logo / Shop Name Printing:</span>
                {logoName && <span className="text-emerald-700 text-[10px] flex items-center gap-1"><CheckCircle2 size={12} /> Uploaded</span>}
              </label>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 hover:border-amber-600 rounded-xl p-3 cursor-pointer bg-stone-50 hover:bg-amber-50/50 transition-colors text-xs text-stone-600">
                <Upload size={16} className="text-amber-700" />
                <span className="font-semibold">{logoName ? logoName : 'Upload Logo (PNG, JPG, PDF)'}</span>
                <input type="file" accept="image/*,.pdf" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="md:col-span-7 space-y-4">
            
            {/* Sizing options */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Bag Dimensions (W × H × Gusset)</label>
              <div className="grid grid-cols-3 gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedSize === sz
                        ? 'bg-amber-800 text-white border-amber-900 shadow-sm'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-amber-400'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* GSM Paper Thickness */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                <span>Paper Thickness (GSM)</span>
                <span className="text-amber-800 font-bold">{selectedGsm} GSM</span>
              </label>
              <div className="flex gap-2">
                {[90, 120, 150, 180].map((gsmVal) => (
                  <button
                    key={gsmVal}
                    onClick={() => setSelectedGsm(gsmVal)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      selectedGsm === gsmVal
                        ? 'bg-[#7e5222] text-white border-[#674221]'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    {gsmVal} GSM
                  </button>
                ))}
              </div>
            </div>

            {/* Handle Type */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Handle Style</label>
              <div className="flex flex-wrap gap-2">
                {product.handles.map((hdl) => (
                  <button
                    key={hdl}
                    onClick={() => setSelectedHandle(hdl)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                      selectedHandle === hdl
                        ? 'bg-[#7e5222] text-white border-[#674221]'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    {hdl}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper & Tier Info */}
            <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-800">Order Quantity (Bags)</span>
                <span className="text-xs font-bold text-emerald-800">
                  Unit Price: ₹{unitPrice.toFixed(2)}/bag
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={product.minOrderQty}
                  step={50}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(product.minOrderQty, parseInt(e.target.value) || product.minOrderQty))}
                  className="w-32 px-3 py-2 border border-stone-300 rounded-xl font-bold text-base text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                />

                <div className="flex flex-wrap gap-1.5 flex-1">
                  {[100, 500, 1000, 2500, 5000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setQuantity(preset)}
                      className={`px-2 py-1 rounded text-[11px] font-bold border ${
                        quantity === preset ? 'bg-amber-700 text-white' : 'bg-white text-stone-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Print Note */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Print Notes (Shop Name, Phone, Colors)</label>
              <input
                type="text"
                placeholder="e.g. Red and Gold color, shop phone number on back"
                value={customPrintInstructions}
                onChange={(e) => setCustomPrintInstructions(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Footer Summary & Add Button */}
        <div className="px-6 py-4 bg-stone-100 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="text-xs text-stone-500 font-semibold">Total Estimated Price ({quantity.toLocaleString()} Bags)</div>
            <div className="text-xl sm:text-2xl font-black text-[#7e5222]">
              ₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xs font-normal text-stone-600 ml-1.5">(GST & Factory Delivery Included)</span>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#7e5222] hover:bg-[#674221] text-white px-7 py-3 rounded-xl font-bold text-sm shadow-md transition-all"
          >
            <ShoppingBag size={16} />
            <span>Add Custom Order to Cart</span>
          </button>
        </div>

      </div>
    </div>
  );
}
