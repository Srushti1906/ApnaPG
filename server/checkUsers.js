const mongoose = require('mongoose');
const User = require('./models/User');

const checkUsers = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/apna-pg', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('📊 Checking users in database...\n');
    
    const users = await User.find({}, { email: 1, fullName: 1, role: 1, phone: 1, createdAt: 1 });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      process.exit(0);
    }

    console.log(`✅ Found ${users.length} user(s):\n`);
    users.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.fullName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Phone: ${user.phone || 'N/A'}`);
      console.log(`   Created: ${user.createdAt}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkUsers();
