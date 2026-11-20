import React, { useState, useMemo, useRef } from 'react';
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
  ArrowRight,
  Upload,
  Camera,
  Check,
  Link as LinkIcon,
  RefreshCw,
  ShoppingBag
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
  images: [],
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

  // Direct Image Upload States
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [useUrlMode, setUseUrlMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
    setUseUrlMode(false);
    setUploadStatus('');
    setFormData({
      ...emptyProduct,
      images: [],
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
    setUseUrlMode(false);
    setUploadStatus('');
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
      images: product.images && product.images.length > 0 ? [...product.images] : [],
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

  // Image Compression: scale down large phone camera shots to crisp, web-optimized ~80KB-120KB images
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onerror = reject;
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onerror = reject;
        img.onload = () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          resolve({
            name: file.name,
            dataUrl: compressed
          });
        };
      };
    });
  };

  // Direct File Selection Handler
  const handleProcessFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadStatus(`Optimizing ${files.length} photo${files.length > 1 ? 's' : ''}...`);

    try {
      const newImages = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const comp = await compressImage(file);

        let finalUrl = comp.dataUrl;

        // Attempt server upload for persistent storage
        try {
          const res = await fetch('http://10.220.210.247:3002/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: comp.name, data: comp.dataUrl })
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.url) {
              finalUrl = `http://10.220.210.247:3002${data.url}`;
            }
          }
        } catch {
          // If server offline, Base64 dataUrl is used directly
        }

        newImages.push(finalUrl);
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images.filter(Boolean), ...newImages]
      }));

      setUploadStatus(`✓ Added ${newImages.length} photo${newImages.length > 1 ? 's' : ''}!`);
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (err) {
      setUploadStatus('Upload error: ' + err.message);
      setTimeout(() => setUploadStatus(''), 4000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  // Set an image as primary Cover Image
  const handleMakeCover = (index) => {
    if (index === 0) return;
    setFormData((prev) => {
      const updated = [...prev.images];
      const [chosen] = updated.splice(index, 1);
      return {
        ...prev,
        images: [chosen, ...updated]
      };
    });
  };

  // Remove photo
  const handleRemovePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // URL fallback handlers
  const handleImageChange = (index, value) => {
    const updated = [...formData.images];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, images: updated }));
  };

  const handleAddImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const updateTierPricing = (index, field, value) => {
    const updated = [...formData.tierPricing];
    updated[index][field] = value ? parseFloat(value) || value : '';
    setFormData((prev) => ({ ...prev, tierPricing: updated }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validImages = formData.images
      .map((url) => (url ? url.trim() : ''))
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
      updatedAt: new Date().toISOString()
    };

    let updatedProducts;
    if (editingProduct) {
      updatedProducts = products.map((p) =>
        p.id === editingProduct.id ? { ...p, ...productPayload } : p
      );
    } else {
      updatedProducts = [productPayload, ...products];
    }

    onUpdateProducts(updatedProducts);
    setShowModal(false);
  };

  const handleDelete = (productId) => {
    const updated = products.filter((p) => p.id !== productId);
    onUpdateProducts(updated);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Product Catalog Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage factory paper bag models, pricing tiers, specifications, and upload product photos.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#7e5222] hover:bg-[#674221] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-amber-900/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Bag Model</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by English or Tamil name..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7e5222]"
        />
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Photo</th>
                <th className="py-3 px-4">Model Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">GSM</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="w-12 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                      {p.images && p.images[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag size={20} className="text-slate-400" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                    <div className="text-[11px] text-amber-800">{p.tamilName}</div>
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

      {/* ADD / EDIT PRODUCT MODAL WITH DIRECT PHOTO UPLOAD */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {editingProduct ? 'Edit Product Model & Photos' : 'Add New Paper Bag Model'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Direct image upload supported. Images are automatically optimized for instant loading.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
              
              {/* Name & Tamil Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => updateFormField('name', e.target.value)}
                    placeholder="Brown Kraft Shopper Bag"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tamil Display Name</label>
                  <input
                    type="text"
                    value={formData.tamilName}
                    onChange={(e) => updateFormField('tamilName', e.target.value)}
                    placeholder="பிரவுன் கிராஃப்ட் பேக்"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category and GSM */}
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
                  <label className="block font-bold text-slate-700 mb-1">Paper GSM Thickness</label>
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
                    step="0.01"
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

              {/* DIRECT PRODUCT IMAGE UPLOAD SECTION */}
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/90 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <ImageIcon size={16} className="text-[#7e5222]" />
                      <span>Product Photos (Direct Device Upload)</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Upload photos directly from your phone or PC. Select multiple angles (Front, Gusset, Handle, Lifestyle).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUseUrlMode(!useUrlMode)}
                      className="text-[11px] text-[#7e5222] hover:underline font-bold flex items-center gap-1"
                    >
                      <LinkIcon size={12} />
                      <span>{useUrlMode ? 'Switch to Direct File Upload' : 'Or Paste Image URL'}</span>
                    </button>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={(e) => handleProcessFiles(e.target.files)}
                  className="hidden"
                />

                {/* Direct File Dropzone */}
                {!useUrlMode && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-amber-600 bg-amber-100/60 scale-[1.01]'
                        : 'border-amber-300/80 bg-white hover:bg-amber-50/50 hover:border-[#7e5222]'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#7e5222] flex items-center justify-center shadow-inner">
                        {isUploading ? (
                          <RefreshCw className="w-6 h-6 animate-spin text-amber-700" />
                        ) : (
                          <Upload className="w-6 h-6 text-[#7e5222]" />
                        )}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800 text-xs sm:text-sm">
                          {isUploading ? 'Compressing and Uploading...' : 'Click to Upload Photos from Phone or PC'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Drag and drop files here, or tap to choose from gallery / camera
                        </p>
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100/80 text-[#7e5222] rounded-full text-[10px] font-bold">
                          <Camera size={11} />
                          <span>Phone Camera / Gallery</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Auto-scales to 4:5 Mobile Ratio
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Status Banner */}
                {uploadStatus && (
                  <div className="p-2.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                    <Check size={14} className="text-emerald-700" />
                    <span>{uploadStatus}</span>
                  </div>
                )}

                {/* URL Input Mode Fallback */}
                {useUrlMode && (
                  <div className="space-y-2 bg-white p-3.5 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-700">Paste Image URLs:</span>
                      <button
                        type="button"
                        onClick={handleAddImageField}
                        className="text-[11px] font-bold text-[#7e5222] hover:underline flex items-center gap-1"
                      >
                        <Plus size={12} />
                        <span>Add Row</span>
                      </button>
                    </div>
                    {formData.images.map((imgUrl, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-14 text-[10px] font-bold text-slate-500 uppercase">
                          {idx === 0 ? 'Cover' : `#${idx + 1}`}:
                        </span>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={imgUrl}
                          onChange={(e) => handleImageChange(idx, e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-[11px] focus:ring-2 focus:ring-[#7e5222]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Photo Previews & Cover Selection Gallery */}
                {formData.images.filter(Boolean).length > 0 && (
                  <div className="pt-2 border-t border-amber-200/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Uploaded Photos ({formData.images.filter(Boolean).length}):
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        First photo is the Cover Image
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {formData.images
                        .filter(Boolean)
                        .map((url, i) => (
                          <div
                            key={i}
                            className={`group relative aspect-[4/5] rounded-2xl overflow-hidden border-2 transition-all bg-white shadow-sm ${
                              i === 0
                                ? 'border-amber-600 ring-2 ring-amber-500/30'
                                : 'border-slate-200 hover:border-amber-400'
                            }`}
                          >
                            <img
                              src={url}
                              alt={`Product Photo ${i + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80'; }}
                            />

                            {/* Badge */}
                            <div className="absolute top-1.5 left-1.5">
                              {i === 0 ? (
                                <span className="bg-amber-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                                  <Star size={9} fill="currentColor" />
                                  <span>Cover</span>
                                </span>
                              ) : (
                                <span className="bg-black/60 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                                  #{i + 1}
                                </span>
                              )}
                            </div>

                            {/* Action Buttons overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(i)}
                                  className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 shadow"
                                  title="Delete photo"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>

                              {i > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMakeCover(i)}
                                  className="w-full py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-[9px] rounded-lg shadow transition-all"
                                >
                                  Make Cover
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
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
                  className="flex items-center gap-2 bg-[#7e5222] hover:bg-[#674221] text-white px-7 py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95"
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
