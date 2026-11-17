import CryptoJS from 'crypto-js';

// Security service for HMAC-SHA256 signature & AES payload encryption
export const SecurityService = {
  // Generate HMAC-SHA256 signature for outgoing webhook payload
  generateSignature: (payloadString, secretKey) => {
    return CryptoJS.HmacSHA256(payloadString, secretKey).toString(CryptoJS.enc.Hex);
  },

  // Verify HMAC-SHA256 signature on incoming server requests
  verifySignature: (payloadString, signature, secretKey) => {
    const computed = CryptoJS.HmacSHA256(payloadString, secretKey).toString(CryptoJS.enc.Hex);
    return computed === signature;
  },

  // AES-256 Encryption for sensitive notification payload in transit
  encryptPayload: (dataObject, secretKey) => {
    const jsonStr = JSON.stringify(dataObject);
    return CryptoJS.AES.encrypt(jsonStr, secretKey).toString();
  },

  // AES-256 Decryption on the server
  decryptPayload: (ciphertext, secretKey) => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (err) {
      console.error('Decryption failed:', err);
      return null;
    }
  },

  // Parse Google Pay Notification text into structured data
  parseGPayNotification: (notificationText) => {
    // Examples from Google Pay for Business:
    // "Received ₹1,450.25 from Senthil Kumar (UPI Ref: 432190887162)"
    // "You have received ₹500.00 from John Doe (UTR 998877665544)"
    const amountMatch = notificationText.match(/[₹Rs\.\s]*([0-9,]+(?:\.[0-9]{1,2})?)/i);
    const utrMatch = notificationText.match(/(?:UTR|Ref|UPI Ref)[:\s]*([0-9]{10,14})/i);
    const fromMatch = notificationText.match(/from\s+([A-Za-z\s]+)(?:\s*\(|$)/i);

    let amount = 0;
    if (amountMatch && amountMatch[1]) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    const utr = utrMatch ? utrMatch[1].trim() : ('UTR' + Math.floor(100000000000 + Math.random() * 900000000000));
    const sender = fromMatch ? fromMatch[1].trim() : 'Customer';

    return {
      amount,
      utr,
      sender,
      timestamp: new Date().toISOString()
    };
  }
};
