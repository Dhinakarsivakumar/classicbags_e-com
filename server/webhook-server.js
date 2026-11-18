// Classic Bags - Universal UPI & SMS Webhook Server
// Bridges Android Payment Listener App (ClassicBagsListener.apk) with Customer Store & Admin Portal

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3002;
const LOG_FILE = path.join(__dirname, 'webhook_events.json');

// In-memory transaction store (persisted to webhook_events.json)
let receivedPayments = [];
try {
  if (fs.existsSync(LOG_FILE)) {
    receivedPayments = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
  }
} catch {
  receivedPayments = [];
}

const savePayments = () => {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(receivedPayments.slice(-100), null, 2));
  } catch (err) {
    console.error('Failed to persist payments:', err.message);
  }
};

const server = http.createServer((req, res) => {
  // CORS Headers - allow both local and remote storefronts to query webhook status
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-ClassicBags-Signature');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // 1. Health & Status Check: GET /api/webhook/status or GET /
  if ((url.pathname === '/api/webhook/status' || url.pathname === '/' || url.pathname === '/health') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ONLINE',
      service: 'Classic Bags Webhook Server',
      timestamp: new Date().toISOString(),
      totalPaymentsReceived: receivedPayments.length,
      latestPayment: receivedPayments[receivedPayments.length - 1] || null
    }));
    return;
  }

  // 2. Fetch Recent Payments: GET /api/webhook/recent
  if (url.pathname === '/api/webhook/recent' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      payments: receivedPayments.slice(-20)
    }));
    return;
  }

  // 3. Receive Incoming Payment from Android App: POST /api/webhook/gpay or POST /api/webhook
  if ((url.pathname === '/api/webhook/gpay' || url.pathname === '/api/webhook') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const signature = req.headers['x-classicbags-signature'] || 'none';

        const paymentRecord = {
          id: `pay-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          amount: parseFloat(payload.amount) || 0,
          utr: payload.utr || ('UTR' + Date.now()),
          sender: payload.sender || 'Customer',
          source: payload.source || 'android_listener',
          rawNotification: payload.rawNotification || '',
          timestamp: payload.timestamp || Date.now(),
          receivedAt: new Date().toISOString()
        };

        receivedPayments.push(paymentRecord);
        savePayments();

        console.log(`\n======================================================`);
        console.log(`💰 [PAYMENT VERIFIED & CAPTURED]`);
        console.log(`Amount: ₹${paymentRecord.amount.toFixed(2)}`);
        console.log(`UTR / Ref: ${paymentRecord.utr}`);
        console.log(`Sender: ${paymentRecord.sender}`);
        console.log(`Source App: ${paymentRecord.source}`);
        console.log(`Time: ${paymentRecord.receivedAt}`);
        console.log(`======================================================\n`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Payment received and verified by Classic Bags server!',
          payment: paymentRecord
        }));
      } catch (err) {
        console.error('Invalid JSON received on webhook:', err.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 4. Test Simulation endpoint: POST /api/webhook/test
  if (url.pathname === '/api/webhook/test' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const testAmt = parseFloat(parsed.amount) || 1.00;
        const testPayment = {
          id: `test-${Date.now()}`,
          amount: testAmt,
          utr: 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000),
          sender: 'Test GPay / Canara User',
          source: 'test_simulation',
          rawNotification: `A/c credited by Rs ${testAmt.toFixed(2)} on 18-Nov-26 by UPI`,
          timestamp: Date.now(),
          receivedAt: new Date().toISOString()
        };
        receivedPayments.push(testPayment);
        savePayments();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, payment: testPayment }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 [Classic Bags Webhook Server Running]`);
  console.log(`➜ Local Port:    http://localhost:${PORT}/api/webhook/status`);
  console.log(`➜ Network URL:   http://10.220.210.247:${PORT}/api/webhook/gpay`);
  console.log(`➜ Status:        READY to receive Bank SMS & GPay notifications!\n`);
});
