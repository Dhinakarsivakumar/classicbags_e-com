# Classic Bags Android Payment Listener Setup Guide
### Google Pay for Business Zero-Touch Notification Detection

This standalone background service intercepts Google Pay for Business alerts on your merchant phone and fires a cryptographically signed webhook to your e-commerce server within 500 milliseconds.

---

## 🔒 Security Architecture

1. **HMAC-SHA256 Digital Signature:**
   - Every outgoing webhook contains an `X-ClassicBags-Signature` header computed using your private key:
     `HMAC-SHA256(payload, secret_key)`
   - The server rejects any payload that doesn't match, preventing man-in-the-middle or spoofing attacks.

2. **Zero Plaintext Sensitive Storage:**
   - No bank account or UPI credentials are stored inside the app.
   - The app only reads the OS status bar notification text for the Google Pay Business package (`com.google.android.apps.nbu.paisa.merchant`).

3. **Tamper Detection:**
   - Includes timestamp and unique UTR to prevent replay attacks.

---

## 🚀 How to Build & Install on Your Business Phone

### Method A: Open in Android Studio
1. Open Android Studio → **Open Project** → Select `d:\classic bags offical\android-service`.
2. Connect your business phone via USB (with USB Debugging enabled).
3. Click **Run 'app'** or select **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
4. Transfer the generated `.apk` to your phone and install it.

### Method B: Phone Settings Configuration (Crucial)
1. **Enable Notification Access:**
   - Open Phone **Settings** → **Apps** → **Special App Access** → **Notification Access**.
   - Find **"Classic Bags Payment Listener"** and toggle it **ON**.
2. **Disable Battery Optimization (Background Running):**
   - Settings → Battery → Battery Optimization / App Battery Usage.
   - Set Classic Bags Listener to **"Unrestricted / Don't Optimize"** so Android never closes the service when the phone is locked.

---

## 🔄 Automatic Workflow Test

1. A customer sends ₹1,450.25 to your Google Pay for Business UPI ID (`classicbags.thanjavur@okaxis`).
2. Google Pay alerts: *"Received ₹1,450.25 from Ramesh (UPI Ref: 432190887162)"*.
3. The listener extracts amount (`1450.25`) and UTR (`432190887162`), signs it, and POSTs to `/webhook/gpay`.
4. The server validates signature, matches the pending order, marks it **PAID_APPROVED**, and deducts the inventory stock automatically.
