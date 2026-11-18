import React, { useState, useEffect } from 'react';
import { 
  X, Package, MapPin, User, CheckCircle2, Clock, Truck, 
  ChevronRight, Plus, Trash2, Edit2, ShieldCheck, Printer, 
  ExternalLink, Phone, Building2, Save
} from 'lucide-react';
import { Storage } from '../../shared/services/storage';

export default function CustomerSettingsModal({ isOpen, onClose, activeTab: initialTab = 'orders', onSelectProduct }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [profile, setProfile] = useState({ name: '', phone: '', email: '', businessName: '' });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: 'Shop',
    fullName: '',
    phone: '8940679198',
    street: '',
    area: '',
    city: 'Thanjavur',
    pincode: '613007',
    isDefault: false
  });
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      loadData();
    }
  }, [isOpen, initialTab]);

  const loadData = () => {
    const allOrders = Storage.getOrders() || [];
    setOrders(allOrders);
    setAddresses(Storage.getAddresses() || []);
    setProfile(Storage.getUserProfile());
  };

  if (!isOpen) return null;

  // Handle Save Profile
  const handleSaveProfile = (e) => {
    e.preventDefault();
    Storage.saveUserProfile(profile);
    setSaveSuccess('Profile saved successfully! விவரங்கள் சேமிக்கப்பட்டன.');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  // Handle Add Address
  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.fullName) return;

    const updated = [
      ...addresses.map(a => newAddress.isDefault ? { ...a, isDefault: false } : a),
      {
        id: `addr-${Date.now()}`,
        ...newAddress
      }
    ];
    setAddresses(updated);
    Storage.saveAddresses(updated);
    setIsAddingAddress(false);
    setNewAddress({
      title: 'Shop',
      fullName: profile.name || '',
      phone: profile.phone || '8940679198',
      street: '',
      area: '',
      city: 'Thanjavur',
      pincode: '613007',
      isDefault: false
    });
  };

  // Delete Address
  const handleDeleteAddress = (id) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    Storage.saveAddresses(updated);
  };

  // Set Default Address
  const handleSetDefaultAddress = (id) => {
    const updated = addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    setAddresses(updated);
    Storage.saveAddresses(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-stone-200/80 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#674221] to-[#7e5222] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <User className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">கணக்கு & அமைப்புகள் (Settings)</h2>
              <p className="text-xs text-amber-100/90">ஆர்டர்கள், முகவரிகள் & வாடிக்கையாளர் விவரங்கள்</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-[#7e5222] text-[#7e5222] bg-white rounded-t-xl shadow-sm'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>எனது ஆர்டர்கள் (Orders)</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-[#7e5222] font-bold">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
              activeTab === 'addresses'
                ? 'border-[#7e5222] text-[#7e5222] bg-white rounded-t-xl shadow-sm'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>முகவரிகள் (Addresses)</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-[#7e5222] font-bold">
              {addresses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-[#7e5222] text-[#7e5222] bg-white rounded-t-xl shadow-sm'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>சுயவிவரம் (Profile)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {saveSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#7e5222] mx-auto flex items-center justify-center mb-3">
                    <Package className="w-8 h-8 opacity-60" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-800">இன்னும் ஆர்டர்கள் எதுவும் இல்லை</h3>
                  <p className="text-stone-500 text-sm mt-1 max-w-sm mx-auto">
                    நீங்கள் செய்யும் ஆர்டர்கள் தானாகவே இங்கே கண்காணிக்கப்படும்.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-5 px-6 py-2.5 bg-[#7e5222] hover:bg-[#674221] text-white rounded-full font-medium text-sm transition-all"
                  >
                    பைகளைத் தேர்ந்தெடுக்கவும் (Browse Catalog)
                  </button>
                </div>
              ) : (
                orders.map((order, idx) => (
                  <div 
                    key={order.orderId || idx}
                    className="border border-stone-200 rounded-2xl p-4 sm:p-5 hover:border-amber-300 transition-all bg-stone-50/50"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-base">{order.orderId}</span>
                        <span className="text-xs text-stone-500">
                          {new Date(order.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status === 'PAID' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {order.status === 'PAID' ? 'PAID (செலுத்தப்பட்டது)' : 'PENDING'}
                        </span>
                        <span className="text-base font-extrabold text-[#7e5222]">
                          ₹{(order.amount).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="py-3 space-y-2">
                      {order.items?.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-stone-800">{item.name}</span>
                            <span className="text-xs text-stone-500">({item.size} • {item.quantity} pcs)</span>
                          </div>
                          <span className="text-stone-700 font-semibold">₹{item.totalPrice?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery & Tracking Step Bar */}
                    <div className="pt-3 border-t border-stone-200/80">
                      <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                        <span className="flex items-center gap-1 text-green-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> ஆர்டர் பெறப்பட்டது
                        </span>
                        <span className="flex items-center gap-1 text-amber-700 font-medium">
                          <Truck className="w-3.5 h-3.5" /> பேக்கிங் & டெலிவரி
                        </span>
                        <span className="text-stone-400">டெலிவரி (தஞ்சாவூர்)</span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-[#7e5222] h-full rounded-full transition-all duration-500"
                          style={{ width: order.status === 'PAID' ? '70%' : '30%' }}
                        />
                      </div>

                      {order.utr && (
                        <p className="mt-2 text-[11px] text-stone-500">
                          <span className="font-semibold text-stone-700">Bank UTR / Ref:</span> {order.utr}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-600">
                  ஆர்டர்கள் விரைவாக சென்றடைய உங்கள் டெலிவரி முகவரிகளை நிர்வகிக்கவும்.
                </p>
                {!isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7e5222] hover:bg-[#674221] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> புதிய முகவரி (Add Address)
                  </button>
                )}
              </div>

              {/* Add Address Form */}
              {isAddingAddress && (
                <form onSubmit={handleAddAddress} className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-stone-800 text-sm">புதிய முகவரி சேர்க்க (New Address)</h4>
                    <button 
                      type="button" 
                      onClick={() => setIsAddingAddress(false)}
                      className="text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">முகவரி வகை (Title)</label>
                      <input
                        type="text"
                        value={newAddress.title}
                        onChange={e => setNewAddress({ ...newAddress, title: e.target.value })}
                        placeholder="எ.கா: கடை / ஆலை / வீடு"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">பெயர் (Full Name)</label>
                      <input
                        type="text"
                        value={newAddress.fullName}
                        onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        placeholder="உங்கள் பெயர்"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">வாட்ஸ்அப் எண் (Phone)</label>
                      <input
                        type="tel"
                        value={newAddress.phone}
                        onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                        placeholder="8940679198"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">பின்கோடு (Pincode)</label>
                      <input
                        type="text"
                        value={newAddress.pincode}
                        onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        placeholder="613007"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">தெரு & கதவு எண் (Street Address)</label>
                    <input
                      type="text"
                      value={newAddress.street}
                      onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                      placeholder="எ.கா: Plot No. 38, 6th Street, Medical College Road"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">பகுதி / லேண்ட்மார்க் (Area / Landmark)</label>
                      <input
                        type="text"
                        value={newAddress.area}
                        onChange={e => setNewAddress({ ...newAddress, area: e.target.value })}
                        placeholder="LIC Colony"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">மாவட்டம் / நகரம் (City)</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                        placeholder="Thanjavur"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={newAddress.isDefault}
                      onChange={e => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      className="rounded border-stone-300 text-[#7e5222] focus:ring-[#7e5222]"
                    />
                    <label htmlFor="isDefault" className="text-xs text-stone-700 font-medium">
                      இதை முதன்மை முகவரியாக வைக்கவும் (Set as default)
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg text-xs font-medium hover:bg-stone-100"
                    >
                      ரத்துசெய் (Cancel)
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#7e5222] text-white rounded-lg text-xs font-bold hover:bg-[#674221]"
                    >
                      சேமிக்கவும் (Save Address)
                    </button>
                  </div>
                </form>
              )}

              {/* Address List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      addr.isDefault
                        ? 'border-[#7e5222] bg-amber-50/30 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">{addr.title}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7e5222] text-white">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1 text-stone-400 hover:text-red-500 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="font-medium text-stone-800 text-xs">{addr.fullName}</p>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {addr.street}, {addr.area && `${addr.area}, `}{addr.city} – {addr.pincode}
                    </p>
                    <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#7e5222]" /> {addr.phone}
                    </p>

                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="mt-3 text-xs text-[#7e5222] hover:underline font-semibold"
                      >
                        முதன்மை முகவரியாக மாற்று ➔
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  வாடிக்கையாளர் / கடை பெயர் (Customer / Business Name)
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={profile.businessName || ''}
                    onChange={e => setProfile({ ...profile, businessName: e.target.value })}
                    placeholder="எ.கா: தஞ்சாவூர் சில்க்ஸ் / Classic Customer"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  தொடர்பு நபர் பெயர் (Contact Person)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={profile.name || ''}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    placeholder="S. Dhinakar"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  வாட்ஸ்அப் எண் (WhatsApp Order Phone)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={profile.phone || '8940679198'}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="8940679198"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  இந்த எண்ணிற்கு உடனடி ஆர்டர் மற்றும் பேமெண்ட் உறுதிப்படுத்தல் அனுப்பப்படும்.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  மின்னஞ்சல் (Email - Optional)
                </label>
                <input
                  type="email"
                  value={profile.email || ''}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  placeholder="contact@example.com"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#7e5222] hover:bg-[#674221] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <Save className="w-4 h-4" /> அமைப்புகளைச் சேமிக்கவும் (Save Profile)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
