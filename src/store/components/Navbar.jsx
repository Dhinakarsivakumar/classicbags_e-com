import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Phone, MapPin, Leaf, Heart, Settings, User, LogOut, ShieldCheck } from 'lucide-react';
import { STORE_SETTINGS } from '../../shared/data/initialData';
import { Storage } from '../../shared/services/storage';

export default function Navbar({ 
  cartItemCount = 0, 
  onCartOpen, 
  wishlistCount = 0, 
  onWishlistOpen,
  orderCount = 0,
  onSettingsOpen,
  authUser,
  onOpenAuth,
  onLogout,
  onOpenAdmin
}) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAdmin = (authUser && Storage.isAdminEmail(authUser.email)) || Storage.isAdminAuthenticated();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Micro Top Bar */}
      <div className="bg-[#674221] text-amber-50 text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-1.5 truncate">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{STORE_SETTINGS.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Leaf className="w-3 h-3 text-green-300" />
            <span className="font-medium">100% Eco-Certified Bags</span>
          </div>
          <a
            href={`tel:${STORE_SETTINGS.phone}`}
            className="flex items-center gap-1.5 hover:text-amber-200 transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span className="font-medium">{STORE_SETTINGS.phone}</span>
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-[#fbf7ee]/90 backdrop-blur-xl border-b border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7e5222] to-[#674221] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#674221] tracking-tight leading-none">
                  CLASSIC BAGS
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold text-[#7e5222] bg-amber-100 px-1.5 py-0.5 rounded">
                    THANJAVUR
                  </span>
                  <span className="text-[10px] text-stone-400">Since 2018</span>
                </div>
              </div>
            </a>

            {/* Right: Quick Links + Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="#catalog"
                className="hidden lg:block text-sm font-medium text-stone-600 hover:text-[#7e5222] px-3 py-1.5 rounded-lg transition-colors"
              >
                Products
              </a>

              {/* Wishlist Button */}
              <button
                onClick={onWishlistOpen}
                className="relative p-2.5 text-stone-700 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all duration-200"
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-scaleIn">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Google Login / User Profile Dropdown */}
              {authUser ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 bg-white hover:bg-amber-50 border border-stone-200 rounded-full transition-all shadow-sm"
                  >
                    {authUser.avatar ? (
                      <img
                        src={authUser.avatar}
                        alt={authUser.name}
                        className="w-7 h-7 rounded-full object-cover border border-amber-600/30"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.name || 'User')}&background=7e5222&color=fff`;
                        }}
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#7e5222] text-white flex items-center justify-center font-bold text-xs">
                        {(authUser.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-bold text-stone-800 hidden md:inline truncate max-w-[100px]">
                      {authUser.name?.split(' ')[0] || 'Account'}
                    </span>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 text-xs z-50 animate-fadeIn">
                      <div className="p-2.5 border-b border-stone-100 mb-1">
                        <p className="font-bold text-stone-900 truncate">{authUser.name}</p>
                        <p className="text-[11px] text-stone-500 truncate">{authUser.email}</p>
                        {authUser.phone && (
                          <p className="text-[10px] text-amber-800 font-semibold mt-0.5">{authUser.phone}</p>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onSettingsOpen) onSettingsOpen();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-stone-700 hover:bg-amber-50 hover:text-[#7e5222] rounded-xl font-medium transition-colors text-left"
                      >
                        <Settings className="w-4 h-4 text-[#7e5222]" />
                        <span>My Orders &amp; Addresses</span>
                      </button>

                      {isAdmin && onOpenAdmin && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenAdmin();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 bg-amber-100/60 text-amber-900 hover:bg-amber-100 rounded-xl font-bold transition-colors text-left my-1"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-700" />
                          <span>Admin Control Panel</span>
                        </button>
                      )}

                      <div className="border-t border-stone-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            if (onLogout) onLogout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-amber-50 text-stone-800 border border-stone-200 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95"
                  title="Sign in with Google"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* Settings / My Orders Button */}
              <button
                onClick={onSettingsOpen}
                className="relative flex items-center gap-1.5 px-3 py-2 text-stone-700 hover:text-[#7e5222] hover:bg-amber-100/60 rounded-full transition-all duration-200 border border-stone-200/80"
                title="Settings & Orders"
              >
                <Settings className="w-4 h-4 text-[#7e5222]" />
                <span className="text-xs font-bold hidden sm:inline">Settings</span>
                {orderCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                )}
              </button>

              {/* Cart Button */}
              <button
                onClick={onCartOpen}
                className="relative flex items-center gap-2 px-4 py-2 bg-[#7e5222] hover:bg-[#674221] text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 ml-1"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="text-xs font-bold hidden sm:inline">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-fadeIn">
                    {cartItemCount > 9999 ? '9k+' : cartItemCount.toLocaleString('en-IN')}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
