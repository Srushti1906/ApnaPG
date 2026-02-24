require('dotenv').config();
const connectDB = require('./config/database');
const PG = require('./models/PG');

const fakeOwners = [
  { name: 'Owner One', phone: '9999999999' },
  { name: 'Owner Two', phone: '8888888888' },
  { name: 'Owner Three', phone: '7777777777' },
  { name: 'Owner Four', phone: '6666666666' },
];

const run = async () => {
  try {
    await connectDB();
    const pgs = await PG.find({});
    for (let i = 0; i < pgs.length; i++) {
      const pg = pgs[i];
      if (!pg.ownerName || !pg.ownerPhone) {
        const fake = fakeOwners[i % fakeOwners.length];
        pg.ownerName = fake.name;
        pg.ownerPhone = fake.phone;
        await pg.save();
        console.log(`Set fake owner for ${pg.name}: ${fake.name} / ${fake.phone}`);
      } else {
        console.log(`PG ${pg.name} already has owner info`);
      }
    }
    console.log('Owner update complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
