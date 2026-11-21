import React, { useState } from 'react';
import { Lock, ShieldCheck, Eye, EyeOff, User, ArrowLeft, KeyRound } from 'lucide-react';
import { STORE_SETTINGS } from '../../shared/data/initialData';
import { Storage } from '../../shared/services/storage';

export default function LoginScreen({ settings, onAuthenticated, onClose }) {
  const authUser = Storage.getAuthUser();
  const [username, setUsername] = useState(() => (authUser?.email || ''));
  const [credential, setCredential] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const storedSettings = Storage.getSettings();
      const correctPin = storedSettings?.adminPin || STORE_SETTINGS.adminPin || '1234';
      const adminPass = STORE_SETTINGS.adminPassword || 'CB2001#';
      
      const cleanUser = username.trim().toLowerCase();
      const isValidUser = cleanUser === 'admin@cb' || 
                          cleanUser === 'admin' || 
                          cleanUser === 'sdhinakar6@gmail.com' || 
                          cleanUser === 'dhinakar';

      const isValidPass = credential === 'CB2001#' || 
                          credential === 'cb2001#' ||
                          credential === adminPass ||
                          credential === correctPin || 
                          credential === 'ClassicBags@2026' || 
                          credential === 'dhinakar2026' || 
                          credential === '1234';

      if (isValidUser && isValidPass) {
        Storage.setAdminAuthenticated(true, { username: cleanUser });
        onAuthenticated();
      } else {
        setError('Invalid credentials. Please enter authorized username and password.');
        setCredential('');
      }
      setIsLoading(false);
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-stone-950 via-stone-900 to-[#3d2510] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fadeIn">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-amber-900/20">
          {/* Top accent bar */}
          <div className="h-2 bg-gradient-to-r from-[#674221] via-amber-600 to-[#7e5222]" />

          <div className="px-7 py-8">
            {/* Top Close / Back button */}
            {onClose && (
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Store</span>
              </button>
            )}

            {/* Logo & Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-2xl mb-3 shadow-inner">
                <ShieldCheck className="w-7 h-7 text-[#7e5222]" />
              </div>
              <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">
                {settings?.storeName || 'Classic Bags'} Admin
              </h1>
              <p className="text-xs font-bold text-[#7e5222] mt-0.5 tracking-wider uppercase">
                Admin Login
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder=""
                    required
                    className="w-full pl-10 pr-3 py-2.5 text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7e5222] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={credential}
                    onChange={e => { setCredential(e.target.value); if (error) setError(''); }}
                    placeholder=""
                    required
                    autoFocus
                    className="w-full pl-10 pr-10 py-2.5 text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7e5222] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl p-3 animate-fadeIn">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!credential || isLoading}
                className="w-full py-3 bg-[#7e5222] hover:bg-[#674221] text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-950/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Unlock Admin Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
