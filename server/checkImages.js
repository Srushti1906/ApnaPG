const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const PG = require('./models/PG');

async function checkPG() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  const pg = await PG.findOne({ name: "Vaibhavi's PG" });
  console.log('PG ID:', pg._id);
  console.log('PG Images:', pg.images);
  console.log('PG Thumbnail:', pg.thumbnail);
  console.log('Images Count:', pg.images?.length || 0);
  
  if (pg.images && pg.images.length > 0) {
    console.log('\nFirst Image:', pg.images[0]);
  }
  
  process.exit(0);
}

checkPG().catch(err => {
  console.error(err);
  process.exit(1);
});
