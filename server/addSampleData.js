const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const PG = require('./models/PG');
const Room = require('./models/Room');
const User = require('./models/User');

async function addSampleData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB\n');

    // First, find or create an owner user
    let owner = await User.findOne({ email: 'owner@example.com' });
    if (!owner) {
      owner = await User.create({
        fullName: 'John Owner',
        email: 'owner@example.com',
        password: 'Owner@123', // Will be hashed by pre-save hook
        phone: '9876543210',
        gender: 'Male',
        role: 'Owner',
      });
      console.log('✓ Owner user created:', owner.email);
    } else {
      console.log('✓ Owner user already exists:', owner.email);
    }

    // Create a sample PG
    const pg = await PG.create({
      name: 'Sunny Hostel',
      description: 'A cozy hostel with all modern amenities for students and professionals.',
      address: {
        street: '123 Main Street',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        landmark: 'Near Metro Station',
      },
      owner: owner._id,
      genderAllowed: 'Mixed',
      amenities: {
        wifi: true,
        ac: true,
        parking: true,
        studyTable: true,
        cctv: true,
        powerBackup: true,
      },
      hasMess: true,
      allowsDailyStay: true,
      allowsMonthlyStay: true,
      securityDepositPercentage: 10,
      minPrice: 500,
      maxPrice: 1000,
      price: 8000,
      averageRating: 4.5,
      isVerified: true,
    });

    console.log('✓ Sample PG created:', pg.name);

    // Create sample rooms
    const rooms = [];
    
    const room1 = await Room.create({
      pg: pg._id,
      roomNumber: '101',
      roomType: 'Single',
      bedCount: 1,
      availableBeds: 1,
      monthlyPrice: 8000,
      dailyPrice: 500,
      allowOneDayStay: true,
      minStayDays: 1,
      maxStayDays: 30,
      amenities: {
        balcony: false,
        attachedBathroom: true,
        ac: true,
        heater: false,
        studyTable: true,
        wardrobe: true,
        curtains: true,
      },
      availability: {
        totalBeds: 1,
        vacantBeds: 1,
        nextAvailableDate: new Date(),
      },
      isActive: true,
    });
    rooms.push(room1);
    console.log('✓ Room 101 (Single) created');

    const room2 = await Room.create({
      pg: pg._id,
      roomNumber: '102',
      roomType: 'Double',
      bedCount: 2,
      availableBeds: 2,
      monthlyPrice: 12000,
      dailyPrice: 800,
      allowOneDayStay: true,
      minStayDays: 1,
      maxStayDays: 30,
      amenities: {
        balcony: true,
        attachedBathroom: true,
        ac: true,
        heater: false,
        studyTable: true,
        wardrobe: true,
        curtains: true,
      },
      availability: {
        totalBeds: 2,
        vacantBeds: 2,
        nextAvailableDate: new Date(),
      },
      isActive: true,
    });
    rooms.push(room2);
    console.log('✓ Room 102 (Double) created');

    // Update PG with room references
    pg.rooms = rooms.map(r => r._id);
    await pg.save();

    console.log('\n✅ Sample data created successfully!');
    console.log('\nTest Details:');
    console.log('- PG Name: Sunny Hostel');
    console.log('- Location: Bangalore, Karnataka');
    console.log('- Rooms: 2 (Single & Double)');
    console.log('- Daily Rate: ₹500-₹800');
    console.log('- Owner: owner@example.com');
    console.log('\nYou can now test the booking system!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addSampleData();
