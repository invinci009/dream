const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const saPath = path.resolve(__dirname, '../firebase-service-account.json');
const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));

const app = initializeApp({
  credential: cert(sa),
  projectId: sa.project_id || 'motu-seth',
});

const db = getFirestore(app);

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'residence-inn-salt-2026').digest('hex');
}

async function seed() {
  console.log('Seeding fresh Firestore database for Dream Bazaar...');

  const now = new Date().toISOString();

  // 1. Business Profile
  const businessId = 'dream-bazaar';
  const bizData = {
    id: businessId,
    name: 'Dream Bazaar',
    unit: 'Clothing & Fashion Showroom',
    category: 'clothing_store',
    location: '1st Floor (Above Lenskart), Opposite Mausam Vibhag, Anisabad Khagaul Road, Patna, Bihar',
    place_id: 'ChIJfZJgPwBX7TkRU469KMlU5nM',
    phone: '9097602005',
    secondary_phone: '9097602005',
    gst_number: '10AABCD1234E1Z5',
    timezone: 'Asia/Kolkata',
    primary_color: '#0284c7',
    welcome_message: {
      en: 'Welcome to Dream Bazaar! Share your clothing & fashion shopping experience with us in 30 seconds. For helpline & inquiries call 9097602005.',
    },
    google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJfZJgPwBX7TkRU469KMlU5nM',
    owner_id: 'owner-dream-bazaar',
    owner_email: 'admin@dreambazaar.com',
    default_language: 'en',
    created_at: now,
    updated_at: now,
  };

  await db.collection('businesses').doc(businessId).set(bizData);
  // Mirror to 'motu-seth' and 'residence-inn' for seamless backward compatibility
  await db.collection('businesses').doc('motu-seth').set({
    ...bizData,
    id: 'motu-seth',
  });
  await db.collection('businesses').doc('residence-inn').set({
    ...bizData,
    id: 'residence-inn',
  });
  console.log('✅ Created business doc: dream-bazaar (synced with motu-seth & residence-inn)');

  // 2. Campaigns
  const campaigns = [
    {
      id: 'dream-bazaar',
      business_id: businessId,
      name: 'Main Store Entrance & Billing Counter QR',
      slug: 'dream-bazaar',
      active: true,
      created_at: now,
    },
    {
      id: 'counter-qr',
      business_id: businessId,
      name: 'Checkout & Billing Counter QR',
      slug: 'counter-qr',
      active: true,
      created_at: now,
    },
    {
      id: 'fashion-floor',
      business_id: businessId,
      name: '1st Floor Fashion & Apparel Stand',
      slug: 'fashion-floor',
      active: true,
      created_at: now,
    },
    {
      id: 'motu-seth',
      business_id: businessId,
      name: 'Legacy QR Stand (Dream Bazaar)',
      slug: 'motu-seth',
      active: true,
      created_at: now,
    },
    {
      id: 'table-qr',
      business_id: businessId,
      name: 'In-Store Customer Lounge QR',
      slug: 'table-qr',
      active: true,
      created_at: now,
    },
  ];

  for (const c of campaigns) {
    await db.collection('campaigns').doc(c.id).set(c);
  }
  console.log('✅ Created campaigns: dream-bazaar, counter-qr, fashion-floor, motu-seth, table-qr');

  // 3. Store Catalog & Departments (menu_items collection)
  const storeItems = [
    { id: 'item-1', business_id: businessId, name: { en: "Men's Fashion & Shirts/Jeans" }, position: 1, active: true },
    { id: 'item-2', business_id: businessId, name: { en: "Women's Sarees & Ethnic Kurti" }, position: 2, active: true },
    { id: 'item-3', business_id: businessId, name: { en: "Kids Wear & Baby Outfits" }, position: 3, active: true },
    { id: 'item-4', business_id: businessId, name: { en: "Footwear & Daily Sandals" }, position: 4, active: true },
    { id: 'item-5', business_id: businessId, name: { en: "Bedding, Curtains & Home Linen" }, position: 5, active: true },
    { id: 'item-6', business_id: businessId, name: { en: "Kitchenware & Steel Essentials" }, position: 6, active: true },
    { id: 'item-7', business_id: businessId, name: { en: "Daily Essentials & Grocery" }, position: 7, active: true },
    { id: 'item-8', business_id: businessId, name: { en: "Beauty, Perfumes & Grooming" }, position: 8, active: true },
    { id: 'item-9', business_id: businessId, name: { en: "Handbags, Belts & Accessories" }, position: 9, active: true },
    { id: 'item-10', business_id: businessId, name: { en: "Toys, Stationery & Gifts" }, position: 10, active: true },
  ];

  for (const m of storeItems) {
    await db.collection('menu_items').doc(m.id).set(m);
    await db.collection('menu_items').doc(`motu-${m.id}`).set({ ...m, id: `motu-${m.id}`, business_id: 'motu-seth' });
  }
  console.log('✅ Created 10 store department items');

  // 4. Survey Questions
  const questions = [
    { id: 'q-overall', business_id: businessId, key: 'overall_rating', type: 'rating', text: { en: 'Overall Shopping Experience' }, position: 1 },
    { id: 'q-quality', business_id: businessId, key: 'quality_rating', type: 'rating', text: { en: 'Product Variety & Quality' }, position: 2 },
    { id: 'q-service', business_id: businessId, key: 'service_rating', type: 'rating', text: { en: 'Staff Assistance & Billing Speed' }, position: 3 },
    { id: 'q-liked', business_id: businessId, key: 'liked', type: 'multi_choice', text: { en: 'What did you like most?' }, position: 4 },
    { id: 'q-ordered', business_id: businessId, key: 'ordered', type: 'multi_choice', text: { en: 'Sections Visited Today' }, position: 5 },
    { id: 'q-contact', business_id: businessId, key: 'customer_contact', type: 'text', text: { en: 'Shopper Contact Details' }, position: 6 },
  ];

  for (const q of questions) {
    await db.collection('questions').doc(q.id).set(q);
  }
  console.log('✅ Created 6 survey questions');

  // 5. Admin Users for dashboard authentication
  const adminUsers = [
    {
      id: 'admin-dreambazaar',
      email: 'admin@dreambazaar.com',
      username: 'admin',
      password_hash: hashPassword('password123'),
      role: 'owner',
      business_id: businessId,
      created_at: now,
    },
    {
      id: 'owner-dreambazaar',
      email: 'owner@dreambazaar.com',
      username: 'owner',
      password_hash: hashPassword('password123'),
      role: 'owner',
      business_id: businessId,
      created_at: now,
    },
    {
      id: 'dream-dreambazaar',
      email: 'dream@dreambazaar.com',
      username: 'dream',
      password_hash: hashPassword('password123'),
      role: 'owner',
      business_id: businessId,
      created_at: now,
    },
    {
      id: 'admin-motuseth',
      email: 'admin@motuseth.com',
      username: 'admin-legacy',
      password_hash: hashPassword('password123'),
      role: 'owner',
      business_id: businessId,
      created_at: now,
    },
  ];

  for (const u of adminUsers) {
    await db.collection('users').doc(u.id).set(u);
  }
  console.log('✅ Created admin users: admin@dreambazaar.com / admin / dream (password123)');

  console.log('\n🎉 Fresh Firestore database seeded successfully for Dream Bazaar!');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
