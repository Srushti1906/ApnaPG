const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const PG = require('./models/PG');
const Review = require('./models/Review');
const User = require('./models/User');
const Booking = require('./models/Booking');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apnapg');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const randomNames = [
  'Rahul K', 'Priya S', 'Amit P', 'Neha M', 'Vikram R', 'Anjali T', 'Rohan G', 'Divya L',
  'Sandeep V', 'Sneha B', 'Karan D', 'Pooja N', 'Arjun C', 'Isha W', 'Aditya J', 'Riya H',
  'Nikhil K', 'Ananya F', 'Varun S', 'Diya P', 'Harsh M', 'Shreya A', 'Siddharth E', 'Nisha R',
  'Jatin K', 'Tanvi S', 'Yash M', 'Aadhya G', 'Rakesh P', 'Swati V'
];

const sampleReviews = [
  {
    title: 'Great place to stay!',
    comment: 'Very clean and spacious rooms. The owner is very cooperative and helpful. Great amenities and friendly atmosphere. Highly recommended for students and working professionals.',
    ratings: {
      cleanliness: 5,
      amenities: 5,
      ownerBehavior: 5,
      foodQuality: 4,
      valueForMoney: 4,
      safety: 5,
    },
  },
  {
    title: 'Good value for money',
    comment: 'Decent rooms with basic amenities. The location is convenient and the rent is reasonable. WiFi is fast and the staff is helpful. Would stay again.',
    ratings: {
      cleanliness: 4,
      amenities: 4,
      ownerBehavior: 4,
      foodQuality: 3,
      valueForMoney: 5,
      safety: 4,
    },
  },
  {
    title: 'Excellent facilities',
    comment: 'Amazing PG with excellent facilities. The rooms are well-maintained, and the food quality is good. The owner ensures everyone follows rules and maintains cleanliness. Perfect for serious students.',
    ratings: {
      cleanliness: 5,
      amenities: 5,
      ownerBehavior: 5,
      foodQuality: 4,
      valueForMoney: 4,
      safety: 5,
    },
  },
  {
    title: 'Homely atmosphere',
    comment: 'Feels like home. Very clean rooms with necessary amenities. The owner and staff are friendly and cooperative. Good mess food. Highly satisfied with my stay.',
    ratings: {
      cleanliness: 4,
      amenities: 4,
      ownerBehavior: 5,
      foodQuality: 4,
      valueForMoney: 4,
      safety: 5,
    },
  },
  {
    title: 'Best PG in the area',
    comment: 'Outstanding experience! Clean and well-organized rooms. The owner is very supportive and addresses any concerns quickly. Great location with all facilities nearby. Definitely recommend.',
    ratings: {
      cleanliness: 5,
      amenities: 4,
      ownerBehavior: 5,
      foodQuality: 5,
      valueForMoney: 5,
      safety: 5,
    },
  },
];

const createFakeReviews = async () => {
  try {
    const pgs = await PG.find();

    if (pgs.length === 0) {
      console.log('No PGs found. Please run seed.js first.');
      return;
    }

    // Create fake users with random names
    let fakeUsers = [];
    for (let i = 0; i < randomNames.length; i++) {
      const nameParts = randomNames[i].split(' ');
      const fakeUser = await User.findOneAndUpdate(
        { email: `reviewer${i}@apnapg.com` },
        {
          email: `reviewer${i}@apnapg.com`,
          fullName: randomNames[i],
          password: 'hashedPassword',
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          role: 'User',
        },
        { upsert: true, new: true }
      );
      fakeUsers.push(fakeUser);
    }

    console.log(`Created/Updated ${fakeUsers.length} fake reviewer users`);

    let reviewCount = 0;

    for (const pg of pgs) {
      // Get owner
      const owner = await User.findById(pg.owner);
      if (!owner) continue;

      // Create 3-5 reviews for each PG
      const reviewCount_ = Math.floor(Math.random() * 3) + 3;

      for (let i = 0; i < reviewCount_; i++) {
        // Get random fake user
        const randomUser = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
        if (!randomUser) continue;

        // Get or create a fake booking
        let booking = await Booking.findOne({ pg: pg._id, user: randomUser._id });
        if (!booking) {
          const count = await Booking.countDocuments();
          booking = await Booking.create({
            bookingId: `BK${Date.now()}${count + 1}`,
            user: randomUser._id,
            pg: pg._id,
            room: pg._id,
            owner: pg.owner,
            bookingType: 'Daily',
            checkInDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            checkOutDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
            numberOfNights: 5,
            roomPrice: 500,
            totalPrice: 2500,
            securityDeposit: 250,
            finalPrice: 2750,
            userGender: randomUser.gender,
            pgGenderPolicy: pg.genderAllowed,
            status: 'Completed',
            paymentStatus: 'Paid',
          });
        }

        // Pick random review template
        const reviewTemplate = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
        const overallRating = Math.round(
          (reviewTemplate.ratings.cleanliness +
            reviewTemplate.ratings.amenities +
            reviewTemplate.ratings.ownerBehavior +
            (reviewTemplate.ratings.foodQuality || 4) +
            reviewTemplate.ratings.valueForMoney +
            reviewTemplate.ratings.safety) /
            6
        );

        const review = await Review.create({
          pg: pg._id,
          booking: booking._id,
          user: randomUser._id,
          owner: pg.owner,
          title: reviewTemplate.title,
          comment: reviewTemplate.comment,
          ratings: reviewTemplate.ratings,
          overallRating,
          verifiedBooking: true,
          isApproved: true,
        });

        reviewCount++;
      }
    }

    // Update PG review counts
    for (const pg of pgs) {
      const reviews = await Review.find({ pg: pg._id });
      const avgRating =
        reviews.length > 0
          ? Math.round((reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length) * 10) / 10
          : 0;

      await PG.findByIdAndUpdate(pg._id, {
        reviewCount: reviews.length,
        averageRating: avgRating,
      });
    }

    console.log(`Created ${reviewCount} reviews successfully!`);
  } catch (error) {
    console.error('Error creating reviews:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

connectDB().then(() => createFakeReviews());
