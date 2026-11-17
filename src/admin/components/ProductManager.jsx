import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Save,
  Image as ImageIcon,
  Star,
  Layers,
  ArrowRight
} from 'lucide-react';
import { CATEGORIES } from '../../shared/data/initialData';

const GSM_OPTIONS = [80, 90, 100, 120, 150, 160, 180];

const emptyProduct = {
  name: '',
  tamilName: '',
  category: 'kraft',
  pricePerUnit: '',
  minOrderQty: '',
  gsm: 120,
  stockUnits: '',
  sizes: '',
  handles: '',
  description: '',
  images: [''],
  tierPricing: [
    { min: '', price: '' },
    { min: '', price: '' },
    { min: '', price: '' },
    { min: '', price: '' },
  ],
  featured: false,
};

export default function ProductManager({ products, onUpdateProducts }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.tamilName && p.tamilName.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      ...emptyProduct,
      images: [''],
      tierPricing: [
        { min: 100, price: 5.50 },
        { min: 500, price: 4.80 },
        { min: 2000, price: 4.20 },
        { min: 5000, price: 3.80 },
      ],
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      tamilName: product.tamilName || '',
      category: product.category,
      pricePerUnit: product.pricePerUnit,
      minOrderQty: product.minOrderQty,
      gsm: product.gsm,
      stockUnits: product.stockUnits,
      sizes: (product.sizes || []).join(', '),
      handles: (product.handles || []).join(', '),
      description: product.description || '',
      images: product.images && product.images.length > 0 ? [...product.images] : [''],
      tierPricing: product.tierPricing?.length
        ? product.tierPricing.map((t) => ({ min: t.min, price: t.price }))
        : emptyProduct.tierPricing.map((t) => ({ ...t })),
      featured: product.featured || false,
    });
    setShowModal(true);
  };

  const updateFormField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Multiple Images Management
  const handleImageChange = (index, value) => {
    const updated = [...formData.images];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, images: updated }));
  };

  const handleAddImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const handleRemoveImageField = (index) => {
    if (formData.images.length <= 1) {
      setFormData((prev) => ({ ...prev, images: [''] }));
    } else {
      const updated = formData.images.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, images: updated }));
    }
  };

  const updateTierPricing = (index, field, value) => {
    const updated = [...formData.tierPricing];
    updated[index][field] = value ? parseFloat(value) || value : '';
    setFormData((prev) => ({ ...prev, tierPricing: updated }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Clean up images array (remove empty strings)
    const validImages = formData.images
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const productPayload = {
      id: editingProduct ? editingProduct.id : `cb-${Date.now().toString().slice(-4)}`,
      name: formData.name.trim(),
      tamilName: formData.tamilName.trim(),
      category: formData.category,
      pricePerUnit: parseFloat(formData.pricePerUnit) || 0,
      minOrderQty: parseInt(formData.minOrderQty) || 100,
      gsm: parseInt(formData.gsm) || 120,
      stockUnits: parseInt(formData.stockUnits) || 0,
      sizes: formData.sizes
        ? formData.sizes.split(',').map((s) => s.trim()).filter(Boolean)
        : ['10×14×4 in'],
      handles: formData.handles
        ? formData.handles.split(',').map((h) => h.trim()).filter(Boolean)
        : ['Twisted Paper'],
      description: formData.description.trim(),
      images: validImages.length > 0 ? validImages : [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
      ],
      tierPricing: formData.tierPricing
        .filter((t) => t.min && t.price)
        .map((t) => ({ min: parseInt(t.min), price: parseFloat(t.price) })),
      featured: formData.featured,
      rating: editingProduct?.rating || 5.0,
      reviews: editingProduct?.reviews || 1,
      createdAt: editingProduct?.createdAt || new Date().toISOString().slice(0, 10),
    };

    let updatedList;
    if (editingProduct) {
      updatedList = products.map((p) =>
        p.id === editingProduct.id ? productPayload : p
      );
    } else {
      updatedList = [productPayload, ...products];
    }

    onUpdateProducts(updatedList);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    const updated = products.filter((p) => p.id !== id);
    onUpdateProducts(updated);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Product Catalog &amp; Multi-Photo Manager</h2>
          <p className="text-xs text-slate-500">Manage bag collections, upload multiple product angles, and set wholesale slabs.</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#7e5222] hover:bg-[#674221] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus size={16} />
          <span>Add New Bag Variety</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search products by English or Tamil name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Photos</th>
                <th className="py-3.5 px-4">Bag Name &amp; Tamil</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">GSM</th>
                <th className="py-3.5 px-4">Base Price</th>
                <th className="py-3.5 px-4">Stock Units</th>
                <th className="py-3.5 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    {/* Multi-Photo Preview Strip */}
                    <div className="flex items-center gap-1.5">
                      <div className="relative w-12 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {p.images.length > 1 && (
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <ImageIcon size={10} /> +{p.images.length - 1}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                    <div className="text-[11px] text-amber-800 font-tamil">{p.tamilName}</div>
                    <div className="text-[10px] text-slate-400">ID: {p.id}</div>
                  </td>
                  <td className="py-3 px-4 capitalize">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800">{p.gsm} GSM</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 text-sm">₹{p.pricePerUnit.toFixed(2)}</span>
                    <span className="text-slate-400 text-[10px]"> / unit</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${p.stockUnits < 5000 ? 'text-red-600' : 'text-slate-800'}`}>
                      {p.stockUnits.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        title="Edit product & photos"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Delete this product?</h3>
            <p className="text-xs text-slate-500">This action cannot be undone. Product will be removed from both Store and Admin.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL WITH MULTIPLE PHOTOS */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                <h3 className="font-extrabold text-base text-slate-900">
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Paper Bag Model'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              
              {/* Product Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Title (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. White Luxury Boutique Bag"
                    value={formData.name}
                    onChange={(e) => updateFormField('name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tamil Name</label>
                  <input
                    type="text"
                    placeholder="எ.கா: ப்ளீச்ட் ஒயிட் பூட்டிக் பேக்"
                    value={formData.tamilName}
                    onChange={(e) => updateFormField('tamilName', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category & GSM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateFormField('category', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Paper GSM</label>
                  <select
                    value={formData.gsm}
                    onChange={(e) => updateFormField('gsm', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none bg-white"
                  >
                    {GSM_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g} GSM</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price, Min Qty, Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={formData.pricePerUnit}
                    onChange={(e) => updateFormField('pricePerUnit', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Order Qty</label>
                  <input
                    type="number"
                    value={formData.minOrderQty}
                    onChange={(e) => updateFormField('minOrderQty', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={formData.stockUnits}
                    onChange={(e) => updateFormField('stockUnits', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* MULTIPLE PRODUCT PHOTOS (Flipkart-style) */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <ImageIcon size={15} className="text-[#7e5222]" />
                      <span>Product Photos (Multiple Angles &amp; Views)</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Add multiple image URLs (Front view, Side gusset, Handle detail, Lifestyle).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImageField}
                    className="flex items-center gap-1 bg-[#7e5222] hover:bg-[#674221] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    <Plus size={14} />
                    <span>Add Another Photo</span>
                  </button>
                </div>

                {/* List of image inputs */}
                <div className="space-y-2">
                  {formData.images.map((imgUrl, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-16 text-[10px] font-bold text-slate-500 uppercase flex-shrink-0">
                        {idx === 0 ? 'Cover/Main' : `Angle ${idx + 1}`}:
                      </span>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={imgUrl}
                        onChange={(e) => handleImageChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-[11px] focus:ring-2 focus:ring-amber-600 focus:outline-none bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImageField(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                        title="Remove photo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Live Preview Thumbnails Strip */}
                <div className="pt-2 border-t border-amber-200/60">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1.5">
                    Live Photo Previews (Mobile 4:5 Aspect Ratio):
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {formData.images
                      .filter((url) => url.trim().length > 0)
                      .map((url, i) => (
                        <div key={i} className="relative w-16 h-20 aspect-[4/5] rounded-xl overflow-hidden border-2 border-amber-400 shadow-sm flex-shrink-0 bg-white">
                          <img
                            src={url}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-bold">
                            #{i + 1}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Sizes and Handles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Available Sizes (comma separated)</label>
                  <input
                    type="text"
                    placeholder="8×10×3.5 in, 10×14×4 in"
                    value={formData.sizes}
                    onChange={(e) => updateFormField('sizes', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Handle Styles (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Twisted Paper, Flat Tape, Ribbon"
                    value={formData.handles}
                    onChange={(e) => updateFormField('handles', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => updateFormField('description', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              {/* Footer Save Button */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#7e5222] hover:bg-[#674221] text-white px-7 py-2.5 rounded-xl font-bold shadow-md transition-all"
                >
                  <Save size={15} />
                  <span>Save Product &amp; Photos</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
