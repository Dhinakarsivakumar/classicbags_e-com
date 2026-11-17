import React from 'react';
import {
  Package,
  Layers,
  ShoppingCart,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Plus,
} from 'lucide-react';

export default function DashboardOverview({ products, orders, onNavigate }) {
  // KPI calculations
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (p.stockUnits || 0), 0);
  const totalOrders = orders.length;
  const revenue = orders
    .filter((o) => o.status === 'PAID_APPROVED' || o.status === 'PROCESSING' || o.status === 'SHIPPED' || o.status === 'DELIVERED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const lowStockProducts = products.filter((p) => p.stockUnits < 5000);
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);

  const formatNumber = (n) => n.toLocaleString('en-IN');
  const formatCurrency = (n) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const statusColors = {
    PENDING_PAYMENT: 'bg-amber-100 text-amber-700 border-amber-200',
    PAID_APPROVED: 'bg-green-100 text-green-700 border-green-200',
    PROCESSING: 'bg-blue-100 text-blue-700 border-blue-200',
    SHIPPED: 'bg-purple-100 text-purple-700 border-purple-200',
    DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  const statusLabels = {
    PENDING_PAYMENT: 'Pending Payment',
    PAID_APPROVED: 'Paid & Approved',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
  };

  const kpis = [
    {
      label: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'from-indigo-500 to-blue-500',
      bgLight: 'bg-indigo-50',
    },
    {
      label: 'Total Stock Units',
      value: formatNumber(totalStock),
      icon: Layers,
      color: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50',
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50',
    },
    {
      label: 'Revenue',
      value: formatCurrency(revenue),
      icon: IndianRupee,
      color: 'from-green-500 to-emerald-500',
      bgLight: 'bg-green-50',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back. Here's your store overview.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">{kpi.label}</span>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-slate-800">Low Stock Alerts</h2>
            {lowStockProducts.length > 0 && (
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                {lowStockProducts.length}
              </span>
            )}
          </div>
          <div className="p-5">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">All stock levels are healthy ✓</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      p.stockUnits < 2000
                        ? 'bg-red-50 border-red-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        p.stockUnits < 2000 ? 'text-red-600' : 'text-amber-600'
                      }`}>
                        {formatNumber(p.stockUnits)} units
                      </p>
                      <p className="text-xs text-slate-400">
                        {p.stockUnits < 2000 ? '🔴 Critical' : '🟡 Low'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-slate-800">Recent Orders</h2>
          </div>
          <div className="p-5">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{order.customerName || 'Customer'}</p>
                      <p className="text-xs text-slate-400 font-mono">{order.id}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="text-sm font-bold text-slate-700">{formatCurrency(order.totalAmount || 0)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[order.status] || 'bg-slate-100 text-slate-600'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('products')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
          <button
            onClick={() => onNavigate('orders')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            View All Orders
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
