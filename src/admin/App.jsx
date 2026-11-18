import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, STORE_SETTINGS } from '../shared/data/initialData';
import { Storage } from '../shared/services/storage';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import ProductManager from './components/ProductManager';
import InventoryManager from './components/InventoryManager';
import OrderManager from './components/OrderManager';
import WebhookMonitor from './components/WebhookMonitor';
import SettingsPanel from './components/SettingsPanel';

export default function AdminApp({ onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Storage.isAdminAuthenticated());
  const [activePage, setActivePage] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [settings, setSettings] = useState(STORE_SETTINGS);

  // Load data & sync with cloud on mount
  useEffect(() => {
    const storedProducts = Storage.getProducts();
    setProducts(storedProducts || INITIAL_PRODUCTS);

    const storedOrders = Storage.getOrders();
    setOrders(storedOrders || INITIAL_ORDERS);

    // Sync cloud orders
    Storage.syncOrdersFromCloud().then(synced => {
      if (synced && synced.length > 0) {
        setOrders(synced);
      }
    });

    const storedLogs = Storage.getWebhookLogs();
    setWebhookLogs(storedLogs || []);

    const storedSettings = Storage.getSettings();
    if (storedSettings) setSettings(storedSettings);
  }, []);

  // Listen for storage changes & admin auth changes
  useEffect(() => {
    const cleanup = Storage.onStorageChange((key, newValue) => {
      if (key === 'cb_products' && newValue) setProducts(newValue);
      if (key === 'cb_orders' && newValue) setOrders(newValue);
      if (key === 'cb_webhook_logs' && newValue) setWebhookLogs(newValue);
      if (key === 'cb_settings' && newValue) setSettings(newValue);
    });
    return cleanup;
  }, []);

  const handleUpdateProducts = useCallback((updatedProducts) => {
    setProducts(updatedProducts);
    Storage.saveProducts(updatedProducts);
  }, []);

  const handleUpdateOrders = useCallback((updatedOrders) => {
    setOrders(updatedOrders);
    Storage.saveOrders(updatedOrders);
  }, []);

  const handleUpdateSettings = useCallback((updatedSettings) => {
    setSettings(updatedSettings);
    Storage.saveSettings(updatedSettings);
  }, []);

  const handleLogout = () => {
    Storage.setAdminAuthenticated(false);
    setIsAuthenticated(false);
    setActivePage('dashboard');
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen
        settings={settings}
        onAuthenticated={() => setIsAuthenticated(true)}
        onClose={onClose}
      />
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardOverview products={products} orders={orders} onNavigate={setActivePage} />;
      case 'products':
        return <ProductManager products={products} onUpdateProducts={handleUpdateProducts} />;
      case 'inventory':
        return <InventoryManager products={products} onUpdateProducts={handleUpdateProducts} />;
      case 'orders':
        return <OrderManager orders={orders} products={products} onUpdateOrders={handleUpdateOrders} />;
      case 'webhooks':
        return <WebhookMonitor webhookLogs={webhookLogs} orders={orders} />;
      case 'settings':
        return <SettingsPanel settings={settings} onUpdateSettings={handleUpdateSettings} />;
      default:
        return <DashboardOverview products={products} orders={orders} onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-50 flex">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
        onClose={onClose}
      />
      <main className="flex-1 overflow-y-auto lg:ml-64 p-4 lg:p-8">
        <div className="animate-fadeIn max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
