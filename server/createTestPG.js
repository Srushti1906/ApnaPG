const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const PG = require('./models/PG');
const Room = require('./models/Room');
const User = require('./models/User');

async function createTestPG() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB\n');

    // Find owner
    let owner = await User.findOne({ email: 'owner@example.com' });
    if (!owner) {
      owner = await User.create({
        fullName: 'John Owner',
        email: 'owner@example.com',
        password: 'Owner@123',
        phone: '9876543210',
        gender: 'Male',
        role: 'Owner',
      });
      console.log('✓ Owner user created:', owner.email);
    }

    // Create a test PG with complete information and images
    const testImages = [
      'https://images.unsplash.com/photo-1522145871726-267a3583f23d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522145871726-267a3583f23d?auto=format&fit=crop&w=800&q=80'
    ];

    const pg = await PG.create({
      name: 'Premier Student Hostel',
      description: 'A modern premium hostel with excellent facilities, located near the tech park. Features include high-speed WiFi, air-conditioned rooms, 24/7 security, daily housekeeping, and vegetarian mess facility. Perfect for students and professionals.',
      address: {
        street: '456 Tech Park Road',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560066',
        landmark: 'Near Whitfield Tech Park',
      },
      owner: owner._id,
      genderAllowed: 'Mixed',
      amenities: {
        wifi: true,
        ac: true,
        attachedBathroom: true,
        studyTable: true,
        wardrobe: true,
        kitchenAccess: false,
        washingMachine: true,
        parking: true,
        cctv: true,
        powerBackup: true,
      },
      rules: {
        checkInTime: '18:00',
        checkOutTime: '09:00',
        guestPolicy: 'Guests allowed on weekends only',
        noiseRestriction: true,
        smokingAllowed: false,
        alcoholAllowed: false,
        petPolicy: 'No pets allowed',
      },
      ownerPhone: '9876543210',
      ownerEmail: 'owner@example.com',
      images: testImages,
      thumbnail: testImages[0],
      isVerified: true,
      isActive: true,
      hasMess: true,
      allowsDailyStay: false,
      price: 450,
      minPrice: 450,
      maxPrice: 800,
    });

    console.log('✓ Test PG created:', pg.name);
    console.log('  - ID:', pg._id);
    console.log('  - Images:', pg.images.length);
    console.log('  - Verified:', pg.isVerified);

    // Create sample rooms
    const rooms = [
      {
        pg: pg._id,
        roomNumber: 'A101',
        roomType: 'Single',
        bedCount: 1,
        availableBeds: 1,
        description: 'Spacious single room with all amenities',
        monthlyPrice: 13500,
        dailyPrice: 450,
        amenities: {
          ac: true,
          attachedBathroom: true,
          studyTable: true,
          wardrobe: true,
        },
        availability: {
          totalBeds: 1,
          vacantBeds: 1,
        },
        allowOneDayStay: false,
        minStayDays: 1,
      },
      {
        pg: pg._id,
        roomNumber: 'A102',
        roomType: 'Double',
        bedCount: 2,
        availableBeds: 2,
        description: 'Comfortable double room for couples or roommates',
        monthlyPrice: 24000,
        dailyPrice: 800,
        amenities: {
          ac: true,
          attachedBathroom: true,
          studyTable: true,
          wardrobe: true,
        },
        availability: {
          totalBeds: 2,
          vacantBeds: 2,
        },
        allowOneDayStay: false,
        minStayDays: 1,
      },
    ];

    const createdRooms = await Room.insertMany(rooms);
    console.log(`✓ Created ${createdRooms.length} sample rooms`);

    console.log('\n✓ Test setup complete! PG is ready to be displayed to users.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestPG();
