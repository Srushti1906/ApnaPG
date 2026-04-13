const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const updateVaibhaviPassword = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/apna-pg', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔐 Updating Vaibhavi password...\n');
    
    const user = await User.findOne({ email: 'adrienette1005@gmail.com' });
    
    if (!user) {
      console.log('❌ Vaibhavi not found');
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.fullName}`);
    console.log(`   Current email: ${user.email}`);
    console.log(`   Current role: ${user.role}`);

    // Update password
    user.password = 'Test@123';
    await user.save();

    console.log(`\n✅ Password updated to: Test@123`);
    console.log('   You can now login with this password');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

updateVaibhaviPassword();
