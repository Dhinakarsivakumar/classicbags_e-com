import React from 'react';
import { AlertCircle, RefreshCw, Trash2, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Classic Bags UI Caught Error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('cb_products');
      localStorage.removeItem('cb_cart');
    } catch { /* ignore */ }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fbf7ee] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-[#7e5222] flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle size={32} />
            </div>

            <h2 className="text-xl font-black text-stone-900">Classic Bags Thanjavur</h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              பக்கத்தை ஏற்றுவதில் தற்காலிகக் கோளாறு ஏற்பட்டது. கீழே உள்ள பட்டனை அழுத்தி பக்கத்தை எளிதாகப் புதுப்பித்துக் கொள்ளலாம்.
            </p>

            {this.state.error && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] font-mono text-left text-stone-600 overflow-x-auto max-h-24">
                {String(this.state.error?.message || this.state.error)}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-[#7e5222] hover:bg-[#674221] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <RefreshCw size={14} />
                <span>Reload Store (பக்கத்தைப் புதுப்பி)</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold border border-stone-200 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 size={13} className="text-stone-500" />
                <span>Clear Cache &amp; Restore Clean Slate</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
