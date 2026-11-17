export const INITIAL_PRODUCTS = [
  {
    id: 'cb-001',
    name: 'Brown Kraft Shopper Bag',
    tamilName: 'பிரவுன் கிராஃப்ட் பேப்பர் பேக்',
    category: 'kraft',
    categoryName: 'Kraft Paper Bags',
    pricePerUnit: 5.50,
    minOrderQty: 100,
    stockUnits: 15400,
    gsm: 120,
    sizes: ['8 x 10 x 3.5 in', '10 x 14 x 4 in', '12 x 16 x 5 in'],
    handles: ['Twisted Paper', 'Flat Tape'],
    description: 'Eco-friendly, 100% biodegradable virgin brown kraft paper bag with reinforced twisted handle. Perfect for retail, apparel, and grocery stores.',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80'
    ],
    tierPricing: [
      { minQty: 100, price: 5.50 },
      { minQty: 500, price: 4.80 },
      { minQty: 2000, price: 4.20 },
      { minQty: 5000, price: 3.80 }
    ],
    featured: true,
    rating: 4.9,
    reviewsCount: 142
  },
  {
    id: 'cb-002',
    name: 'Bleached White Boutique Bag',
    tamilName: 'ப்ளீச்ட் ஒயிட் பூட்டிக் பேக்',
    category: 'luxury',
    categoryName: 'Retail & Boutique',
    pricePerUnit: 7.20,
    minOrderQty: 100,
    stockUnits: 8900,
    gsm: 150,
    sizes: ['7 x 9 x 3 in', '10 x 13 x 4 in', '14 x 18 x 5 in'],
    handles: ['Braided Cotton Rope', 'Twisted White Paper'],
    description: 'Crisp bright-white kraft bag with luxury finish. Specially tailored for jewelry, designer clothing boutiques, and cosmetics brands.',
    images: [
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=800&q=80'
    ],
    tierPricing: [
      { minQty: 100, price: 7.20 },
      { minQty: 500, price: 6.40 },
      { minQty: 2000, price: 5.80 },
      { minQty: 5000, price: 5.20 }
    ],
    featured: true,
    rating: 4.8,
    reviewsCount: 98
  },
  {
    id: 'cb-003',
    name: 'Oil-Resistant Bakery & Cake Bag',
    tamilName: 'ஆயில்-ரெசிஸ்டண்ட் பேக்கரி பேக்',
    category: 'food',
    categoryName: 'Bakery & Food Delivery',
    pricePerUnit: 3.80,
    minOrderQty: 200,
    stockUnits: 24500,
    gsm: 90,
    sizes: ['6 x 8 x 3 in', '8 x 11 x 4 in', '10 x 12 x 5 in'],
    handles: ['Pinch Bottom (No Handle)', 'Flat Handle'],
    description: 'Food-grade certified greaseproof kraft bag. Designed for sweet shops, hot pastries, cafes, and cake boxes in and around Thanjavur.',
    images: [
      'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=80'
    ],
    tierPricing: [
      { minQty: 200, price: 3.80 },
      { minQty: 1000, price: 3.20 },
      { minQty: 5000, price: 2.70 },
      { minQty: 10000, price: 2.30 }
    ],
    featured: false,
    rating: 4.9,
    reviewsCount: 165
  },
  {
    id: 'cb-004',
    name: 'Custom Branded Screen-Printed Bags',
    tamilName: 'கஸ்டம் லோகோ பிராண்டட் பேப்பர் பேக்',
    category: 'custom',
    categoryName: 'Custom Printing',
    pricePerUnit: 8.50,
    minOrderQty: 500,
    stockUnits: 12000,
    gsm: 160,
    sizes: ['10 x 12 x 4 in', '12 x 15 x 5 in', '14 x 18 x 6 in'],
    handles: ['Silk Ribbon', 'Twisted Kraft', 'Rope'],
    description: 'Custom multi-color screen printing with your shop logo, contact numbers, and social media handles. Upload your artwork for immediate digital mockup.',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
    ],
    tierPricing: [
      { minQty: 500, price: 8.50 },
      { minQty: 2000, price: 7.20 },
      { minQty: 5000, price: 6.30 },
      { minQty: 10000, price: 5.60 }
    ],
    featured: true,
    rating: 5.0,
    reviewsCount: 210
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'CB-9821',
    customerName: 'Senthil Textiles',
    phone: '9842109823',
    city: 'Thanjavur (LIC Colony)',
    items: [
      { name: 'Brown Kraft Shopper Bag', qty: 500, price: 4.80 }
    ],
    totalAmount: 2400.18,
    status: 'PAID_APPROVED',
    paymentMethod: 'Google Pay for Business',
    utr: '432190887162',
    timestamp: '2026-11-17T18:15:00',
    approvalType: 'AUTOMATIC_NOTIFICATION_WEBHOOK'
  },
  {
    id: 'CB-9822',
    customerName: 'Aachi Sweet Bakery',
    phone: '9789123456',
    city: 'Kumbakonam',
    items: [
      { name: 'Oil-Resistant Bakery & Cake Bag', qty: 1000, price: 3.20 }
    ],
    totalAmount: 3200.42,
    status: 'PAID_APPROVED',
    paymentMethod: 'Google Pay for Business',
    utr: '432190998811',
    timestamp: '2026-11-17T18:42:00',
    approvalType: 'AUTOMATIC_NOTIFICATION_WEBHOOK'
  }
];

export const STORE_SETTINGS = {
  storeName: 'Classic Bags',
  tagline: 'Leading Paper Bag Manufacturer in Thanjavur',
  location: 'Plot No. 38, 6th Street, Medical College Road, LIC Colony, Thanjavur – 613007',
  phone: '+91 98432 75685',
  whatsapp: '919843275685',
  upiId: 'classicbags.thanjavur@okaxis',
  merchantName: 'CLASSIC BAGS THANJAVUR',
  webhookSecret: 'sec_cb_9843275685_live_hash',
  encryptionKey: 'AES256_CLASSIC_BAGS_SECRET_TOKEN'
};
