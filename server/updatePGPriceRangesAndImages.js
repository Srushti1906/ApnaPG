require('dotenv').config();
const connectDB = require('./config/database');
const PG = require('./models/PG');
const Room = require('./models/Room');

const PLACEHOLDER = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80';

function roundToNearest(n, step = 10, roundUp = false) {
  if (roundUp) return Math.ceil(n / step) * step;
  return Math.floor(n / step) * step;
}

const run = async () => {
  try {
    await connectDB();
    const pgs = await PG.find({});
    if (!pgs.length) {
      console.log('No PGs found');
      process.exit(0);
    }

    for (const pg of pgs) {
      const rooms = await Room.find({ pg: pg._id }).select('dailyPrice monthlyPrice');

      let minDaily = null;
      let maxDaily = null;

      if (rooms && rooms.length > 0) {
        const dailyPrices = rooms.map((r) => r.dailyPrice || (r.monthlyPrice ? Math.round(r.monthlyPrice / 30) : 0)).filter(Boolean);
        if (dailyPrices.length) {
          minDaily = Math.min(...dailyPrices);
          maxDaily = Math.max(...dailyPrices);
        }
      }

      // fallback: if rooms absent, try to derive from pg.price assuming monthly-like price
      if (minDaily == null) {
        const fallback = pg.minPrice || pg.price || 0;
        if (fallback) {
          // if fallback looks like a monthly price (>=500), treat as monthly and convert
          if (fallback > 1000) {
            minDaily = Math.round(fallback / 30 / 2); // provide lower bound
            maxDaily = Math.round(fallback / 30 * 1.5);
          } else {
            minDaily = Math.max(50, Math.round(fallback / 2));
            maxDaily = Math.round(fallback * 1.5) || minDaily;
          }
        }
      }

      if (minDaily != null && maxDaily != null) {
        // if equal, expand to a sensible range
        if (minDaily === maxDaily) {
          const newMin = Math.max(50, Math.floor(minDaily * 0.5));
          const newMax = Math.ceil(maxDaily * 1.5);
          pg.minPrice = roundToNearest(newMin, 10, false) || minDaily;
          pg.maxPrice = roundToNearest(newMax, 10, true) || maxDaily;
        } else {
          pg.minPrice = roundToNearest(minDaily, 10, false) || minDaily;
          pg.maxPrice = roundToNearest(maxDaily, 10, true) || maxDaily;
        }
      }

      // ensure images present
      if (!pg.images || !pg.images.length) {
        pg.images = [PLACEHOLDER];
      }
      if (!pg.thumbnail) pg.thumbnail = pg.images[0] + '?w=800&q=60';

      await pg.save();
      console.log(`Updated PG ${pg.name}: min=${pg.minPrice}, max=${pg.maxPrice}, images=${pg.images.length}`);
    }

    console.log('Update complete');
    process.exit(0);
  } catch (err) {
    console.error('Update failed', err);
    process.exit(1);
  }
};

run();
