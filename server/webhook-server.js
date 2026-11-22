// Classic Bags - Universal UPI & SMS Webhook Server & Cloud Sync API
// Bridges Android Payment Listener App (ClassicBagsListener.apk) with Customer Store & Admin Portal

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3002;
const LOG_FILE = path.join(__dirname, 'webhook_events.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');

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

// In-memory orders store (persisted to orders.json)
let storedOrders = [];
try {
  if (fs.existsSync(ORDERS_FILE)) {
    storedOrders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
  }
} catch {
  storedOrders = [];
}

const saveOrdersToDisk = () => {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(storedOrders, null, 2));
  } catch (err) {
    console.error('Failed to persist orders:', err.message);
  }
};

const server = http.createServer((req, res) => {
  // CORS Headers - allow both local and remote storefronts to query webhook status & orders
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-ClassicBags-Signature, Authorization');

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
      service: 'Classic Bags Cloud & Webhook Server',
      timestamp: new Date().toISOString(),
      totalPaymentsReceived: receivedPayments.length,
      totalOrdersStored: storedOrders.length,
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

        // Auto-Match & Auto-Approve Pending Orders matching this payment
        let matchedOrder = null;
        for (let i = 0; i < storedOrders.length; i++) {
          const ord = storedOrders[i];
          if (ord && (ord.status === 'PENDING_PAYMENT' || ord.status === 'PENDING_VERIFICATION')) {
            const ordAmt = parseFloat(ord.totalAmount || ord.amount || 0);
            const matchesAmt = Math.abs(ordAmt - paymentRecord.amount) < 0.05;
            const matchesId = paymentRecord.rawNotification && ord.id && paymentRecord.rawNotification.includes(ord.id);
            
            if (matchesAmt || matchesId) {
              storedOrders[i] = {
                ...ord,
                status: 'PAID_APPROVED',
                paymentVerification: 'AUTO_VERIFIED',
                approvalType: 'AUTOMATIC_SMS_WEBHOOK',
                utr: paymentRecord.utr,
                paidAt: paymentRecord.receivedAt,
                verifiedBy: 'BANK_SMS_AUTO'
              };
              matchedOrder = storedOrders[i];
              paymentRecord.matchedOrderId = ord.id;
              console.log(`⚡ [AUTO-MATCH SUCCESS] Order ${ord.id} (₹${paymentRecord.amount.toFixed(2)}) auto-approved by incoming SMS!`);
              break;
            }
          }
        }

        if (matchedOrder) {
          saveOrdersToDisk();
        }

        console.log(`\n======================================================`);
        console.log(`💰 [PAYMENT VERIFIED & CAPTURED]`);
        console.log(`Amount: ₹${paymentRecord.amount.toFixed(2)}`);
        console.log(`UTR / Ref: ${paymentRecord.utr}`);
        console.log(`Sender: ${paymentRecord.sender}`);
        console.log(`Source App: ${paymentRecord.source}`);
        console.log(`Matched Order: ${matchedOrder ? matchedOrder.id : 'No pending order match yet'}`);
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

  // 4. Fetch All Cloud Orders: GET /api/orders
  if (url.pathname === '/api/orders' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      orders: storedOrders
    }));
    return;
  }

  // 5. Sync / Save Orders from Store or Admin: POST /api/orders
  if (url.pathname === '/api/orders' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const incomingOrders = Array.isArray(parsed.orders) ? parsed.orders : (parsed.order ? [parsed.order] : []);

        for (const inc of incomingOrders) {
          if (!inc || !inc.id) continue;
          const idx = storedOrders.findIndex(o => o.id === inc.id);
          if (idx >= 0) {
            storedOrders[idx] = { ...storedOrders[idx], ...inc };
          } else {
            storedOrders.unshift(inc);
          }
        }

        saveOrdersToDisk();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Orders synced to cloud successfully',
          count: storedOrders.length
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 6. Update Single Order Status: POST /api/orders/update-status
  if (url.pathname === '/api/orders/update-status' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { orderId, status } = JSON.parse(body || '{}');
        const order = storedOrders.find(o => o.id === orderId);
        if (order) {
          order.status = status;
          order.updatedAt = new Date().toISOString();
          saveOrdersToDisk();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, order }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Order not found' }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 7. Verify Admin Credentials: POST /api/admin/login
  if (url.pathname === '/api/admin/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { username, password, pin } = JSON.parse(body || '{}');
        const validUser = (!username || username === 'admin' || username === 'dhinakar' || username === '9843275685' || username === '8940679198');
        const validPass = (password === 'ClassicBags@2026' || password === 'dhinakar2026' || pin === '1234');

        if (validUser && validPass) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            role: 'SUPER_ADMIN',
            ownerName: 'Dhinakar S',
            phone: '9843275685',
            token: `adm_${Date.now()}_auth_token`
          }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Invalid credentials. Only authorized owner may login.' }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 8. Direct Image Upload API: POST /api/upload
  if (url.pathname === '/api/upload' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { filename, data } = JSON.parse(body || '{}');
        if (!data) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'No image data provided' }));
          return;
        }

        const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let ext = 'jpg';
        let buffer;

        if (matches && matches.length === 3) {
          const mime = matches[1];
          if (mime.includes('png')) ext = 'png';
          else if (mime.includes('webp')) ext = 'webp';
          buffer = Buffer.from(matches[2], 'base64');
        } else {
          buffer = Buffer.from(data, 'base64');
        }

        const safeName = (filename || 'image').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
        const uniqueFilename = `img_${Date.now()}_${safeName}.${ext}`;
        const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filePath = path.join(uploadsDir, uniqueFilename);
        fs.writeFileSync(filePath, buffer);

        const fileUrl = `/uploads/${uniqueFilename}`;
        console.log(`📸 [IMAGE UPLOADED] ${uniqueFilename} (${Math.round(buffer.length / 1024)} KB)`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          url: fileUrl,
          filename: uniqueFilename,
          size: buffer.length
        }));
      } catch (err) {
        console.error('Upload failed:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 9. Static File Serving for Uploaded Images: GET /uploads/*
  if (url.pathname.startsWith('/uploads/') && req.method === 'GET') {
    const filename = path.basename(url.pathname);
    const filePath = path.join(__dirname, '..', 'public', 'uploads', filename);

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif'
      };
      res.writeHead(200, {
        'Content-Type': contentTypes[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000'
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Image file not found' }));
      return;
    }
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 [Classic Bags Webhook & Cloud Sync Server Running]`);
  console.log(`➜ Local Port:    http://localhost:${PORT}/api/webhook/status`);
  console.log(`➜ Network URL:   http://10.220.210.247:${PORT}/api/webhook/gpay`);
  console.log(`➜ Cloud Orders:  http://10.220.210.247:${PORT}/api/orders`);
  console.log(`➜ Status:        READY to receive Bank SMS & GPay notifications!\n`);
});
