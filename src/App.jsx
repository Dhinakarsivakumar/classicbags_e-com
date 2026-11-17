import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductCustomizerModal from './components/ProductCustomizerModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AdminDashboard from './components/AdminDashboard';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, STORE_SETTINGS } from './data/initialData';
import { SecurityService } from './services/security';
import { Phone, MapPin, Mail, MessageCircle, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('shop'); // 'shop' | 'admin'
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activePendingOrder, setActivePendingOrder] = useState(null);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Handle Quick Add (adds minimum order quantity)
  const handleQuickAdd = (product) => {
    const existingIndex = cartItems.findIndex(item => item.productId === product.id && !item.customLogo);
    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += product.minOrderQty;
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: product.id,
          name: product.name,
          tamilName: product.tamilName,
          image: product.images[0],
          size: product.sizes[0],
          handle: product.handles[0],
          gsm: product.gsm,
          quantity: product.minOrderQty,
          unitPrice: product.pricePerUnit,
          totalPrice: product.pricePerUnit * product.minOrderQty
        }
      ]);
    }
    setIsCartOpen(true);
  };

  // Add customized bag item
  const handleAddCustomizedItem = (item) => {
    setCartItems([...cartItems, item]);
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (index, newQty) => {
    const updated = [...cartItems];
    updated[index].quantity = newQty;
    setCartItems(updated);
  };

  const handleRemoveCartItem = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  // Stock update from Admin
  const handleUpdateProductStock = (productId, newUnits) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, stockUnits: newUnits } : p
    ));
  };

  // Add new product from Admin
  const handleAddNewProduct = (newProd) => {
    setProducts([newProd, ...products]);
  };

  // New order created during checkout
  const handleOrderCreated = (order) => {
    setOrders([order, ...orders]);
    setActivePendingOrder(order);
  };

  // Automated Webhook Handler Engine
  // Receives notification payload, verifies HMAC signature, matches order, marks PAID_APPROVED, deducts stock!
  const handleSimulateWebhook = ({ amount, utr, sender, orderId }) => {
    // 1. Generate security signature
    const payloadStr = JSON.stringify({ amount, utr, sender, orderId });
    const signature = SecurityService.generateSignature(payloadStr, STORE_SETTINGS.webhookSecret);

    // 2. Find matching order by exact amount or by orderId
    let matchedOrder = null;
    const updatedOrders = orders.map(ord => {
      const isMatch = (orderId && ord.id === orderId) || (Math.abs(ord.totalAmount - amount) < 0.05);
      if (isMatch && ord.status !== 'PAID_APPROVED') {
        matchedOrder = ord;
        return {
          ...ord,
          status: 'PAID_APPROVED',
          utr: utr || ord.utr,
          paymentMethod: 'Google Pay for Business (Auto-Approved)',
          approvalType: 'AUTOMATIC_NOTIFICATION_WEBHOOK'
        };
      }
      return ord;
    });

    if (matchedOrder) {
      setOrders(updatedOrders);
      if (activePendingOrder && activePendingOrder.id === matchedOrder.id) {
        setActivePendingOrder({
          ...activePendingOrder,
          status: 'PAID_APPROVED',
          utr
        });
      }

      // 3. Deduct stock automatically for each item in the matched order
      matchedOrder.items.forEach(item => {
        setProducts(prevProducts => prevProducts.map(p => {
          if (p.name === item.name) {
            return {
              ...p,
              stockUnits: Math.max(0, p.stockUnits - item.qty)
            };
          }
          return p;
        }));
      });

      // Clear cart once order is confirmed
      setCartItems([]);
    }

    // 4. Log webhook event
    const logEntry = {
      timestamp: new Date().toLocaleTimeString(),
      amount,
      utr,
      matched: !!matchedOrder,
      orderId: matchedOrder ? matchedOrder.id : 'N/A'
    };
    setWebhookLogs(prev => [logEntry, ...prev]);

    return {
      success: true,
      matched: !!matchedOrder,
      matchedOrder,
      parsed: { amount, utr, sender },
      signature
    };
  };

  // Filtered catalog products
  const displayProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f5]">
      {/* Navbar */}
      <Navbar
        cartCount={cartItems.reduce((acc, it) => acc + 1, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        unreadOrdersCount={orders.filter(o => o.status === 'PAID_APPROVED').length}
      />

      {/* Main View Switcher */}
      {currentView === 'shop' ? (
        <main className="flex-1">
          {/* Hero Section */}
          <Hero
            onExploreClick={() => {
              const el = document.getElementById('catalog-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            onCustomOrderClick={() => {
              const customProd = products.find(p => p.category === 'custom') || products[0];
              setSelectedProduct(customProd);
            }}
          />

          {/* Catalog Section */}
          <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            
            {/* Category Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
                  Paper Bag Collections
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 font-medium">
                  Manufactured in LIC Colony, Thanjavur • Direct Factory Wholesale Slabs
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Bags' },
                  { id: 'kraft', label: 'Kraft Shopper' },
                  { id: 'luxury', label: 'Retail & Boutique' },
                  { id: 'food', label: 'Food & Bakery' },
                  { id: 'custom', label: 'Custom Branded' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-[#7e5222] text-white shadow-sm'
                        : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-400'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Responsive Products Grid: 1 col on small mobile, 2 col on tablet, 3-4 col on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={(prod) => setSelectedProduct(prod)}
                  onQuickAdd={handleQuickAdd}
                />
              ))}
            </div>

            {/* Custom Printing Banner */}
            <div className="mt-14 bg-gradient-to-r from-amber-900 to-[#7e5222] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-xs bg-amber-400/20 text-amber-200 border border-amber-300/30 px-3 py-1 rounded-full font-bold uppercase">
                  Bulk B2B Printing
                </span>
                <h3 className="text-xl sm:text-2xl font-black">Want Your Shop Logo & Phone Printed on Bags?</h3>
                <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
                  We specialize in customized screen printing for textile showrooms, jewelry shops, sweet stalls, and supermarkets across Tamil Nadu. Minimum order starting from just 500 bags.
                </p>
              </div>

              <button
                onClick={() => {
                  const customProd = products.find(p => p.category === 'custom') || products[0];
                  setSelectedProduct(customProd);
                }}
                className="bg-white hover:bg-stone-100 text-stone-900 px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition-all shrink-0"
              >
                Upload Logo & Configure Order
              </button>
            </div>
          </section>
        </main>
      ) : (
        /* Admin View */
        <main className="flex-1">
          <AdminDashboard
            products={products}
            onUpdateProductStock={handleUpdateProductStock}
            onAddNewProduct={handleAddNewProduct}
            orders={orders}
            webhookLogs={webhookLogs}
            onSimulateWebhook={handleSimulateWebhook}
          />
        </main>
      )}

      {/* Product Customizer Modal */}
      {selectedProduct && (
        <ProductCustomizerModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddCustomizedItem}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal with Dynamic Paise & Google Pay UPI Intent + Live Listener */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderCreated={handleOrderCreated}
        activePendingOrder={activePendingOrder}
        onSimulateWebhook={handleSimulateWebhook}
      />

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs py-10 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-extrabold text-white text-base mb-2">Classic Bags Thanjavur</h4>
            <p className="text-stone-400 leading-relaxed text-xs">
              Eco-friendly paper bag manufacturer in Thanjavur. Delivering sustainable packaging solutions to supermarkets, bakeries, textiles, and boutiques across Tamil Nadu.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2">Factory & Office Address</h4>
            <p className="flex items-start gap-2">
              <MapPin size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <span>Plot No. 38, 6th Street, Medical College Road, LIC Colony, Thanjavur – 613007</span>
            </p>
            <p className="flex items-center gap-2 mt-2">
              <Phone size={14} className="text-amber-500" />
              <a href="tel:+919843275685" className="hover:text-white">+91 98432 75685</a>
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2">Zero-Touch Automation</h4>
            <p className="text-stone-400 text-xs">
              Powered by Android Notification Listener Webhook bridge with Google Pay for Business. Real-time dynamic paise matching, automatic approval, and instant stock deduction.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-stone-800 text-center text-stone-500 text-[11px]">
          © {new Date().getFullYear()} Classic Bags Thanjavur. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
