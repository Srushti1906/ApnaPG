require('dotenv').config();
const connectDB = require('./config/database');
const mongoose = require('mongoose');
const PG = require('./models/PG');

const seedRatings = async () => {
  try {
    await connectDB();

    const pgs = await PG.find({});
    if (!pgs.length) {
      console.log('No PGs found to update.');
      process.exit(0);
    }

    for (const pg of pgs) {
      const reviewCount = Math.floor(Math.random() * 20) + 1; // 1-20
      const avg = Math.round(((Math.random() * 2) + 3) * 10) / 10; // 3.0 - 5.0 one decimal

      pg.reviewCount = reviewCount;
      pg.averageRating = avg;
      await pg.save();
      console.log(`Updated ${pg.name}: rating=${avg}, reviews=${reviewCount}`);
    }

    console.log('Dummy ratings applied to all PGs.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to add dummy ratings', err);
    process.exit(1);
  }
};

seedRatings();
