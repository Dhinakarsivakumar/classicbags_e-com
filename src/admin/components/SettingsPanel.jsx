import React, { useState, useRef } from 'react';
import { Save, ShieldCheck, Key, Store, MapPin, Phone, Lock, Upload, Trash2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Storage } from '../../shared/services/storage';

export default function SettingsPanel({ settings, onUpdateSettings }) {
  const [formData, setFormData] = useState(settings);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(settings?.heroBanner?.image || '');
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        setFormData(prev => ({
          ...prev,
          heroBanner: {
            ...(prev?.heroBanner || {}),
            image: compressed
          }
        }));
        setBannerPreview(compressed);
        setIsCompressing(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Storage.saveSettings(formData);
    onUpdateSettings(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">System &amp; Factory Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">Configure store information, Google Pay UPI parameters, and webhook security keys.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5 text-xs">
          {/* General Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b pb-2">
              <Store size={15} className="text-amber-700" />
              <span>Business Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Store / Factory Name</label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Factory &amp; Store Address</label>
              <textarea
                rows={2}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp Order Number</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Website Hero Frame Box / Special Banner (முதல் பிரேம் பாக்ஸ்) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-700" />
                <span>Website Hero Frame Box / Special Banner (முதல் பிரேம் பாக்ஸ்)</span>
              </h3>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
                Homepage Hero Frame
              </span>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Upload custom paper bags, packaging artwork, or a promotional banner photo to appear directly inside the main first frame box on the website homepage.
            </p>

            {/* Banner Image Upload & Live Miniature Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Upload Controls */}
              <div className="space-y-2.5">
                <label className="block font-bold text-slate-700 text-xs">
                  Banner Photo (Device / Camera Upload)
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-300 hover:border-amber-600 bg-amber-50/50 hover:bg-amber-100/60 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group shadow-2xs"
                >
                  <Upload className="w-8 h-8 text-amber-700 group-hover:scale-110 transition-transform" />
                  <span className="font-extrabold text-slate-800 text-xs">
                    {isCompressing ? 'Optimizing Image...' : 'Click to Upload Special Banner Photo'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    JPEG, PNG, WebP • Auto-compressed for fast mobile loading
                  </span>
                </div>

                {bannerPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setBannerPreview('');
                      setFormData(prev => ({
                        ...prev,
                        heroBanner: { ...(prev?.heroBanner || {}), image: '' }
                      }));
                    }}
                    className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 pt-1"
                  >
                    <Trash2 size={13} />
                    <span>Remove Uploaded Banner Photo</span>
                  </button>
                )}
              </div>

              {/* Live Preview of the First Frame Box */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Live First Frame Box Preview (முகப்புத் தோற்றம்)
                </label>
                <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-slate-300 aspect-[4/3] bg-stone-100 flex items-center justify-center">
                  {bannerPreview ? (
                    <img 
                      src={bannerPreview} 
                      alt="Banner Preview" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="text-center p-4 text-stone-400">
                      <div className="text-3xl mb-1">🛍️</div>
                      <p className="text-xs font-bold text-stone-700">Factory Graphic Fallback</p>
                      <p className="text-[10px] text-stone-500">Upload a photo to display here</p>
                    </div>
                  )}

                  <div className="p-4 bg-gradient-to-t from-stone-900 via-stone-900/80 to-transparent absolute inset-0 flex flex-col justify-end text-white">
                    <span className="inline-block bg-amber-500 text-stone-900 text-[10px] font-black px-2 py-0.5 rounded-full mb-1 self-start shadow-xs">
                      {formData.heroBanner?.badge || '★ Factory Special / Custom Order'}
                    </span>
                    <h4 className="text-sm font-extrabold leading-tight">
                      {formData.heroBanner?.title || 'Custom Branded Paper Bags'}
                    </h4>
                    <p className="text-[10px] text-amber-200 font-medium">
                      {formData.heroBanner?.tamilTitle || 'கஸ்டம் பிராண்டட் பேப்பர் பைகள்'}
                    </p>
                    <div className="mt-1 pt-1 border-t border-white/20 flex items-center justify-between">
                      <span className="text-xs font-black text-amber-400">
                        ₹{formData.heroBanner?.price || '2.30'} <span className="text-[10px] text-white font-normal">/ unit</span>
                      </span>
                      <span className="text-[10px] bg-white text-[#7e5222] font-bold px-2 py-0.5 rounded-lg">
                        Customize Now ➔
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Titles & Slogan Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Frame Title (English)</label>
                <input
                  type="text"
                  placeholder="Custom Branded Paper Bags"
                  value={formData.heroBanner?.title || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    heroBanner: { ...(prev?.heroBanner || {}), title: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Frame Title (Tamil)</label>
                <input
                  type="text"
                  placeholder="கஸ்டம் பிராண்டட் பேப்பர் பைகள்"
                  value={formData.heroBanner?.tamilTitle || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    heroBanner: { ...(prev?.heroBanner || {}), tamilTitle: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Badge Tag</label>
                <input
                  type="text"
                  placeholder="★ Factory Special / Custom Order"
                  value={formData.heroBanner?.badge || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    heroBanner: { ...(prev?.heroBanner || {}), badge: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Display Starting Price (₹)</label>
                <input
                  type="text"
                  placeholder="2.30"
                  value={formData.heroBanner?.price || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    heroBanner: { ...(prev?.heroBanner || {}), price: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="space-y-3 pt-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b pb-2">
              <Key size={15} className="text-amber-700" />
              <span>Google Pay for Business Parameters</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business UPI ID (VPA)</label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  className="w-full px-3 py-2 font-mono border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Merchant Display Name</label>
                <input
                  type="text"
                  value={formData.merchantName}
                  onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Security & PIN */}
          <div className="space-y-3 pt-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b pb-2">
              <Lock size={15} className="text-amber-700" />
              <span>Security &amp; Admin PIN</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Admin Access PIN (4 digits)</label>
                <input
                  type="password"
                  maxLength={4}
                  value={formData.adminPin}
                  onChange={(e) => setFormData({ ...formData, adminPin: e.target.value })}
                  className="w-full px-3 py-2 font-mono text-center text-sm font-bold border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>HMAC Webhook Secret</span>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-[10px] text-amber-700 hover:underline"
                  >
                    {showSecret ? 'Hide' : 'Show'}
                  </button>
                </label>
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={formData.webhookSecret}
                  onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
                  className="w-full px-3 py-2 font-mono border rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            {savedNotice ? (
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                ✓ Settings updated and saved!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="flex items-center gap-2 bg-[#7e5222] hover:bg-[#674221] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
            >
              <Save size={15} />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
