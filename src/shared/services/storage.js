// Shared Data Bridge & Cloud Sync Service for Classic Bags
// Manages local cache and syncs with Cloud/Webhook server

const KEYS = {
  PRODUCTS: 'cb_products',
  ORDERS: 'cb_orders',
  WEBHOOK_LOGS: 'cb_webhook_logs',
  SETTINGS: 'cb_settings',
  WISHLIST: 'cb_wishlist',
  ADDRESSES: 'cb_addresses',
  USER_PROFILE: 'cb_user_profile',
  ADMIN_AUTH: 'cb_admin_auth',
  AUTH_USER: 'cb_auth_user',
};

// Owner authorized phone number
const OWNER_PHONE = '8940679198';

const getCloudEndpoints = () => {
  const list = [];
  if (typeof window !== 'undefined' && window.location.hostname) {
    const host = window.location.hostname;
    list.push(`http://${host}:3002`);
  }
  list.push('http://10.220.210.247:3002');
  list.push('http://localhost:3002');
  return [...new Set(list)];
};

export const Storage = {
  // --- Google & Customer Auth ---
  getAuthUser: () => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.AUTH_USER)) || null;
    } catch {
      return null;
    }
  },

  setAuthUser: (user) => {
    if (user) {
      localStorage.setItem(KEYS.AUTH_USER, JSON.stringify(user));
      // Auto-update user profile
      const current = Storage.getUserProfile();
      Storage.saveUserProfile({
        ...current,
        name: user.name || current.name || '',
        email: user.email || current.email || '',
        phone: user.phone || current.phone || '',
        avatar: user.picture || user.avatar || current.avatar || ''
      });
    } else {
      localStorage.removeItem(KEYS.AUTH_USER);
    }
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('cb_auth_changed', { detail: { user } }));
  },

  logoutUser: () => {
    Storage.setAuthUser(null);
  },

  // --- Admin Access Control ---
  isAdminPhone: (phone) => {
    if (!phone) return false;
    const clean = String(phone).replace(/\D/g, '');
    return clean.endsWith(OWNER_PHONE);
  },

  isAdminAuthenticated: () => {
    try {
      const auth = JSON.parse(sessionStorage.getItem(KEYS.ADMIN_AUTH));
      return !!(auth && auth.token);
    } catch {
      return false;
    }
  },

  setAdminAuthenticated: (status, details = {}) => {
    if (status) {
      sessionStorage.setItem(KEYS.ADMIN_AUTH, JSON.stringify({
        token: `auth_${Date.now()}`,
        time: new Date().toISOString(),
        ...details
      }));
    } else {
      sessionStorage.removeItem(KEYS.ADMIN_AUTH);
    }
    window.dispatchEvent(new CustomEvent('cb_admin_auth_changed', { detail: { authenticated: status } }));
  },

  // --- Cloud Sync ---
  syncOrdersFromCloud: async () => {
    for (const base of getCloudEndpoints()) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1500);
        const res = await fetch(`${base}/api/orders`, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.orders)) {
            const local = Storage.getOrders() || [];
            const merged = [...data.orders];
            for (const loc of local) {
              if (!merged.some(m => m.id === loc.id)) {
                merged.push(loc);
              }
            }
            localStorage.setItem(KEYS.ORDERS, JSON.stringify(merged));
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('cb_store_updated', { detail: { key: KEYS.ORDERS, value: merged } }));
            return merged;
          }
        }
      } catch {
        // endpoint unavailable, try next
      }
    }
    return Storage.getOrders();
  },

  // --- Products ---
  getProducts: () => {
    try { return JSON.parse(localStorage.getItem(KEYS.PRODUCTS)) || null; }
    catch { return null; }
  },
  saveProducts: (products) => {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new Event('storage'));
  },

  // --- Orders ---
  getOrders: () => {
    try { return JSON.parse(localStorage.getItem(KEYS.ORDERS)) || null; }
    catch { return null; }
  },
  saveOrders: (orders) => {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('cb_store_updated', { detail: { key: KEYS.ORDERS, value: orders } }));

    // Background push to Cloud Server
    for (const base of getCloudEndpoints()) {
      try {
        fetch(`${base}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orders })
        }).catch(() => {});
      } catch {}
    }
  },

  // --- Webhook Logs ---
  getWebhookLogs: () => {
    try { return JSON.parse(localStorage.getItem(KEYS.WEBHOOK_LOGS)) || []; }
    catch { return []; }
  },
  saveWebhookLogs: (logs) => {
    localStorage.setItem(KEYS.WEBHOOK_LOGS, JSON.stringify(logs));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('cb_store_updated', { detail: { key: KEYS.WEBHOOK_LOGS, value: logs } }));
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
      return (saved && Array.isArray(saved)) ? saved : [];
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
        name: '',
        phone: '',
        email: '',
        businessName: ''
      };
    } catch {
      return { name: '', phone: '', email: '', businessName: '' };
    }
  },
  saveUserProfile: (profile) => {
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    window.dispatchEvent(new Event('storage'));
  },

  // Listen for cross-tab and same-tab data changes
  onStorageChange: (callback) => {
    const handler = (e) => {
      if (e.key && Object.values(KEYS).includes(e.key)) {
        callback(e.key, e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    const customHandler = (e) => {
      if (e.detail && e.detail.key) {
        callback(e.detail.key, e.detail.value);
      }
    };
    window.addEventListener('storage', handler);
    window.addEventListener('cb_store_updated', customHandler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('cb_store_updated', customHandler);
    };
  }
};
