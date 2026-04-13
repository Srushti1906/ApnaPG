const mongoose = require('mongoose');
const User = require('./models/User');
const authController = require('./controllers/authController');

// Get Vaibhavi's user ID and generate a token for testing
const testToken = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/apna-pg');
    
    const user = await User.findOne({ email: 'adrienette1005@gmail.com' });
    console.log('✅ Vaibhavi found');
    console.log('   ID:', user._id);
    console.log('   Role:', user.role);
    
    // Generate token for curl testing
    const { generateToken } = require('./middleware/tokenUtils');
    const token = generateToken(user._id, user.role);
    
    console.log('\n🔐 Token for curl testing:');
    console.log(token);
    
    console.log('\n📤 Upload curl command:');
    console.log(`curl -X POST http://localhost:5000/api/pgs/69db33464ea8a98d1c8e123c/upload-images \\`);
    console.log(`  -H "Authorization: Bearer ${token}" \\`);
    console.log(`  -F "images=@c:/temp/test1.png" \\`);
    console.log(`  -F "images=@c:/temp/test2.png"`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

testToken();
