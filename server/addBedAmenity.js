/*
  Migration script to add bed: true to all PG amenities
  Run: node addBedAmenity.js
*/

require('dotenv').config();
const mongoose = require('mongoose');
const PG = require('./models/PG');

async function addBedAmenity() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all PGs to add bed: true to their amenities
    const result = await PG.updateMany(
      {},
      { $set: { 'amenities.bed': true } }
    );

    console.log(`Updated ${result.modifiedCount} PGs with bed amenity`);
    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration error', err);
    process.exit(1);
  }
}

addBedAmenity();
