// Shared localStorage bridge between Customer Store (3001) and Admin Portal (3002)
// Both portals run on localhost so they share localStorage.

const KEYS = {
  PRODUCTS: 'cb_products',
  ORDERS: 'cb_orders',
  WEBHOOK_LOGS: 'cb_webhook_logs',
  SETTINGS: 'cb_settings',
};

export const Storage = {
  // --- Products ---
  getProducts: () => {
    try { return JSON.parse(localStorage.getItem(KEYS.PRODUCTS)) || null; }
    catch { return null; }
  },
  saveProducts: (products) => {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new Event('storage')); // notify same-tab listeners
  },

  // --- Orders ---
  getOrders: () => {
    try { return JSON.parse(localStorage.getItem(KEYS.ORDERS)) || null; }
    catch { return null; }
  },
  saveOrders: (orders) => {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new Event('storage'));
  },

  // --- Webhook Logs ---
  getWebhookLogs: () => {
    try { return JSON.parse(localStorage.getItem(KEYS.WEBHOOK_LOGS)) || []; }
    catch { return []; }
  },
  saveWebhookLogs: (logs) => {
    localStorage.setItem(KEYS.WEBHOOK_LOGS, JSON.stringify(logs));
  },

  // --- Settings ---
  getSettings: () => {
    try { return JSON.parse(localStorage.getItem(KEYS.SETTINGS)) || null; }
    catch { return null; }
  },
  saveSettings: (settings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Listen for cross-tab data changes (admin updates stock → store sees it)
  onStorageChange: (callback) => {
    const handler = (e) => {
      if (e.key && Object.values(KEYS).includes(e.key)) {
        callback(e.key, e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }
};
