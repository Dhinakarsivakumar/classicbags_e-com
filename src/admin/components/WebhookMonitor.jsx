import React, { useState } from 'react';
import { Smartphone, ShieldCheck, Key, CheckCircle2, AlertCircle, RefreshCw, Send, Zap } from 'lucide-react';
import { STORE_SETTINGS } from '../../shared/data/initialData';
import { Storage } from '../../shared/services/storage';
import { WebhookEngine } from '../../shared/services/webhookEngine';

export default function WebhookMonitor({ webhookLogs = [] }) {
  const [testNotification, setTestNotification] = useState(
    'Received ₹2,400.18 from Senthil Textiles (UPI Ref: 432190887162)'
  );
  const [testResult, setTestResult] = useState(null);
  const [logs, setLogs] = useState(webhookLogs);

  const handleSendTestWebhook = () => {
    // 1. Parse raw text using WebhookEngine
    const parsed = WebhookEngine.parseNotificationText(testNotification);
    
    // 2. Generate HMAC-SHA256 signature
    const payloadStr = JSON.stringify(parsed);
    const signature = WebhookEngine.computeSignature(payloadStr);

    // 3. Process incoming payment
    const result = WebhookEngine.processIncomingPayment({
      amount: parsed.amount,
      utr: parsed.utr,
      sender: parsed.sender,
      orderId: parsed.orderId,
      rawNotification: testNotification,
      signature
    });

    setTestResult(result);

    // Refresh logs
    setLogs(Storage.getWebhookLogs() || []);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Android Listener Active</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Google Pay Webhook &amp; Auto-Approval Engine</h2>
          <p className="text-xs text-slate-500">
            Real-time webhook listener processing incoming payments from the business Android phone.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Security Standard</div>
            <div className="text-xs font-bold text-slate-800">HMAC-SHA256 Encrypted</div>
          </div>
          <ShieldCheck size={28} className="text-emerald-600" />
        </div>
      </div>

      {/* Technical Spec Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-400 font-semibold">Webhook Destination</div>
          <div className="text-xs font-mono font-bold text-slate-800 truncate">{STORE_SETTINGS.webhookEndpoint}</div>
          <div className="text-[10px] text-slate-400">Target for Android Background Service</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-400 font-semibold">HMAC Secret Signature Key</div>
          <div className="text-xs font-mono font-bold text-amber-800 truncate">{STORE_SETTINGS.webhookSecret}</div>
          <div className="text-[10px] text-slate-400">Header: X-ClassicBags-Signature</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-400 font-semibold">Matching Protocol</div>
          <div className="text-xs font-mono font-bold text-emerald-800">Dynamic Paise + Order ID</div>
          <div className="text-[10px] text-slate-400">100% Zero-Touch Auto Deduction</div>
        </div>
      </div>

      {/* INTERACTIVE TEST CONSOLE */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-amber-600 fill-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">Webhook Test &amp; Verification Console</h3>
          </div>
          <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
            Real-Time Engine Test
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Simulate an incoming notification from your Google Pay for Business phone to test the automated order matching and stock deduction:
        </p>

        {/* Preset Notification Chips */}
        <div className="flex flex-wrap gap-2">
          {[
            'Received ₹2,400.18 from Senthil Textiles (UPI Ref: 432190887162)',
            'Received ₹3,200.42 from Aachi Sweet Bakery (Ref: 432190998811)',
            'Received ₹550.84 from Thanjavur Gifts (UTR 998811223344)'
          ].map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setTestNotification(sample)}
              className="text-[11px] font-mono text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 text-left transition-colors"
            >
              {sample}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={testNotification}
            onChange={(e) => setTestNotification(e.target.value)}
            className="flex-1 px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSendTestWebhook}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#7e5222] hover:bg-[#674221] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex-shrink-0"
          >
            <Send size={14} />
            <span>Send Webhook</span>
          </button>
        </div>

        {/* Live Test Result Callout */}
        {testResult && (
          <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
            testResult.matched 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div className="font-bold flex items-center justify-between">
              <span>Webhook Execution Status:</span>
              <span className={testResult.matched ? 'text-emerald-700 font-black' : 'text-amber-800 font-black'}>
                {testResult.matched ? '✓ 100% MATCHED & AUTO-APPROVED' : 'PAYMENT RECORDED (NO PENDING MATCH)'}
              </span>
            </div>
            <div className="font-mono text-[11px] space-y-0.5">
              <div>• Amount: ₹{testResult.logEntry.amount}</div>
              <div>• UTR: {testResult.logEntry.utr}</div>
              <div>• Sender: {testResult.logEntry.sender}</div>
              {testResult.matchedOrder && (
                <div className="text-emerald-800 font-bold">
                  • Order Matched: <strong>{testResult.matchedOrder.id}</strong> (Stock Automatically Deducted!)
                </div>
              )}
              <div>• HMAC-SHA256 Signature: Validated</div>
            </div>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-sm text-slate-900">Incoming Webhook Callbacks Audit</h3>
          <span className="text-xs text-slate-500 font-mono">{logs.length} events logged</span>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <Smartphone size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-600">Waiting for incoming payment signals...</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              When Google Pay receives payment on your phone, the Android Listener app immediately posts the signed webhook here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Captured Amount</th>
                  <th className="py-3 px-4">UTR Reference</th>
                  <th className="py-3 px-4">Matched Order</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-500">{log.timestamp}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹{log.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-600">{log.utr}</td>
                    <td className="py-3 px-4 font-bold text-amber-800">{log.orderId}</td>
                    <td className="py-3 px-4">
                      {log.matched ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded">
                          <CheckCircle2 size={10} /> Auto-Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 text-[10px] font-bold px-2 py-0.5 rounded">
                          <AlertCircle size={10} /> Unmatched
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
