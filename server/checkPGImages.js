const mongoose = require('mongoose');
const PG = require('./models/PG');
const User = require('./models/User');
const Room = require('./models/Room');
const Review = require('./models/Review');
const Booking = require('./models/Booking');
const Enquiry = require('./models/Enquiry');

const checkPGImages = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/apna-pg', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('📊 Checking Vaibhavi\'s PG images in database...\n');
    
    // Find Vaibhavi's PG
    const pg = await PG.findOne({ name: 'Vaibhavi\'s PG' }).populate('owner', 'fullName email');
    
    if (!pg) {
      console.log('❌ Vaibhavi\'s PG not found');
      process.exit(1);
    }

    console.log(`✅ Found PG: ${pg.name}`);
    console.log(`   Owner: ${pg.owner.fullName} (${pg.owner.email})`);
    console.log(`   PG ID: ${pg._id}`);
    console.log(`\n📸 Images Array:\n`);
    
    if (pg.images && pg.images.length > 0) {
      pg.images.forEach((img, idx) => {
        console.log(`   ${idx + 1}. ${img}`);
      });
    } else {
      console.log('   ❌ No images found!');
    }

    console.log(`\n🖼️  Thumbnail: ${pg.thumbnail || 'Not set'}`);
    console.log(`\n📝 Full PG Data:`);
    console.log(JSON.stringify({
      _id: pg._id,
      name: pg.name,
      images: pg.images,
      thumbnail: pg.thumbnail,
      description: pg.description?.substring(0, 100),
      address: pg.address,
      minPrice: pg.minPrice,
      maxPrice: pg.maxPrice,
    }, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkPGImages();
