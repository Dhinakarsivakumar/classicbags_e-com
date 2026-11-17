import React, { useState } from 'react';
import { 
  Package, 
  Upload, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Smartphone, 
  ShieldCheck, 
  Key, 
  Search, 
  Plus, 
  Edit3, 
  Image as ImageIcon,
  DollarSign
} from 'lucide-react';
import { STORE_SETTINGS } from '../data/initialData';
import { SecurityService } from '../services/security';

export default function AdminDashboard({ 
  products, 
  onUpdateProductStock, 
  onAddNewProduct,
  orders, 
  webhookLogs,
  onSimulateWebhook
}) {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'products' | 'orders' | 'listener'
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Product Modal State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdTamil, setNewProdTamil] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('kraft');
  const [newProdPrice, setNewProdPrice] = useState('5.00');
  const [newProdStock, setNewProdStock] = useState('5000');
  const [newProdGsm, setNewProdGsm] = useState('120');
  const [newProdImage, setNewProdImage] = useState('');
  const [imagePreviewRatio, setImagePreviewRatio] = useState('mobile'); // 'mobile' (4:5) | 'desktop' (1:1)

  // Android Simulator Console State
  const [simNotificationText, setSimNotificationText] = useState(
    'Received ₹2,400.18 from Senthil Textiles (UPI Ref: 432190887162)'
  );
  const [simResult, setSimResult] = useState(null);

  // Quick filter products
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tamilName.includes(searchQuery)
  );

  const handleStockChange = (productId, newAmount) => {
    onUpdateProductStock(productId, Math.max(0, parseInt(newAmount) || 0));
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProdName) return;

    const prod = {
      id: 'cb-' + Date.now().toString().slice(-4),
      name: newProdName,
      tamilName: newProdTamil || newProdName,
      category: newProdCategory,
      categoryName: newProdCategory === 'kraft' ? 'Kraft Paper Bags' : newProdCategory === 'luxury' ? 'Retail & Boutique' : 'Bakery & Food Delivery',
      pricePerUnit: parseFloat(newProdPrice) || 5.00,
      minOrderQty: 100,
      stockUnits: parseInt(newProdStock) || 1000,
      gsm: parseInt(newProdGsm) || 120,
      sizes: ['8 x 10 x 3.5 in', '10 x 14 x 4 in'],
      handles: ['Twisted Paper', 'Flat Tape'],
      description: 'Manufactured by Classic Bags Thanjavur. Eco-friendly biodegradable retail packaging.',
      images: [
        newProdImage || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
      ],
      tierPricing: [
        { minQty: 100, price: parseFloat(newProdPrice) },
        { minQty: 500, price: parseFloat(newProdPrice) * 0.9 },
        { minQty: 2000, price: parseFloat(newProdPrice) * 0.8 }
      ],
      featured: false,
      rating: 5.0,
      reviewsCount: 1
    };

    onAddNewProduct(prod);
    setShowAddProduct(false);
    setNewProdName('');
    setNewProdTamil('');
  };

  // Run test notification parse & simulated webhook dispatch
  const handleTestNotification = () => {
    const parsed = SecurityService.parseGPayNotification(simNotificationText);
    const result = onSimulateWebhook({
      amount: parsed.amount,
      utr: parsed.utr,
      sender: parsed.sender,
      notificationText: simNotificationText
    });
    setSimResult(result);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="bg-[#7e5222] text-white p-6 rounded-3xl shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-400 text-stone-900 font-extrabold px-2.5 py-0.5 rounded-full uppercase">
              Classic Bags Factory Portal
            </span>
            <span className="text-xs text-amber-200">LIC Colony, Thanjavur</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">Admin Inventory & Webhook Control Module</h1>
          <p className="text-amber-100 text-xs sm:text-sm mt-1">
            Real-time stock updates, photo uploader, and Android Google Pay zero-touch auto-approval manager.
          </p>
        </div>

        {/* Quick Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'inventory', label: 'Stock & Inventory', icon: Package },
            { id: 'products', label: 'Photo & Catalog', icon: ImageIcon },
            { id: 'orders', label: 'Orders & Webhooks', icon: CheckCircle2 },
            { id: 'listener', label: 'Android GPay Listener', icon: Smartphone }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-stone-900 shadow-md'
                    : 'bg-black/20 text-white hover:bg-black/30'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: INVENTORY & STOCK MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Search bags or GSM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-stone-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Adequate Stock
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Low Stock (&lt; 10,000)
              </span>
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Bag Image</th>
                    <th className="py-3.5 px-4">Product Details</th>
                    <th className="py-3.5 px-4">GSM</th>
                    <th className="py-3.5 px-4">Unit Price</th>
                    <th className="py-3.5 px-4">Current Stock Units</th>
                    <th className="py-3.5 px-4">Quick Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredProducts.map((p) => {
                    const isLow = p.stockUnits < 10000;
                    return (
                      <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3 px-4">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-12 h-14 object-cover rounded-lg border border-stone-200"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900 text-sm">{p.name}</div>
                          <div className="text-[11px] text-amber-800">{p.tamilName}</div>
                          <div className="text-[10px] text-stone-400">{p.categoryName}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-bold">
                            {p.gsm} GSM
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-stone-800">
                          ₹{p.pricePerUnit.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={p.stockUnits}
                              onChange={(e) => handleStockChange(p.id, e.target.value)}
                              className={`w-28 px-2.5 py-1.5 text-sm font-black rounded-xl border text-center ${
                                isLow
                                  ? 'bg-red-50 border-red-300 text-red-700'
                                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              }`}
                            />
                            {isLow && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                                <AlertTriangle size={11} /> Reorder
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStockChange(p.id, p.stockUnits - 500)}
                              className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 font-bold text-stone-700"
                              title="Decrease 500"
                            >
                              -500
                            </button>
                            <button
                              onClick={() => handleStockChange(p.id, p.stockUnits + 500)}
                              className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 font-bold text-stone-700"
                              title="Add 500"
                            >
                              +500
                            </button>
                            <button
                              onClick={() => handleStockChange(p.id, p.stockUnits + 2000)}
                              className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 font-bold text-amber-900"
                              title="Restock bundle (2000)"
                            >
                              +2,000
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT PHOTOS & CATALOG EDITOR */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div>
              <h3 className="font-extrabold text-stone-900 text-base">Bag Catalog & Photo Uploader</h3>
              <p className="text-xs text-stone-500">Manage aspect ratios (Mobile 4:5 vs Desktop 1:1) and add new bag varieties.</p>
            </div>
            <button
              onClick={() => setShowAddProduct(true)}
              className="flex items-center gap-1.5 bg-[#7e5222] hover:bg-[#674221] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <Plus size={16} />
              <span>Add New Bag Type</span>
            </button>
          </div>

          {/* Aspect Ratio Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-3xl border border-stone-200 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-stone-500">
                  <span>ID: {p.id}</span>
                  <span className="text-amber-800">{p.categoryName}</span>
                </div>

                {/* Aspect Ratio Container */}
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 group">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-mono">
                    Mobile Frame (4:5 Ratio)
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-stone-900 text-sm">{p.name}</h4>
                  <div className="text-xs text-stone-500 font-semibold">{p.tamilName}</div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900">₹{p.pricePerUnit.toFixed(2)} / unit</span>
                    <span className="bg-stone-100 px-2 py-0.5 rounded font-bold text-stone-700">{p.gsm} GSM</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ADD PRODUCT MODAL */}
          {showAddProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-stone-200">
                <h3 className="text-lg font-black text-stone-900">Add New Bag Variety</h3>

                <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Product Name (English)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cotton Handle Kraft Bag"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Tamil Name</label>
                    <input
                      type="text"
                      placeholder="எ.கா: பருத்தி கைப்பிடி கிராஃப்ட் பை"
                      value={newProdTamil}
                      onChange={(e) => setNewProdTamil(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Base Price (₹)</label>
                      <input
                        type="number"
                        step="0.10"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Initial Stock</label>
                      <input
                        type="number"
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Photo Image URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProduct(false)}
                      className="flex-1 py-2.5 rounded-xl border border-stone-300 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-[#7e5222] text-white rounded-xl font-bold"
                    >
                      Save Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LIVE ORDERS & WEBHOOK AUDIT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-stone-900 text-base">Real-Time Order & Webhook Log</h3>
              <p className="text-xs text-stone-500">Live webhook callbacks received from Google Pay for Business Notification Listener.</p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Auto-Approval Active
            </span>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Items</th>
                    <th className="py-3.5 px-4">Amount (Dynamic Paise)</th>
                    <th className="py-3.5 px-4">Payment UTR</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">{o.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{o.customerName}</div>
                        <div className="text-[10px] text-stone-400">{o.phone} • {o.city}</div>
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        {o.items.map((it, i) => (
                          <div key={i}>{it.qty}x {it.name}</div>
                        ))}
                      </td>
                      <td className="py-3 px-4 font-black text-[#7e5222] text-sm">
                        ₹{o.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-stone-600">
                        {o.utr || 'Pending'}
                      </td>
                      <td className="py-3 px-4">
                        {o.status === 'PAID_APPROVED' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={12} /> Auto-Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                            <Clock size={12} /> Pending Webhook
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANDROID NOTIFICATION LISTENER APP CONFIG & SIMULATOR */}
      {activeTab === 'listener' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Security & Endpoint Info */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={24} className="text-emerald-600" />
              <h3 className="font-extrabold text-stone-900 text-base">Android Listener Security Specs</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Your business Android phone uses a lightweight background service with Android Notification Access to intercept Google Pay for Business alerts. All communications use end-to-end encryption:
            </p>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-400 block text-[10px]">Secure Webhook Destination:</span>
                <span className="font-bold text-stone-800 break-all">https://api.classicbags.thanjavur/webhook/gpay</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-400 block text-[10px]">HMAC-SHA256 Signature Header:</span>
                <span className="font-bold text-amber-900">X-ClassicBags-Signature</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-400 block text-[10px]">AES-256 Encryption Mode:</span>
                <span className="font-bold text-emerald-800">AES-256-CBC Payload Encrypted</span>
              </div>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-950">
              <strong>100% Zero-Touch:</strong> Once the Android app is running, no manual approvals are required. Stock drops immediately on payment receipt.
            </div>
          </div>

          {/* Test Simulator Console */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone size={22} className="text-[#7e5222]" />
                <h3 className="font-extrabold text-stone-900 text-base">Live Google Pay Notification Simulator</h3>
              </div>
              <span className="text-[11px] bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-full font-bold">
                Interactive Test Console
              </span>
            </div>

            <p className="text-xs text-stone-600">
              Type or select a mock notification from your Google Pay for Business phone to simulate how the webhook triggers zero-touch approval:
            </p>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              {[
                'Received ₹2,400.18 from Senthil Textiles (UPI Ref: 432190887162)',
                'Received ₹3,200.42 from Aachi Sweet Bakery (Ref: 432190998811)',
                'Received ₹550.84 from Thanjavur Gifts (UTR 998811223344)'
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setSimNotificationText(sample)}
                  className="text-[11px] text-stone-700 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-lg border border-stone-200 text-left font-mono truncate max-w-full"
                >
                  {sample}
                </button>
              ))}
            </div>

            {/* Notification input */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Android Notification Text</label>
              <textarea
                rows={2}
                value={simNotificationText}
                onChange={(e) => setSimNotificationText(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <button
              onClick={handleTestNotification}
              className="w-full flex items-center justify-center gap-2 bg-[#7e5222] hover:bg-[#674221] text-white py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              <RefreshCw size={16} />
              <span>Simulate Android Notification & Fire Secure Webhook</span>
            </button>

            {/* Result display */}
            {simResult && (
              <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                simResult.matched 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>Webhook Execution Status:</span>
                  <span className={simResult.matched ? 'text-emerald-700' : 'text-amber-800'}>
                    {simResult.matched ? 'MATCHED & AUTO-APPROVED' : 'PAYMENT RECORDED (UNASSIGNED)'}
                  </span>
                </div>
                <div className="font-mono text-[11px] space-y-1">
                  <div>• Parsed Amount: ₹{simResult.parsed.amount}</div>
                  <div>• Parsed UTR: {simResult.parsed.utr}</div>
                  <div>• Sender: {simResult.parsed.sender}</div>
                  {simResult.matchedOrder && (
                    <div>• Order Matched: <strong>{simResult.matchedOrder.id}</strong> (Stock Automatically Deducted!)</div>
                  )}
                  <div>• HMAC Signature: {simResult.signature.slice(0, 24)}... (Verified)</div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
