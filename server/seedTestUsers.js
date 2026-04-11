const mongoose = require('mongoose');
const User = require('./models/User');

async function seedUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/apna-pg');
    console.log('✓ Connected to MongoDB');
    
    // Create test users
    const testUsers = [
      {
        fullName: 'John User',
        email: 'user@example.com',
        password: 'password123',
        phone: '9876543210',
        gender: 'Male',
        role: 'User'
      },
      {
        fullName: 'Jane Owner',
        email: 'owner@example.com',
        password: 'password123',
        phone: '9876543211',
        gender: 'Female',
        role: 'Owner'
      }
    ];

    // Delete existing test users
    await User.deleteMany({ email: { $in: ['user@example.com', 'owner@example.com'] } });
    console.log('✓ Cleaned up old test users');
    
    // Create new users
    await User.create(testUsers);
    console.log('✓ Created test users successfully');
    console.log('✓ User: user@example.com / password123');
    console.log('✓ Owner: owner@example.com / password123');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedUsers();
