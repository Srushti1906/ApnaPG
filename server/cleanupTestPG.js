const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const PG = require('./models/PG');
const Room = require('./models/Room');
const Booking = require('./models/Booking');

async function removeTestData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB\n');

    // Find and delete Premier Student Hostel PG
    const pg = await PG.findOne({ name: 'Premier Student Hostel' });
    
    if (pg) {
      console.log('Found Premier Student Hostel:', pg._id);
      
      // Delete all rooms associated with this PG
      const deletedRooms = await Room.deleteMany({ pg: pg._id });
      console.log(`✓ Deleted ${deletedRooms.deletedCount} rooms`);
      
      // Delete all bookings associated with rooms in this PG
      const roomIds = await Room.find({ pg: pg._id }, '_id');
      if (roomIds.length > 0) {
        const deletedBookings = await Booking.deleteMany({ room: { $in: roomIds } });
        console.log(`✓ Deleted ${deletedBookings.deletedCount} bookings`);
      }
      
      // Delete the PG itself
      await PG.findByIdAndDelete(pg._id);
      console.log('✓ Deleted Premier Student Hostel PG');
    } else {
      console.log('✗ Premier Student Hostel not found in database');
    }

    console.log('\n✓ Cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

removeTestData();
