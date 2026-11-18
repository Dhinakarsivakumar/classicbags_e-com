// Shared localStorage bridge between Customer Store (3001) and Admin Portal (3002)
// Both portals run on localhost so they share localStorage.

const KEYS = {
  PRODUCTS: 'cb_products',
  ORDERS: 'cb_orders',
  WEBHOOK_LOGS: 'cb_webhook_logs',
  SETTINGS: 'cb_settings',
  WISHLIST: 'cb_wishlist',
  ADDRESSES: 'cb_addresses',
  USER_PROFILE: 'cb_user_profile',
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

  // --- Wishlist ---
  getWishlist: () => {
    try { return JSON.parse(localStorage.getItem(KEYS.WISHLIST)) || []; }
    catch { return []; }
  },
  saveWishlist: (wishlist) => {
    localStorage.setItem(KEYS.WISHLIST, JSON.stringify(wishlist));
    window.dispatchEvent(new Event('storage'));
  },

  // --- Saved Addresses ---
  getAddresses: () => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEYS.ADDRESSES));
      if (saved && saved.length > 0) return saved;
      return [
        {
          id: 'addr-default',
          title: 'Shop / Factory',
          fullName: 'S. Dhinakar',
          phone: '8940679198',
          street: 'Plot No. 38, 6th Street, Medical College Road',
          area: 'LIC Colony',
          city: 'Thanjavur',
          pincode: '613007',
          isDefault: true
        }
      ];
    } catch { return []; }
  },
  saveAddresses: (addresses) => {
    localStorage.setItem(KEYS.ADDRESSES, JSON.stringify(addresses));
    window.dispatchEvent(new Event('storage'));
  },

  // --- Customer Profile ---
  getUserProfile: () => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.USER_PROFILE)) || {
        name: 'Classic Customer',
        phone: '8940679198',
        email: 'dhinakar@classicbags.com',
        businessName: 'Thanjavur Retail Store'
      };
    } catch {
      return { name: '', phone: '8940679198', email: '', businessName: '' };
    }
  },
  saveUserProfile: (profile) => {
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    window.dispatchEvent(new Event('storage'));
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
