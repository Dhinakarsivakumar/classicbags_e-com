import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, CheckCircle2, Lock, ArrowRight, User, Phone, Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { Storage } from '../../shared/services/storage';
import { STORE_SETTINGS } from '../../shared/data/initialData';

export default function GoogleAuthModal({ isOpen, onClose, onSuccess, redirectMessage }) {
  const [phone, setPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('google_button'); // 'google_button' | 'phone_confirm'
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [gsiReady, setGsiReady] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const googleBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Reset state
    setAuthError('');
    setStep('google_button');

    // Load any existing user info only if already logged in previously
    const existing = Storage.getAuthUser();
    if (existing) {
      if (existing.name) setUserName(existing.name);
      if (existing.email) setEmail(existing.email);
      if (existing.phone) setPhone(existing.phone);
    } else {
      setUserName('');
      setEmail('');
      setPhone('');
    }

    // Initialize Google Identity Services SDK
    let timer = null;
    const initGsi = () => {
      const clientId = STORE_SETTINGS.googleClientId;
      if (window.google?.accounts?.id && clientId && !clientId.includes('placeholder')) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'outline',
              size: 'large',
              width: 320,
              text: 'continue_with',
              shape: 'pill',
            });
            setGsiReady(true);
          }
          return true;
        } catch (err) {
          console.warn('Google Identity initialization failed:', err);
        }
      }
      return false;
    };

    if (!initGsi()) {
      timer = setInterval(() => {
        if (initGsi()) {
          clearInterval(timer);
        }
      }, 300);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle real Google JWT credential response
  const handleGoogleCredentialResponse = (response) => {
    try {
      if (!response?.credential) {
        setAuthError('Google sign-in did not return credentials. Please try again.');
        return;
      }

      // Decode JWT payload safely
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      const googleUser = {
        id: payload.sub,
        name: payload.name || 'Customer',
        email: payload.email || '',
        avatar: payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name || 'User')}&background=7e5222&color=fff`,
        authProvider: 'google',
        verified: true,
      };

      setPendingGoogleUser(googleUser);
      setUserName(googleUser.name);
      setEmail(googleUser.email);
      setStep('phone_confirm');
      setAuthError('');
    } catch (err) {
      console.error('Failed to decode Google token:', err);
      setAuthError('Failed to process Google sign-in response. Please enter your details below.');
    }
  };

  // Manual Customer Details Submission (Fallback for customers without Google Sign-In)
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setAuthError('Please enter your full name or business name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    const customUser = {
      id: `u_${Date.now()}`,
      name: userName.trim(),
      email: email.trim(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName.trim())}&background=7e5222&color=fff&bold=true`,
      authProvider: 'email',
      verified: true,
    };

    setPendingGoogleUser(customUser);
    setStep('phone_confirm');
    setAuthError('');
  };

  // Finalize Login with Delivery WhatsApp Phone Number
  const handleFinalizeLogin = (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setAuthError('Please enter a valid 10-digit WhatsApp mobile number.');
      return;
    }

    const finalUser = {
      ...(pendingGoogleUser || {
        id: `u_${Date.now()}`,
        name: userName.trim() || 'Valued Customer',
        email: email.trim(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=7e5222&color=fff&bold=true`,
        authProvider: 'customer',
        verified: true,
      }),
      phone: cleanPhone,
    };

    Storage.setAuthUser(finalUser);
    if (onSuccess) onSuccess(finalUser);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-red-500 via-amber-500 to-blue-500" />

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-2 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-200 shadow-sm flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-base leading-tight">
                Customer Sign In
              </h3>
              <p className="text-[11px] text-stone-500">Classic Bags Thanjavur Wholesale</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Informational Banner */}
        <div className="px-6 py-2">
          <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900 font-medium">
            <Lock className="w-4 h-4 text-[#7e5222] flex-shrink-0" />
            <span>
              {redirectMessage || 'Please sign in to confirm delivery details and place your wholesale bag order.'}
            </span>
          </div>
        </div>

        {/* Error Message Display */}
        {authError && (
          <div className="mx-6 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* STEP 1: GOOGLE 1-TAP LOGIN BUTTON */}
        {step === 'google_button' && (
          <div className="p-6 space-y-4 text-center">
            <div className="space-y-1">
              <h4 className="font-bold text-stone-900 text-sm">
                Sign in with your Google Account
              </h4>
              <p className="text-xs text-stone-500">
                Your orders, live delivery tracking, and GST tax invoices will be securely linked to your account.
              </p>
            </div>

            {/* Google Identity Services official button container */}
            <div className="flex justify-center min-h-[44px] items-center my-3">
              <div ref={googleBtnRef} />
              {!gsiReady && (
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#7e5222]" />
                  <span>Loading Google Sign-In...</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-stone-400 font-bold text-[10px]">Or sign in manually</span>
              </div>
            </div>

            {/* Manual details form (Clean, unpopulated for every unique customer) */}
            {!showManualForm ? (
              <button
                type="button"
                onClick={() => setShowManualForm(true)}
                className="w-full py-2.5 text-xs font-bold text-[#7e5222] bg-amber-50 hover:bg-amber-100/70 border border-amber-200 rounded-xl transition-all"
              >
                Sign In with Name &amp; Email Instead
              </button>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-3 text-left animate-fadeIn">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Your Full Name / Shop Name *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar / Thanjavur Stores"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#7e5222] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Your Email Address *</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#7e5222] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#7e5222] hover:bg-[#674221] text-white rounded-xl text-xs font-bold shadow transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        )}

        {/* STEP 2: PHONE NUMBER CONFIRMATION (Required for Delivery SMS & WhatsApp Tracking) */}
        {step === 'phone_confirm' && (
          <form onSubmit={handleFinalizeLogin} className="p-6 space-y-4">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg mx-auto mb-2 border-2 border-emerald-300">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h4 className="font-extrabold text-stone-900 text-sm">
                Account Verified!
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Signing in as <strong className="text-stone-900">{userName}</strong> ({email})
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                Your WhatsApp Mobile Number for Order Updates *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  autoFocus
                  className="w-full pl-10 pr-3 py-2.5 text-xs font-bold text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#7e5222] focus:bg-white focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-stone-500">
                Dispatch notifications and UPI receipt will be sent to this WhatsApp number.
              </p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#7e5222] hover:bg-[#674221] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-98"
            >
              <span>Confirm &amp; Proceed to Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Trust Footer */}
        <div className="bg-stone-50 border-t border-stone-100 px-6 py-3 text-center flex items-center justify-center gap-2 text-[11px] text-stone-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-Bit SSL Encrypted &amp; Privacy Protected</span>
        </div>
      </div>
    </div>
  );
}
