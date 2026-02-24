require('dotenv').config();
const connectDB = require('./config/database');
const mongoose = require('mongoose');
const PG = require('./models/PG');
const Room = require('./models/Room');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Review = require('./models/Review');

const samplePGs = [
  {
    name: 'BlueNest PG - Kondhwa',
    price: 8000,
    period: '15',
    details: 'Single | Female | Mess Available',
    images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80'],
  },
  {
    name: 'Comfort Stay PG - Undri',
    price: 7500,
    period: '15',
    details: 'Double | Both | WiFi + Laundry',
    images: ['https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80'],
  },
  {
    name: 'Urban Living PG - Katraj',
    price: 9000,
    period: '30',
    details: 'Single | Male | AC Room',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'],
  },
  {
    name: 'Royal Stay PG - Wakad',
    price: 10000,
    period: '30',
    details: 'Double | Female | Attached Bathroom',
    images: ['https://images.unsplash.com/photo-1598928506312-6cbf31e5b77d?auto=format&fit=crop&w=1200&q=80'],
  },
  {
    name: 'Elite Rooms PG - Hadapsar',
    price: 8500,
    period: '15',
    details: 'Single | Both | Mess + WiFi',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],
  },
  {
    name: 'Sunshine PG - Baner',
    price: 11000,
    period: '30',
    details: 'Premium Single | Female | AC + Food',
    images: ['https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1200'],
  },
  {
    name: 'Smart Stay PG - Hinjewadi',
    price: 9500,
    period: '30',
    details: 'Double | Male | WiFi',
    images: ['https://images.pexels.com/photos/164338/pexels-photo-164338.jpeg?auto=compress&cs=tinysrgb&w=1200'],
  },
  {
    name: 'Happy Homes PG - Kondhwa',
    price: 7000,
    period: '15',
    details: 'Triple | Both | Budget Stay',
    images: ['https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1200'],
  },
  {
    name: 'Comfort Nest PG - Undri',
    price: 8800,
    period: '30',
    details: 'Single | Female | Balcony',
    images: ['https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=1200'],
  },
  {
    name: 'BlueSky PG - Katraj',
    price: 6500,
    period: '15',
    details: 'Double | Both | Non-AC',
    images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80'],
  },
];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const run = async () => {
  try {
    await connectDB();

    // find an existing owner (created by earlier seed) or create one
    let owner = await User.findOne({ email: 'owner@apnapg.com' });
    if (!owner) {
      owner = await User.create({
        fullName: 'Owner One',
        email: 'owner@apnapg.com',
        password: 'Owner123',
        phone: '9999999999',
        gender: 'Male',
        role: 'Owner',
      });
      console.log('Created owner user');
    }

    // Create a small pool of reviewer users
    const reviewers = [];
    for (let i = 1; i <= 8; i++) {
      const email = `testuser${i}@example.com`;
      let u = await User.findOne({ email });
      if (!u) {
        u = await User.create({
          fullName: `Test User ${i}`,
          email,
          password: 'Test1234',
          phone: `90000000${10 + i}`,
          gender: randomFrom(['Male', 'Female']),
          role: 'User',
        });
      }
      reviewers.push(u);
    }

    for (const info of samplePGs) {
      // skip if PG with same name exists
      let pg = await PG.findOne({ name: info.name });
      if (!pg) {
        pg = await PG.create({
          owner: owner._id,
          ownerPhone: owner.phone,
          ownerEmail: owner.email,
          name: info.name,
          description: info.details,
          address: { street: info.name.split(' - ')[1] || 'Pune', city: 'Pune', state: 'Maharashtra', zipCode: '4110' },
          location: { type: 'Point', coordinates: [73.85 + Math.random() * 0.1, 18.52 + Math.random() * 0.05] },
          nearbyMess: info.details.includes('Mess') ? ['Local Mess'] : [],
          hasMess: info.details.includes('Mess'),
          genderAllowed: info.details.includes('Female') && !info.details.includes('Both') ? 'Girls' : info.details.includes('Male') && !info.details.includes('Both') ? 'Boys' : 'Mixed',
          amenities: { wifi: info.details.includes('WiFi') || info.details.includes('WiFi + Laundry'), ac: info.details.includes('AC'), attachedBathroom: info.details.includes('Attached'), studyTable: false, wardrobe: true, kitchenAccess: false, washingMachine: info.details.includes('Laundry'), parking: false, cctv: false, powerBackup: false },
          images: info.images,
          thumbnail: info.images[0] + '?w=800&q=60',
          isVerified: true,
          price: info.price,
          minPrice: info.price,
          maxPrice: info.price,
          allowsDailyStay: info.period === '15' || info.period === '30',
          allowsMonthlyStay: true,
          isActive: true,
        });
        console.log('Created PG:', pg.name);
      } else {
        console.log('PG exists, skipping:', pg.name);
      }

      // Create a room for this PG
      let room = await Room.findOne({ pg: pg._id });
      if (!room) {
        const monthlyPrice = Math.round(info.price * (30 / parseInt(info.period)));
        const dailyPrice = Math.round(monthlyPrice / 30);
        room = await Room.create({
          pg: pg._id,
          roomNumber: 'R1',
          roomType: info.details.includes('Double') ? 'Double' : info.details.includes('Triple') ? 'Triple' : 'Single',
          description: info.details,
          bedCount: info.details.includes('Double') ? 2 : info.details.includes('Triple') ? 3 : 1,
          availableBeds: info.details.includes('Triple') ? 3 : info.details.includes('Double') ? 2 : 1,
          monthlyPrice,
          dailyPrice,
          availability: { totalBeds: info.details.includes('Triple') ? 3 : info.details.includes('Double') ? 2 : 1, vacantBeds: info.details.includes('Triple') ? 3 : info.details.includes('Double') ? 2 : 1 },
          images: info.images,
        });
        console.log('Created Room for', pg.name);
      }

      // Create a few bookings and reviews
      const reviewsToCreate = Math.floor(Math.random() * 3) + 1; // 1-3
      for (let r = 0; r < reviewsToCreate; r++) {
        const user = reviewers[(Math.floor(Math.random() * reviewers.length))];

        // Create booking
        const checkIn = new Date();
        const checkOut = new Date();
        checkOut.setDate(checkIn.getDate() + (info.period === '15' ? 15 : 30));
        const nights = Math.max(1, Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)));

        const booking = await Booking.create({
          user: user._id,
          pg: pg._id,
          room: room._id,
          owner: owner._id,
          bookingType: info.period === '15' ? 'Daily' : 'Monthly',
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfNights: nights,
          roomPrice: room.dailyPrice,
          totalPrice: room.dailyPrice * nights,
          finalPrice: room.dailyPrice * nights,
          userGender: user.gender,
          pgGenderPolicy: pg.genderAllowed,
          bookingId: `SEED${Date.now()}${Math.floor(Math.random() * 1000)}`,
          paymentStatus: 'Paid',
          status: 'CheckedOut',
        });

        // Create review
        const ratings = {
          cleanliness: Math.floor(Math.random() * 2) + 4,
          amenities: Math.floor(Math.random() * 2) + 3,
          ownerBehavior: Math.floor(Math.random() * 2) + 4,
          foodQuality: pg.hasMess ? Math.floor(Math.random() * 2) + 3 : null,
          valueForMoney: Math.floor(Math.random() * 2) + 3,
          safety: Math.floor(Math.random() * 2) + 4,
        };
        const overall = Math.round(((ratings.cleanliness + ratings.amenities + ratings.ownerBehavior + (ratings.foodQuality || 0) + ratings.valueForMoney + ratings.safety) / (ratings.foodQuality ? 6 : 5)) * 10) / 10;

        const review = await Review.create({
          pg: pg._id,
          booking: booking._id,
          user: user._id,
          owner: owner._id,
          title: randomFrom(['Great stay', 'Very comfortable', 'Value for money', 'Would recommend']),
          comment: randomFrom(['Clean and tidy rooms', 'Owner was helpful', 'Good food and timely service', 'Comfortable beds and nice location']),
          ratings,
          overallRating: overall,
          verifiedBooking: true,
          isApproved: true,
        });

        // Link booking to review
        booking.hasReview = true;
        booking.review = review._id;
        await booking.save();

        console.log(`Created review for ${pg.name} by ${user.email}`);
      }

      // Recompute PG rating
      const pgReviews = await Review.find({ pg: pg._id, isApproved: true });
      if (pgReviews.length > 0) {
        const avg = pgReviews.reduce((s, x) => s + x.overallRating, 0) / pgReviews.length;
        pg.averageRating = Math.round(avg * 10) / 10;
        pg.reviewCount = pgReviews.length;
        await pg.save();
        console.log(`Updated PG ${pg.name} ratings to ${pg.averageRating} (${pg.reviewCount})`);
      }
    }

    console.log('Seeding from HTML complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
};

run();
