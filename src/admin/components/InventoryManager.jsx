import React, { useState, useCallback } from 'react';
import {
  Layers,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Minus,
  Plus,
  Image as ImageIcon,
  Clock,
  ArrowUpDown,
} from 'lucide-react';

export default function InventoryManager({ products, onUpdateProducts }) {
  const [stockLog, setStockLog] = useState([]);

  const totalStock = products.reduce((s, p) => s + (p.stockUnits || 0), 0);
  const lowCount = products.filter((p) => p.stockUnits < 5000).length;
  const adequateCount = products.filter((p) => p.stockUnits >= 10000).length;

  const getStatusBadge = (stock) => {
    if (stock >= 10000)
      return { label: 'Adequate', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 };
    if (stock >= 5000)
      return { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: TrendingDown };
    return { label: 'Low - Reorder', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle };
  };

  const adjustStock = useCallback(
    (productId, delta) => {
      const updated = products.map((p) => {
        if (p.id !== productId) return p;
        const oldStock = p.stockUnits;
        const newStock = Math.max(0, oldStock + delta);
        // Add to log
        setStockLog((prev) =>
          [
            {
              id: Date.now(),
              timestamp: new Date().toLocaleString('en-IN'),
              productName: p.name,
              oldValue: oldStock,
              newValue: newStock,
              change: delta,
            },
            ...prev,
          ].slice(0, 10)
        );
        return { ...p, stockUnits: newStock };
      });
      onUpdateProducts(updated);
    },
    [products, onUpdateProducts]
  );

  const handleDirectEdit = useCallback(
    (productId, newValue) => {
      const val = parseInt(newValue) || 0;
      const updated = products.map((p) => {
        if (p.id !== productId) return p;
        const oldStock = p.stockUnits;
        setStockLog((prev) =>
          [
            {
              id: Date.now(),
              timestamp: new Date().toLocaleString('en-IN'),
              productName: p.name,
              oldValue: oldStock,
              newValue: val,
              change: val - oldStock,
            },
            ...prev,
          ].slice(0, 10)
        );
        return { ...p, stockUnits: val };
      });
      onUpdateProducts(updated);
    },
    [products, onUpdateProducts]
  );

  const formatNumber = (n) => n.toLocaleString('en-IN');

  const adjustButtons = [
    { delta: -500, label: '-500', color: 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200' },
    { delta: -100, label: '-100', color: 'text-red-500 bg-red-50 hover:bg-red-100 border-red-200' },
    { delta: 100, label: '+100', color: 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200' },
    { delta: 500, label: '+500', color: 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200' },
    { delta: 1000, label: '+1K', color: 'text-green-700 bg-green-50 hover:bg-green-100 border-green-200' },
    { delta: 5000, label: '+5K', color: 'text-green-700 bg-green-50 hover:bg-green-100 border-green-200' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Stock & Inventory</h1>
        <p className="text-slate-500 mt-1">Manage stock levels across all products</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Stock</p>
              <p className="text-xl font-bold text-slate-800">{formatNumber(totalStock)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Adequate Stock</p>
              <p className="text-xl font-bold text-slate-800">{adequateCount} products</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Low Stock</p>
              <p className="text-xl font-bold text-slate-800">{lowCount} products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">GSM</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Current Stock</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => {
                const status = getStatusBadge(product.stockUnits);
                const StatusIcon = status.icon;
                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-slate-700">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell capitalize">{product.category}</td>
                    <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{product.gsm}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={product.stockUnits}
                        onChange={(e) => handleDirectEdit(product.id, e.target.value)}
                        className={`w-28 px-2 py-1.5 border rounded-lg text-sm font-mono font-medium text-right
                          ${product.stockUnits < 5000
                            ? 'border-red-300 bg-red-50 text-red-700'
                            : 'border-slate-200 bg-white text-slate-700'
                          }
                          focus:border-indigo-400`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {adjustButtons.map((btn) => (
                          <button
                            key={btn.label}
                            onClick={() => adjustStock(product.id, btn.delta)}
                            className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${btn.color}`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movement Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-400" />
          <h2 className="font-semibold text-slate-800">Stock Movement Log</h2>
          <span className="text-xs text-slate-400 ml-auto">Last 10 changes</span>
        </div>
        <div className="p-5">
          {stockLog.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              No stock changes yet this session. Adjust stock above to see the log.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 text-xs uppercase tracking-wider">
                    <th className="pb-2 font-medium">Timestamp</th>
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 font-medium text-right">Old</th>
                    <th className="pb-2 font-medium text-right">New</th>
                    <th className="pb-2 font-medium text-right">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockLog.map((entry) => (
                    <tr key={entry.id} className="text-slate-600">
                      <td className="py-2 text-xs font-mono text-slate-400">{entry.timestamp}</td>
                      <td className="py-2 font-medium text-slate-700">{entry.productName}</td>
                      <td className="py-2 text-right font-mono">{formatNumber(entry.oldValue)}</td>
                      <td className="py-2 text-right font-mono">{formatNumber(entry.newValue)}</td>
                      <td className="py-2 text-right">
                        <span
                          className={`inline-flex items-center gap-0.5 font-mono font-medium ${
                            entry.change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {entry.change > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {entry.change > 0 ? '+' : ''}
                          {formatNumber(entry.change)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
