import React, { useState } from 'react';
import { Save, ShieldCheck, Key, Store, MapPin, Phone, Lock } from 'lucide-react';
import { Storage } from '../../shared/services/storage';

export default function SettingsPanel({ settings, onUpdateSettings }) {
  const [formData, setFormData] = useState(settings);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

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
