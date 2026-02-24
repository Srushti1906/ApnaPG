require('dotenv').config();
const connectDB = require('../config/database');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const run = async () => {
  try {
    await connectDB();
    const email = process.env.ADMIN_EMAIL || 'admin@apnapg.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';

    let admin = await User.findOne({ email });
    if (admin) {
      console.log('Admin user already exists:', email);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);
    admin = await User.create({
      fullName: 'Platform Admin',
      email,
      phone: '9999990000',
      password: hashed,
      role: 'Admin',
      gender: 'Male',
      isVerified: true,
    });

    console.log('Created admin user:', email, 'with password:', password);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
