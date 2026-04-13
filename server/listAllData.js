const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const PG = require('./models/PG');
const Room = require('./models/Room');

async function listData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB\n');

    // Get all PGs
    const pgs = await PG.find().populate('owner', 'fullName email');
    console.log(`Total PGs: ${pgs.length}`);
    
    if (pgs.length > 0) {
      pgs.forEach((pg, idx) => {
        console.log(`\n${idx + 1}. ${pg.name}`);
        console.log(`   ID: ${pg._id}`);
        console.log(`   Owner: ${pg.owner?.fullName} (${pg.owner?.email})`);
        console.log(`   Images: ${pg.images?.length || 0}`);
        console.log(`   Description: ${pg.description?.substring(0, 50)}...`);
      });
    } else {
      console.log('✓ Database is clean - no PGs found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listData();
