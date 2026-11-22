export const STORE_SETTINGS = {
  storeName: 'Classic Bags',
  tagline: 'Eco-Friendly Paper Bag Manufacturer, Thanjavur',
  location: 'Plot No. 38, 6th Street, Medical College Road, LIC Colony, Thanjavur – 613007',
  phone: '+91 98432 75685',
  whatsapp: '919843275685',
  upiId: 'sdhinakar6-1@oksbi',
  merchantName: 'Dhinakar S',
  currency: 'INR',
  webhookEndpoint: 'https://api.classicbags.thanjavur/webhook/gpay',
  webhookSecret: 'sec_cb_9843275685_live_hash',
  adminPin: '1234',
  adminUsername: 'Admin@CB',
  adminPassword: 'CB2001#',
  googleClientId: '280576916309-3590bnnhj60kr4n309k7rp0db5utfeoc.apps.googleusercontent.com',
};

export const CATEGORIES = [
  { id: 'kraft',  label: 'Kraft Shopper Bags',     icon: '🛍️' },
  { id: 'luxury', label: 'Retail & Boutique',      icon: '✨' },
  { id: 'food',   label: 'Bakery & Food Delivery', icon: '🍞' },
  { id: 'custom', label: 'Custom Branding',        icon: '🎨' },
];

export const INITIAL_PRODUCTS = [
  {
    id: 'cb-001',
    name: 'Brown Kraft Shopper Bag',
    tamilName: 'பிரவுன் கிராஃப்ட் ஷாப்பர் பேக்',
    category: 'kraft',
    pricePerUnit: 5.50,
    minOrderQty: 100,
    stockUnits: 15400,
    gsm: 120,
    sizes: ['10×5×13 in', '8×10×3.5 in', '12×16×5 in'],
    handles: ['Twisted Paper', 'Flat Tape'],
    description: '100% biodegradable virgin brown kraft with reinforced twisted handle. Perfect for boutiques, bakeries, and retail stores.',
    images: [
      '/uploads/img_1795026129835_paper-bag-kraft-middum-500x500.jpg',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80'
    ],
    tierPricing: [
      { min: 100, price: 5.50 },
      { min: 500, price: 4.80 },
      { min: 2000, price: 4.20 },
      { min: 5000, price: 3.80 }
    ],
    featured: true,
    rating: 4.9,
    reviews: 142,
    createdAt: '2026-10-01',
  },
  {
    id: 'cb-002',
    name: 'Bleached White Boutique Bag',
    tamilName: 'ப்ளீச்ட் ஒயிட் பூட்டிக் பேக்',
    category: 'luxury',
    pricePerUnit: 7.20,
    minOrderQty: 100,
    stockUnits: 8900,
    gsm: 150,
    sizes: ['7×9×3 in', '10×13×4 in', '14×18×5 in'],
    handles: ['Braided Cotton Rope', 'Twisted White Paper'],
    description: 'Crisp bright-white kraft with luxury matte finish. Tailored for jewelry, designer clothing boutiques, and cosmetics brands.',
    images: [
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'
    ],
    tierPricing: [
      { min: 100, price: 7.20 },
      { min: 500, price: 6.40 },
      { min: 2000, price: 5.80 },
      { min: 5000, price: 5.20 }
    ],
    featured: true,
    rating: 4.8,
    reviews: 98,
    createdAt: '2026-10-05',
  },
  {
    id: 'cb-003',
    name: 'Oil-Resistant Bakery & Cake Bag',
    tamilName: 'ஆயில்-ரெசிஸ்டண்ட் பேக்கரி பேக்',
    category: 'food',
    pricePerUnit: 3.80,
    minOrderQty: 200,
    stockUnits: 24500,
    gsm: 90,
    sizes: ['6×8×3 in', '8×11×4 in', '10×12×5 in'],
    handles: ['Pinch Bottom', 'Flat Handle'],
    description: 'Food-grade greaseproof certified kraft for hot samosas, pastries, sweet stalls, and bakery takeout in Thanjavur.',
    images: [
      'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
    ],
    tierPricing: [
      { min: 200, price: 3.80 },
      { min: 1000, price: 3.20 },
      { min: 5000, price: 2.70 },
      { min: 10000, price: 2.30 }
    ],
    featured: false,
    rating: 4.9,
    reviews: 165,
    createdAt: '2026-10-10',
  },
  {
    id: 'cb-004',
    name: 'Custom Branded Screen-Print Bag',
    tamilName: 'கஸ்டம் லோகோ பிராண்டட் பேக்',
    category: 'custom',
    pricePerUnit: 8.50,
    minOrderQty: 500,
    stockUnits: 12000,
    gsm: 160,
    sizes: ['10×12×4 in', '12×15×5 in', '14×18×6 in'],
    handles: ['Silk Ribbon', 'Twisted Kraft', 'Rope'],
    description: 'Precision multi-color screen printing with your shop logo and contact details. Upload logo for instant digital mockup.',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'
    ],
    tierPricing: [
      { min: 500, price: 8.50 },
      { min: 2000, price: 7.20 },
      { min: 5000, price: 6.30 },
      { min: 10000, price: 5.60 }
    ],
    featured: true,
    rating: 5.0,
    reviews: 210,
    createdAt: '2026-10-15',
  },
];

export const INITIAL_ORDERS = [];
