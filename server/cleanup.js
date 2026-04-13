const mongoose = require('mongoose');
const User = require('./models/User');
const PG = require('./models/PG');
const Room = require('./models/Room');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Enquiry = require('./models/Enquiry');

async function cleanup() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost/apna-pg', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear all collections
    console.log('\nClearing collections...');
    
    await User.deleteMany({});
    console.log('✓ Users cleared');
    
    await PG.deleteMany({});
    console.log('✓ PGs cleared');
    
    await Room.deleteMany({});
    console.log('✓ Rooms cleared');
    
    await Booking.deleteMany({});
    console.log('✓ Bookings cleared');
    
    await Review.deleteMany({});
    console.log('✓ Reviews cleared');
    
    await Enquiry.deleteMany({});
    console.log('✓ Enquiries cleared');

    console.log('\n✅ All dummy data has been cleared!');
    console.log('Database is now ready for registered users only.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up:', error);
    process.exit(1);
  }
}

cleanup();
