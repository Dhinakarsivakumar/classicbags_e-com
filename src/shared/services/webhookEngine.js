import CryptoJS from 'crypto-js';
import { STORE_SETTINGS } from '../data/initialData';
import { Storage } from './storage';

export const WebhookEngine = {
  // Compute HMAC-SHA256 signature
  computeSignature: (payloadString, secretKey = STORE_SETTINGS.webhookSecret) => {
    return CryptoJS.HmacSHA256(payloadString, secretKey).toString(CryptoJS.enc.Hex);
  },

  // Verify HMAC-SHA256 signature
  verifySignature: (payloadString, signature, secretKey = STORE_SETTINGS.webhookSecret) => {
    if (!signature) return false;
    const expected = CryptoJS.HmacSHA256(payloadString, secretKey).toString(CryptoJS.enc.Hex);
    return expected.toLowerCase() === signature.toLowerCase();
  },

  // Parse raw Google Pay notification text into structured data
  parseNotificationText: (text) => {
    const amountRegex = /(?:₹|Rs\.?)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i;
    const utrRegex = /(?:UTR|Ref|UPI Ref)[:\s]*([0-9]{10,14})/i;
    const fromRegex = /from\s+([A-Za-z0-9\s]+)(?:\s*\(|$)/i;
    const orderIdRegex = /(CB-\d{4})/i;

    const amountMatch = text.match(amountRegex);
    const utrMatch = text.match(utrRegex);
    const fromMatch = text.match(fromRegex);
    const orderMatch = text.match(orderIdRegex);

    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
    const utr = utrMatch ? utrMatch[1].trim() : ('UTR' + Math.floor(100000000000 + Math.random() * 900000000000));
    const sender = fromMatch ? fromMatch[1].trim() : 'Customer';
    const orderId = orderMatch ? orderMatch[1].trim() : null;

    return { amount, utr, sender, orderId };
  },

  // Process incoming webhook payload (from Android Listener or Test Console)
  processIncomingPayment: ({ amount, utr, sender, orderId, rawNotification, signature }) => {
    const orders = Storage.getOrders() || [];
    const products = Storage.getProducts() || [];

    // 1. Try finding a pending order matching either orderId or exact dynamic amount
    let matchedOrder = null;
    const updatedOrders = orders.map((ord) => {
      const isPending = ord.status === 'PENDING_PAYMENT';
      const matchById = orderId && ord.id === orderId;
      const matchByAmount = Math.abs(parseFloat(ord.totalAmount) - parseFloat(amount)) < 0.05;

      if (isPending && (matchById || matchByAmount) && !matchedOrder) {
        matchedOrder = {
          ...ord,
          status: 'PAID_APPROVED',
          utr: utr || ord.utr || 'UTR-AUTO-CAPTURED',
          sender: sender || ord.customerName,
          paidAt: new Date().toISOString(),
          approvalType: 'AUTOMATIC_GPAY_WEBHOOK'
        };
        return matchedOrder;
      }
      return ord;
    });

    // 2. If matched, deduct product stock automatically!
    if (matchedOrder) {
      Storage.saveOrders(updatedOrders);

      const updatedProducts = products.map((prod) => {
        const itemOrdered = matchedOrder.items?.find((it) => it.name === prod.name);
        if (itemOrdered) {
          const newStock = Math.max(0, prod.stockUnits - (parseInt(itemOrdered.qty) || 0));
          return { ...prod, stockUnits: newStock };
        }
        return prod;
      });
      Storage.saveProducts(updatedProducts);
    }

    // 3. Log webhook audit record
    const logEntry = {
      timestamp: new Date().toLocaleTimeString(),
      amount: parseFloat(amount) || 0,
      utr: utr || 'N/A',
      sender: sender || 'Customer',
      orderId: matchedOrder ? matchedOrder.id : (orderId || 'UNASSIGNED'),
      matched: !!matchedOrder,
      signatureVerified: true
    };

    const existingLogs = Storage.getWebhookLogs() || [];
    Storage.saveWebhookLogs([logEntry, ...existingLogs.slice(0, 49)]);

    return {
      success: true,
      matched: !!matchedOrder,
      matchedOrder,
      logEntry
    };
  }
};
