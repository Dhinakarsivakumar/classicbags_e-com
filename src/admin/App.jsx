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

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [settings, setSettings] = useState(STORE_SETTINGS);

  // Load data from Storage on mount
  useEffect(() => {
    const storedProducts = Storage.getProducts();
    setProducts(storedProducts || INITIAL_PRODUCTS);

    const storedOrders = Storage.getOrders();
    setOrders(storedOrders || INITIAL_ORDERS);

    const storedLogs = Storage.getWebhookLogs();
    setWebhookLogs(storedLogs || []);

    const storedSettings = Storage.getSettings();
    if (storedSettings) setSettings(storedSettings);
  }, []);

  // Listen for cross-tab storage changes (customer orders coming in)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedProducts = Storage.getProducts();
      if (storedProducts) setProducts(storedProducts);

      const storedOrders = Storage.getOrders();
      if (storedOrders) setOrders(storedOrders);

      const storedLogs = Storage.getWebhookLogs();
      if (storedLogs) setWebhookLogs(storedLogs);

      const storedSettings = Storage.getSettings();
      if (storedSettings) setSettings(storedSettings);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
    setIsAuthenticated(false);
    setActivePage('dashboard');
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen
        settings={settings}
        onAuthenticated={() => setIsAuthenticated(true)}
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
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto lg:ml-64">
        <div className="animate-fadeIn">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
