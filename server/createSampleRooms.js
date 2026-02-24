/*
  Script to create sample rooms for each PG
  Run: node createSampleRooms.js
*/

require('dotenv').config();
const mongoose = require('mongoose');
const PG = require('./models/PG');
const Room = require('./models/Room');

async function createSampleRooms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing rooms
    await Room.deleteMany({});
    console.log('Cleared existing rooms');

    // Get all PGs
    const pgs = await PG.find({});
    console.log(`Found ${pgs.length} PGs`);

    let totalRooms = 0;

    // Create rooms for each PG
    for (const pg of pgs) {
      const roomConfigs = [
        {
          roomType: 'Single',
          roomNumber: 1,
          bedCount: 1,
          dailyPrice: Math.round((pg.minPrice || 500) * 1.2),
          monthlyPrice: Math.round((pg.minPrice || 500) * 25),
          occupancy: 1,
          vacantBeds: 1,
        },
        {
          roomType: 'Double',
          roomNumber: 2,
          bedCount: 2,
          dailyPrice: Math.round((pg.minPrice || 500) * 1.5),
          monthlyPrice: Math.round((pg.minPrice || 500) * 28),
          occupancy: 2,
          vacantBeds: 1,
        },
        {
          roomType: 'Triple',
          roomNumber: 3,
          bedCount: 3,
          dailyPrice: Math.round((pg.minPrice || 500) * 0.8),
          monthlyPrice: Math.round((pg.minPrice || 500) * 22),
          occupancy: 3,
          vacantBeds: 2,
        },
      ];

      for (const config of roomConfigs) {
        const room = await Room.create({
          pg: pg._id,
          roomType: config.roomType,
          roomNumber: config.roomNumber,
          bedCount: config.bedCount,
          availableBeds: config.vacantBeds,
          dailyPrice: config.dailyPrice,
          monthlyPrice: config.monthlyPrice,
          availability: {
            totalBeds: config.bedCount,
            vacantBeds: config.vacantBeds,
            nextAvailableDate: new Date(),
          },
          allowOneDayStay: true,
          amenities: {
            balcony: Math.random() > 0.5,
            attachedBathroom: Math.random() > 0.3,
            ac: Math.random() > 0.4,
            heater: false,
            studyTable: true,
            wardrobe: true,
            curtains: true,
          },
        });
        totalRooms++;
        console.log(`Created ${config.roomType} room for ${pg.name}`);
      }
    }

    console.log(`\nCreated ${totalRooms} total rooms`);
    console.log('Sample room creation complete');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createSampleRooms();
