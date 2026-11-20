import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { INITIAL_PRODUCTS, CATEGORIES, STORE_SETTINGS } from '../shared/data/initialData';
import { Storage } from '../shared/services/storage';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductCustomizerModal from './components/ProductCustomizerModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import CustomerSettingsModal from './components/CustomerSettingsModal';
import WishlistDrawer from './components/WishlistDrawer';
import Footer from './components/Footer';
import AdminApp from '../admin/App';
import GoogleAuthModal from './components/GoogleAuthModal';
import { Search, SlidersHorizontal, ArrowUpDown, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('orders');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [authUser, setAuthUser] = useState(() => Storage.getAuthUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRedirectMessage, setAuthRedirectMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Load products, wishlist, and orders from storage on mount
  useEffect(() => {
    const stored = Storage.getProducts();
    if (stored && stored.length > 0) {
      // Ensure cb-001 is updated with 100 Bags = ₹1.00 (₹0.01 per bag)
      const synced = stored.map(p => p.id === 'cb-001' ? {
        ...p,
        pricePerUnit: 0.01,
        minOrderQty: 100,
        name: 'Brown Kraft Shopper Bag',
        tamilName: 'பிரவுன் கிராஃப்ட் ஷாப்பர் பேக் (100 Bags = ₹1 Test Offer)',
        tierPricing: [
          { min: 100, price: 0.01 },
          { min: 500, price: 0.01 },
          { min: 2000, price: 0.01 },
          { min: 5000, price: 0.01 }
        ]
      } : p);
      Storage.saveProducts(synced);
      setProducts(synced);
    } else {
      Storage.saveProducts(INITIAL_PRODUCTS);
      setProducts(INITIAL_PRODUCTS);
    }
    setWishlist(Storage.getWishlist() || []);
    setOrders(Storage.getOrders() || []);
  }, []);

  // Listen for cross-tab storage changes (admin updates stock or order status)
  useEffect(() => {
    const cleanup = Storage.onStorageChange((key, newValue) => {
      if (key === 'cb_products' && newValue) setProducts(newValue);
      if (key === 'cb_orders' && newValue) setOrders(newValue);
      if (key === 'cb_wishlist' && newValue) setWishlist(newValue);
    });

    const handleAuthChange = (e) => {
      setAuthUser(e.detail?.user !== undefined ? e.detail.user : Storage.getAuthUser());
    };
    window.addEventListener('cb_auth_changed', handleAuthChange);

    return () => {
      if (cleanup) cleanup();
      window.removeEventListener('cb_auth_changed', handleAuthChange);
    };
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('cb_cart'));
      if (savedCart && savedCart.length > 0) setCartItems(savedCart);
    } catch { /* ignore */ }
  }, []);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('cb_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Quick add: adds min order qty to cart
  const handleQuickAdd = useCallback((product) => {
    setCartItems(prev => {
      const existing = prev.find(item =>
        item.productId === product.id &&
        item.size === product.sizes[0] &&
        item.gsm === product.gsm &&
        item.handle === product.handles[0] &&
        !item.logoFile
      );
      if (existing) {
        return prev.map(item =>
          item === existing
            ? { ...item, qty: item.qty + product.minOrderQty }
            : item
        );
      }
      return [...prev, {
        id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: product.id,
        name: product.name,
        image: product.images[0],
        size: product.sizes[0],
        gsm: product.gsm,
        handle: product.handles[0],
        qty: product.minOrderQty,
        tierPricing: product.tierPricing,
        unitPrice: product.pricePerUnit,
        logoFile: null,
        logoPreview: null,
        printNotes: '',
      }];
    });
    showToast(`Added ${product.minOrderQty} pcs of ${product.name} to Cart!`);
    setIsCartOpen(true);
  }, []);

  // Customized add from modal
  const handleCustomizedAdd = useCallback((customItem) => {
    setCartItems(prev => [...prev, {
      id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...customItem,
    }]);
    setSelectedProduct(null);
    showToast(`Custom bag configuration added to Cart!`);
    setIsCartOpen(true);
  }, []);

  // Toggle Wishlist
  const handleToggleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      let updated;
      if (exists) {
        updated = prev.filter(item => item.id !== product.id);
        showToast('Removed from Wishlist');
      } else {
        updated = [...prev, product];
        showToast('❤️ Added to Wishlist!');
      }
      Storage.saveWishlist(updated);
      return updated;
    });
  }, []);

  // Remove from Wishlist
  const handleRemoveFromWishlist = useCallback((productId) => {
    setWishlist(prev => {
      const updated = prev.filter(item => item.id !== productId);
      Storage.saveWishlist(updated);
      return updated;
    });
  }, []);

  // Move from Wishlist to Cart
  const handleMoveToCart = useCallback((product) => {
    handleQuickAdd(product);
    handleRemoveFromWishlist(product.id);
  }, [handleQuickAdd, handleRemoveFromWishlist]);

  // Clear Wishlist
  const handleClearWishlist = useCallback(() => {
    setWishlist([]);
    Storage.saveWishlist([]);
    showToast('Wishlist cleared');
  }, []);

  // Update cart qty
  const handleUpdateQty = useCallback((cartId, newQty) => {
    if (newQty <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== cartId));
      return;
    }
    setCartItems(prev =>
      prev.map(item => item.id === cartId ? { ...item, qty: newQty } : item)
    );
  }, []);

  // Remove from cart
  const handleRemoveItem = useCallback((cartId) => {
    setCartItems(prev => prev.filter(item => item.id !== cartId));
  }, []);

  // Calculate unit price based on tier pricing
  const getUnitPrice = useCallback((tierPricing, qty) => {
    if (!tierPricing || tierPricing.length === 0) return 0;
    let price = tierPricing[0].price;
    for (const tier of tierPricing) {
      if (qty >= tier.min) price = tier.price;
    }
    return price;
  }, []);

  // Cart subtotal
  const cartSubtotal = cartItems.reduce((sum, item) => {
    const unitPrice = getUnitPrice(item.tierPricing, item.qty);
    return sum + unitPrice * item.qty;
  }, 0);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  // Checkout handler (Requires Google Login)
  const handleCheckout = useCallback(() => {
    if (!authUser) {
      setAuthRedirectMessage('Please sign in with your Google account to confirm and place your order.');
      setIsAuthModalOpen(true);
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, [authUser]);

  // Auth success handler
  const handleAuthSuccess = useCallback((user) => {
    setAuthUser(user);
    setIsAuthModalOpen(false);
    showToast(`Welcome, ${user.name}!`);
    if (cartItems.length > 0) {
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
    }
  }, [cartItems]);

  // Sign out handler
  const handleLogout = useCallback(() => {
    Storage.logoutUser();
    setAuthUser(null);
    showToast('Signed out of Google account.');
  }, []);

  // Clear cart after successful order
  const handleOrderSuccess = useCallback((order) => {
    setCartItems([]);
    setIsCheckoutOpen(false);
    setOrders(Storage.getOrders() || []);
    showToast(`🎉 Order Placed Successfully! (Ref: ${order?.id || 'CB-ORDER'})`);
    // Open settings order tab
    setSettingsTab('orders');
    setIsSettingsOpen(true);
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filter by Search Query (Name, Tamil name, GSM, Size, Material)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.tamilName && p.tamilName.includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        `${p.gsm} gsm`.includes(q)
      );
    }

    // Sort By
    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.pricePerUnit - a.pricePerUnit);
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Open customizer directly for logo customization
  const handleOpenCustomLogo = useCallback(() => {
    const customProduct = products.find(p => p.category === 'custom') || products[0];
    if (customProduct) {
      setSelectedProduct(customProduct);
    }
  }, [products]);

  const handleOpenAdmin = useCallback(() => {
    const currentAuth = authUser || Storage.getAuthUser();
    if (!currentAuth || !Storage.isAdminEmail(currentAuth.email)) {
      setAuthRedirectMessage('Admin Access Restricted: Please sign in with the authorized owner Google Account (sdhinakar6@gmail.com).');
      setIsAuthModalOpen(true);
      return;
    }
    setIsSettingsOpen(false);
    setIsAdminOpen(true);
  }, [authUser]);

  return (
    <div className="min-h-screen bg-[#fbf7ee] text-stone-900 selection:bg-amber-200">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#674221] text-amber-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-amber-500/40 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Navbar with Cart, Wishlist, Google Auth, and Settings buttons */}
      <Navbar
        cartItemCount={cartItemCount}
        onCartOpen={() => setIsCartOpen(true)}
        wishlistCount={wishlist.length}
        onWishlistOpen={() => setIsWishlistOpen(true)}
        orderCount={orders.length}
        onSettingsOpen={() => {
          setSettingsTab('orders');
          setIsSettingsOpen(true);
        }}
        authUser={authUser}
        onOpenAuth={() => {
          setAuthRedirectMessage('Sign in with Google to view and manage your account.');
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Hero Section */}
      <Hero 
        products={products} 
        onCustomizeClick={handleOpenCustomLogo} 
      />

      {/* Catalog Search & Filter Controls */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3d2510] tracking-tight">
              Wholesale Paper Bag Catalog
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Biodegradable kraft paper bags • Factory-direct wholesale pricing
            </p>
          </div>

          {/* Search & Sort Bar */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Live Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search bags by size, gsm, type..."
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-full border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#7e5222] shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-xs py-2.5 pl-3 pr-7 rounded-full border border-stone-200 bg-white text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#7e5222] shadow-sm appearance-none cursor-pointer"
              >
                <option value="featured">Featured Bags</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'bg-[#7e5222] text-white shadow-md shadow-amber-900/20'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            All Products ({products.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = products.filter(p => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-[#7e5222] text-white shadow-md shadow-amber-900/20'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlist.some(w => w.id === product.id)}
              onToggleWishlist={handleToggleWishlist}
              onSelect={() => setSelectedProduct(product)}
              onQuickAdd={() => handleQuickAdd(product)}
            />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8">
            <p className="text-base font-bold text-stone-700">No Products Found</p>
            <p className="text-xs text-stone-500 mt-1">Try searching with different keywords or reset your filters.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-4 px-5 py-2 bg-[#7e5222] text-white text-xs font-bold rounded-full hover:bg-[#674221]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Custom Printing CTA Banner */}
      <section className="bg-gradient-to-r from-[#674221] via-[#7e5222] to-[#674221] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            🎨 Need Custom Logo Printing?
          </h2>
          <p className="text-amber-100 mb-8 max-w-2xl mx-auto text-xs sm:text-sm">
            We offer multi-color screen printing and hot-foil stamping on all bag types.
            Upload your artwork, preview on bag mockup, and get instant pricing. Minimum order: 500 pieces.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${STORE_SETTINGS.whatsapp}?text=Hi%20Classic%20Bags!%20I%20need%20custom%20logo%20printed%20bags.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold transition-all shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.37 0-4.584-.67-6.465-1.832l-.452-.27-2.675.897.896-2.675-.27-.452A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
              </svg>
              WhatsApp Us
            </a>
            <button
              onClick={handleOpenCustomLogo}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-full font-semibold transition-all"
            >
              Upload Logo & Preview Mockup
            </button>
          </div>
        </div>
      </section>

      <Footer onOpenAdmin={handleOpenAdmin} />

      {/* MODALS & DRAWERS */}

      {/* 1. Product Customizer Modal */}
      {selectedProduct && (
        <ProductCustomizerModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleCustomizedAdd}
        />
      )}

      {/* 2. Cart Drawer */}
      {isCartOpen && (
        <CartDrawer
          items={cartItems}
          onClose={() => setIsCartOpen(false)}
          onUpdateQty={handleUpdateQty}
          onRemove={handleRemoveItem}
          getUnitPrice={getUnitPrice}
          subtotal={cartSubtotal}
          onCheckout={handleCheckout}
          authUser={authUser}
        />
      )}

      {/* 3. Wishlist Drawer */}
      {isWishlistOpen && (
        <WishlistDrawer
          isOpen={isWishlistOpen}
          onClose={() => setIsWishlistOpen(false)}
          wishlistItems={wishlist}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onMoveToCart={handleMoveToCart}
          onClearWishlist={handleClearWishlist}
        />
      )}

      {/* 4. Customer Settings & Orders Modal */}
      {isSettingsOpen && (
        <CustomerSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          activeTab={settingsTab}
          onOpenAdmin={handleOpenAdmin}
        />
      )}

      {/* 5. Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={true}
          cartItems={cartItems}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderCompleted={handleOrderSuccess}
          onOrderSuccess={handleOrderSuccess}
          authUser={authUser}
          onOpenAuth={() => {
            setAuthRedirectMessage('Sign in with Google to place and verify your order.');
            setIsAuthModalOpen(true);
          }}
        />
      )}

      {/* 6. Admin Panel (Factory Owner Restricted) */}
      {isAdminOpen && (
        <AdminApp onClose={() => setIsAdminOpen(false)} />
      )}

      {/* 7. Google Authentication Modal */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        redirectMessage={authRedirectMessage}
      />
    </div>
  );
}
