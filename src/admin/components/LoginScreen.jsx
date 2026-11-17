import React, { useState } from 'react';
import { Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { STORE_SETTINGS } from '../../shared/data/initialData';
import { Storage } from '../../shared/services/storage';

export default function LoginScreen({ settings, onAuthenticated }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate a brief auth delay
    setTimeout(() => {
      const storedSettings = Storage.getSettings();
      const correctPin = (storedSettings?.adminPin) || STORE_SETTINGS.adminPin;

      if (pin === correctPin) {
        onAuthenticated();
      } else {
        setError('Invalid PIN. Please try again.');
        setPin('');
      }
      setIsLoading(false);
    }, 400);
  };

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center p-4">
      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fadeIn">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600" />

          <div className="px-8 py-10">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
                <ShieldCheck className="w-8 h-8 text-indigo-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">
                {settings?.storeName || 'Classic Bags'}
              </h1>
              <p className="text-sm font-medium text-indigo-600 mt-1 tracking-wide uppercase">
                Admin Dashboard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Enter Admin PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4.5 h-4.5 text-slate-400" />
                  </div>
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={handlePinChange}
                    placeholder="••••"
                    maxLength={4}
                    autoFocus
                    className={`w-full pl-10 pr-12 py-3 text-center text-2xl tracking-[0.5em] font-mono
                      border rounded-xl transition-all duration-200
                      ${error
                        ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200'
                        : 'border-slate-200 bg-slate-50 focus:border-indigo-400 focus:ring-indigo-200'
                      }
                      focus:ring-2 focus:outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2 animate-fadeIn">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={pin.length < 4 || isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700
                  text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25
                  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 text-center">
            <p className="text-xs text-slate-400">
              Factory Admin Portal • Thanjavur
            </p>
          </div>
        </div>

        {/* Security notice */}
        <p className="text-center text-xs text-slate-400 mt-6">
          🔒 Secure administrative access only
        </p>
      </div>
    </div>
  );
}
