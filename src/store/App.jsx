import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_PRODUCTS, CATEGORIES, STORE_SETTINGS } from '../shared/data/initialData';
import { Storage } from '../shared/services/storage';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductCustomizerModal from './components/ProductCustomizerModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import Footer from './components/Footer';

export default function App() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load products from storage on mount
  useEffect(() => {
    const stored = Storage.getProducts();
    setProducts(stored && stored.length > 0 ? stored : INITIAL_PRODUCTS);
  }, []);

  // Listen for cross-tab storage changes (admin updates stock)
  useEffect(() => {
    const cleanup = Storage.onStorageChange((key, newValue) => {
      if (key === 'cb_products' && newValue) {
        setProducts(newValue);
      }
    });
    return cleanup;
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
        logoFile: null,
        logoPreview: null,
        printNotes: '',
      }];
    });
    setIsCartOpen(true);
  }, []);

  // Customized add from modal
  const handleCustomizedAdd = useCallback((customItem) => {
    setCartItems(prev => [...prev, {
      id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...customItem,
    }]);
    setSelectedProduct(null);
    setIsCartOpen(true);
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

  // Checkout handler
  const handleCheckout = useCallback(() => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, []);

  // Place order
  const handlePlaceOrder = useCallback((orderDetails) => {
    const orderId = `CB-${Date.now().toString(36).toUpperCase()}`;
    const paise = Math.floor(Math.random() * 89) + 11; // 11-99
    const totalWithPaise = Math.floor(cartSubtotal) + paise / 100;

    const order = {
      id: orderId,
      items: cartItems.map(item => ({
        ...item,
        unitPrice: getUnitPrice(item.tierPricing, item.qty),
        lineTotal: getUnitPrice(item.tierPricing, item.qty) * item.qty,
      })),
      subtotal: cartSubtotal,
      total: totalWithPaise,
      paise,
      customer: orderDetails,
      status: 'PENDING_PAYMENT',
      createdAt: new Date().toISOString(),
    };

    // Save to storage for admin portal
    const existingOrders = Storage.getOrders() || [];
    Storage.saveOrders([...existingOrders, order]);

    return order;
  }, [cartItems, cartSubtotal, getUnitPrice]);

  // Clear cart after successful order
  const handleOrderSuccess = useCallback(() => {
    setCartItems([]);
    setIsCheckoutOpen(false);
  }, []);

  // Filter products by category
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#fbf7ee]">
      <Navbar
        cartItemCount={cartItemCount}
        onCartOpen={() => setIsCartOpen(true)}
      />

      <Hero products={products} />

      {/* Category Filter Pills */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'bg-[#7e5222] text-white shadow-lg shadow-amber-900/20'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            All Products
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-[#7e5222] text-white shadow-lg shadow-amber-900/20'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={() => setSelectedProduct(product)}
              onQuickAdd={() => handleQuickAdd(product)}
            />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-stone-400">
            <p className="text-lg">No products in this category yet.</p>
          </div>
        )}
      </section>

      {/* Custom Printing CTA Banner */}
      <section className="bg-gradient-to-r from-[#674221] via-[#7e5222] to-[#674221] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            🎨 Need Custom Logo Printing?
          </h2>
          <p className="text-amber-100 mb-8 max-w-2xl mx-auto">
            We offer multi-color screen printing and hot-foil stamping on all bag types.
            Upload your artwork and get instant pricing. Minimum order: 500 pieces.
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
              onClick={() => {
                const customProduct = products.find(p => p.category === 'custom');
                if (customProduct) setSelectedProduct(customProduct);
              }}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-full font-semibold transition-all"
            >
              Upload Logo & Order Now
            </button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      {selectedProduct && (
        <ProductCustomizerModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleCustomizedAdd}
        />
      )}

      {isCartOpen && (
        <CartDrawer
          items={cartItems}
          onClose={() => setIsCartOpen(false)}
          onUpdateQty={handleUpdateQty}
          onRemove={handleRemoveItem}
          getUnitPrice={getUnitPrice}
          subtotal={cartSubtotal}
          onCheckout={handleCheckout}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={true}
          cartItems={cartItems}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderCompleted={handleOrderSuccess}
          onOrderSuccess={handleOrderSuccess}
        />
      )}
    </div>
  );
}
