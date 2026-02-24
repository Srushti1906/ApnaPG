/*
  Seed script to create one owner and three sample PGs with images and mess info.
  Run: node seed.js
  Make sure MONGODB_URI is set in server/.env and server is not running (or allow multiple connections).
*/

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const PG = require('./models/PG');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create or find owner user
    let owner = await User.findOne({ email: 'owner@apnapg.com' });
    if (!owner) {
      owner = await User.create({
        fullName: 'Owner One',
        email: 'owner@apnapg.com',
        password: 'password123',
        phone: '9999999999',
        gender: 'Male',
        role: 'Owner',
        isVerified: true,
      });
      console.log('Created owner user');
    }

    // Remove existing sample PGs by this owner
    await PG.deleteMany({ owner: owner._id });

    const samples = [
      {
        owner: owner._id,
        name: 'Bluewater PG',
        description: 'Comfortable PG near college with AC rooms and WiFi.',
        address: { street: '123 Ocean View', city: 'Pune', state: 'Maharashtra', zipCode: '411001' },
        location: { type: 'Point', coordinates: [73.8567, 18.5204] },
        nearbyCollege: ['ABC College'],
        nearbySchool: ['XYZ School'],
        nearbyOffice: ['Tech Park'],
        nearbyMess: ['Tiffin Delight - 150/day', 'Mess Corner - 120/day'],
        hasMess: true,
        genderAllowed: 'Boys',
        amenities: { bed: true, wardrobe: true, attachedBathroom: true, wifi: true, ac: true, studyTable: true, washingMachine: true, cctv: true, powerBackup: true, kitchenAccess: false, parking: false },
        ownerPhone: owner.phone,
        ownerEmail: owner.email,
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
          'https://images.unsplash.com/photo-1505691723518-36a0f4a4a6a0?w=1200&q=80',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=60',
        price: 499,
        minPrice: 499,
        maxPrice: 799,
        allowsDailyStay: true,
        isVerified: true,
      },
      {
        owner: owner._id,
        name: 'Cozy Corner PG',
        description: 'Economical PG with neat rooms and hot water.',
        address: { street: '45 Cozy Lane', city: 'Pune', state: 'Maharashtra', zipCode: '411002' },
        location: { type: 'Point', coordinates: [73.858, 18.521] },
        nearbyCollege: ['LMN Institute'],
        nearbyMess: ['Home Tiffins - 100/day'],
        hasMess: false,
        genderAllowed: 'Mixed',
        amenities: { bed: true, wardrobe: true, attachedBathroom: true, wifi: true, studyTable: true, kitchenAccess: true, parking: true, ac: false, washingMachine: false, cctv: false, powerBackup: false },
        ownerPhone: owner.phone,
        ownerEmail: owner.email,
        images: [
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&q=80',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=60',
        price: 299,
        minPrice: 299,
        maxPrice: 499,
        allowsDailyStay: false,
        isVerified: true,
      },
      {
        owner: owner._id,
        name: 'Peak Stay PG',
        description: 'Premium PG with furnished rooms and attached bathrooms.',
        address: { street: '88 Peak Road', city: 'Pune', state: 'Maharashtra', zipCode: '411003' },
        location: { type: 'Point', coordinates: [73.85, 18.53] },
        nearbyOffice: ['Business Hub'],
        nearbyMess: [],
        hasMess: false,
        genderAllowed: 'Girls',
        amenities: { bed: true, wardrobe: true, attachedBathroom: true, wifi: true, ac: true, studyTable: true, washingMachine: true, kitchenAccess: true, parking: true, cctv: true, powerBackup: true },
        ownerPhone: owner.phone,
        ownerEmail: owner.email,
        images: [
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
          'https://images.unsplash.com/photo-1570129477492-45ac003ff2e0?w=1200&q=80'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=60',
        price: 999,
        minPrice: 999,
        maxPrice: 1499,
        allowsDailyStay: true,
        isVerified: true,
      },
      // Extra PGs added to increase inventory (including more Girls PGs)
      {
        owner: owner._id,
        name: 'Sakhi Girls PG - Kothrud',
        description: 'Secure girls-only PG with CCTV, WiFi and nutritious meals. Single & double sharing available.',
        address: { street: 'Kothrud', city: 'Pune', state: 'Maharashtra', zipCode: '411029' },
        location: { type: 'Point', coordinates: [73.821, 18.506] },
        nearbyMess: ['Sakhi Mess - 140/day'],
        hasMess: true,
        genderAllowed: 'Girls',
        amenities: { bed: true, wardrobe: true, attachedBathroom: true, wifi: true, ac: true, studyTable: true, washingMachine: true, cctv: true, powerBackup: true, kitchenAccess: false, parking: false },
        ownerPhone: owner.phone,
        ownerEmail: owner.email,
        images: [
          'https://images.unsplash.com/photo-1542317854-3f4e9d6d8c02?w=1200&q=80',
          'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80',
          'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1542317854-3f4e9d6d8c02?w=800&q=60',
        price: 799,
        minPrice: 499,
        maxPrice: 999,
        allowsDailyStay: true,
        isVerified: true,
      },
      {
        owner: owner._id,
        name: 'Heritage Girls PG - Aundh',
        description: 'Comfortable girls PG near Aundh with meals and laundary service.',
        address: { street: 'Aundh', city: 'Pune', state: 'Maharashtra', zipCode: '411007' },
        location: { type: 'Point', coordinates: [73.800, 18.566] },
        nearbyMess: ['Aundh Mess'],
        hasMess: true,
        genderAllowed: 'Girls',
        amenities: { bed: true, wardrobe: true, attachedBathroom: true, wifi: true, ac: true, studyTable: true, washingMachine: true, cctv: true, powerBackup: true, kitchenAccess: true, parking: false },
        ownerPhone: owner.phone,
        ownerEmail: owner.email,
        images: [
          'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80',
          'https://images.unsplash.com/photo-1543087904-3e3a7f3d7a4f?w=1200&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=60',
        price: 1199,
        minPrice: 799,
        maxPrice: 1499,
        allowsDailyStay: false,
        isVerified: true,
      },
      {
        owner: owner._id,
        name: 'Sunflower Girls PG - Wanowrie',
        description: 'Affordable girls PG with clean rooms and attentive staff.',
        address: { street: 'Wanowrie', city: 'Pune', state: 'Maharashtra', zipCode: '411040' },
        location: { type: 'Point', coordinates: [73.95, 18.49] },
        nearbyMess: ['Sun Mess'],
        hasMess: true,
        genderAllowed: 'Girls',
        amenities: { bed: true, wardrobe: true, attachedBathroom: false, wifi: true, ac: false, studyTable: true, washingMachine: false, cctv: true, powerBackup: false, kitchenAccess: true, parking: false },
        ownerPhone: owner.phone,
        ownerEmail: owner.email,
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
          'https://images.unsplash.com/photo-1505691723518-36a0f4a4a6a0?w=1200&q=80',
          'https://images.unsplash.com/photo-1560207538-ea4829caf0f?w=1200&q=80',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=60',
        price: 399,
        minPrice: 299,
        maxPrice: 499,
        allowsDailyStay: true,
        isVerified: true,
      },
      {
        owner: owner._id,
        name: 'Urban Living PG - Viman Nagar',
        description: 'Modern PG suitable for working professionals with monthly and daily booking options.',
        address: { street: 'Viman Nagar', city: 'Pune', state: 'Maharashtra', zipCode: '411014' },
        location: { type: 'Point', coordinates: [73.92, 18.57] },
        nearbyMess: [],
        hasMess: false,
        genderAllowed: 'Mixed',
        amenities: { bed: true, wardrobe: true, attachedBathroom: true, wifi: true, ac: true, studyTable: true, washingMachine: true, cctv: true, powerBackup: true, kitchenAccess: true, parking: true },
        ownerPhone: owner.phone,
        ownerEmail: owner.email,
        images: [
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=60',
        price: 899,
        minPrice: 599,
        maxPrice: 1299,
        allowsDailyStay: true,
        isVerified: true,
      }
    ];

    // Additional PGs from provided HTML and added new entries (including more Girls PGs)
    const moreSamples = [
      {
        owner: owner._id,
        name: 'Comfort Stay PG - Yewalewadi',
        description: 'Comfort Stay PG with double sharing rooms and veg food available.',
        address: { street: 'Yewalewadi', city: 'Pune', state: 'Maharashtra', zipCode: '411041' },
        location: { type: 'Point', coordinates: [73.82, 18.55] },
        nearbyMess: ['Local Veg Tiffin'],
        hasMess: true,
        genderAllowed: 'Mixed',
        amenities: { bed: true, wardrobe: true, attachedBathroom: true, wifi: true, studyTable: true, cctv: true, ac: false, kitchenAccess: false, washingMachine: false, parking: false, powerBackup: false },
        ownerPhone: owner.phone,
        ownerEmail: owner.email,
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&q=80'],
        thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=60',
        price: 500,
        minPrice: 500,
        maxPrice: 500,
        allowsDailyStay: true,
        isVerified: true,
      },
      {
        owner: owner._id,
        name: 'Home Comfort PG - Kondhwa Budruk',
        description: 'Private single rooms, WiFi and attached bathrooms. Food not included.',
        address: { street: 'Kondhwa Budruk', city: 'Pune', state: 'Maharashtra', zipCode: '411048' },
        location: { type: 'Point', coordinates: [73.91, 18.45] },
        nearbyMess: [],
        hasMess: false,
        genderAllowed: 'Mixed',
        amenities: { bed: true, wardrobe: true, attachedBathroom: true, wifi: true, parking: true, ac: false, studyTable: false, kitchenAccess: false, washingMachine: false, cctv: false, powerBackup: false },
        ownerPhone: owner.phone,
        ownerEmail: owner.email,
        images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80'],
        thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=60',
        price: 600,
        minPrice: 600,
        maxPrice: 600,
        allowsDailyStay: true,
        isVerified: true,
      },
      {
        owner: owner._id,
        name: 'Student Nest PG - Katraj-Kondhwa Road',
        description: 'Triple sharing economical PG for students with veg and non-veg options.',
        address: { street: 'Katraj-Kondhwa Road', city: 'Pune', state: 'Maharashtra', zipCode: '411046' },
        location: { type: 'Point', coordinates: [73.87, 18.48] },
        nearbyMess: ['Student Mess'],
        hasMess: true,
        genderAllowed: 'Boys',
        amenities: { bed: true, wardrobe: true, attachedBathroom: true, wifi: true, studyTable: true, kitchenAccess: true, ac: false, washingMachine: false, parking: false, cctv: false, powerBackup: false },
        ownerPhone: owner.phone,
        ownerEmail: owner.email,
        images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80', 'https://images.unsplash.com/photo-1560207538-ea4829caf0f?w=1200&q=80', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80'],
        thumbnail: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=60',
        price: 450,
        minPrice: 450,
        maxPrice: 450,
        allowsDailyStay: true,
        isVerified: true,
      },
      {
        owner: owner._id,
        name: 'Peaceful Stay PG - Undri',
        description: 'Single AC rooms with food included, suitable for working professionals.',
        address: { street: 'Undri', city: 'Pune', state: 'Maharashtra', zipCode: '411028' },
        location: { type: 'Point', coordinates: [73.92, 18.47] },
        nearbyMess: ['Canteen Plus'],
        hasMess: true,
        genderAllowed: 'Mixed',
        amenities: { bed: true, wardrobe: true, attachedBathroom: true, wifi: true, ac: true, washingMachine: true, kitchenAccess: true, parking: true, cctv: true, powerBackup: true, studyTable: false },
        ownerPhone: owner.phone,
        ownerEmail: owner.email,
        images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&q=80'],
        thumbnail: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=60',
        price: 700,
        minPrice: 700,
        maxPrice: 700,
        allowsDailyStay: true,
        isVerified: true,
      }
    ];

    // append moreSamples to samples
    samples.push(...moreSamples);

    for (const s of samples) {
      await PG.create(s);
      console.log('Created sample:', s.name);
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
}

seed();
