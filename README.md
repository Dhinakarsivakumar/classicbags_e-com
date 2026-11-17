# Classic Bags Thanjavur (கிளாசிக் பேக்ஸ்)
### Modern E-Commerce Platform with Google Pay for Business Zero-Touch Auto-Approval System

**Factory & Store Location:** Plot No. 38, 6th Street, Medical College Road, LIC Colony, Thanjavur – 613007  
**Contact:** +91 98432 75685  

---

## 🌟 Key Highlights & Features

1. **📱 Responsive Mobile & Desktop Layout (Strict Aspect Ratios):**
   - **Mobile-first View (4:5 / 9:16 Aspect Ratio):** Built specifically for smartphone users with swipeable galleries, sticky Google Pay / WhatsApp order actions, and zero-distortion bag cards.
   - **Desktop View (16:9 Widescreen):** 4-column product grid with zoom preview, side-by-side spec sheets, and wholesale tier pricing calculator.

2. **🛍️ Product Catalog & Bag Customizer:**
   - **Kraft Paper Shopper Bags:** Brown & Bleached white with twisted handles (supermarket & retail).
   - **Luxury Boutique Bags:** High GSM with braided rope & satin ribbon handles.
   - **Bakery & Food Bags:** Certified oil-resistant and greaseproof kraft bags.
   - **Custom Branding Mockup Uploader:** Clients can upload their shop logo / artwork and view an instant live digital mockup on the bag before ordering.
   - **Tiered Wholesale Pricing:** Real-time unit price calculation (100, 500, 2000, 5000+ units).

3. **⚡ Dedicated Admin UI Module:**
   - **Instant Stock Manager:** Inline quantity editor with quick +500 / +2,000 restock buttons and low-stock alerts.
   - **Photo & Variety Manager:** Upload new bag varieties, photo URLs, GSM thickness, and pricing tiers.
   - **Live Webhook & Order Audit:** Real-time visibility into matched orders, payment UTR numbers, and stock deduction confirmations.
   - **Android Notification Listener Simulator:** Interactive test console to simulate Google Pay incoming notifications and verify the automated approval workflow in real-time.

4. **🔐 100% Zero-Touch Google Pay Auto-Approval (Zero Gateway Fees):**
   - **No Third-Party Gateway Required:** 0% commission directly into your Google Pay for Business bank account.
   - **Dynamic Matching Paise:** App adds an automated 2-digit paise (e.g., ₹2,400.18) so every pending order is uniquely matched without race conditions.
   - **Android Notification Listener Service (`android-service/`):** A lightweight background service installed on your business phone intercepts Google Pay notifications, signs the payload with HMAC-SHA256, and triggers the server webhook.
   - **Zero-Touch Execution:** The moment money is received, the server validates the signature, confirms the order, reduces stock, and marks the order as approved automatically.

---

## 🚀 How to Run the Web Application

1. Open a terminal in `d:\classic bags offical`:
   ```bash
   npm run dev
   ```
2. Open your browser at:
   ```
   http://localhost:3001
   ```
3. Click the **"Admin Dashboard"** button in the top navigation bar to toggle between the **Customer Store** and the **Dedicated Admin Module**.

---

## 📱 Android Notification Listener Setup (`android-service/`)

- Source code available in `android-service/GPayNotificationListenerService.kt`.
- Manifest configured in `android-service/AndroidManifest.xml` with `BIND_NOTIFICATION_LISTENER_SERVICE`.
- Listens to `com.google.android.apps.nbu.paisa.merchant` and `com.google.android.apps.nbu.paisa.user`.
- Dispatches secure POST requests with the `X-ClassicBags-Signature` HMAC-SHA256 header.
