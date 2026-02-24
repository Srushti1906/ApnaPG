/*
  Migration script to add basic amenities to all PG records
  Ensures all PGs have: bed, wardrobe, and attachedBathroom set to true
  Run: node addBasicAmenities.js
*/

require('dotenv').config();
const mongoose = require('mongoose');
const PG = require('./models/PG');

async function addBasicAmenities() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all PGs to add bed, wardrobe, and attachedBathroom to their amenities
    const result = await PG.updateMany(
      {},
      { 
        $set: { 
          'amenities.bed': true,
          'amenities.wardrobe': true,
          'amenities.attachedBathroom': true
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} PGs with basic amenities (bed, wardrobe, attachedBathroom)`);
    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration error', err);
    process.exit(1);
  }
}

addBasicAmenities();
