const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema(
  {
    // Owner Information
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Basic Information
    price: {
   type: Number,
   required: true
},
    name: {
      type: String,
      required: [true, 'PG name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      landmark: String,
    },

    // Location Coordinates (for mapping)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0], // Default to [0, 0] until geocoded
      },
    },

    // Nearby Attractions
    nearbyCollege: [String],
    nearbySchool: [String],
    nearbyOffice: [String],
    // Nearby mess/food outlets and in-house mess availability
    nearbyMess: [String],
    hasMess: {
      type: Boolean,
      default: false,
    },

    // Gender Policy (Core rule)
    genderAllowed: {
      type: String,
      enum: {
        values: ['Boys', 'Girls', 'Family/Couple', 'Mixed'],
        message: 'Invalid gender policy',
      },
      required: [true, 'Gender policy is required'],
    },

    // Amenities
    amenities: {
      wifi: Boolean,
      ac: Boolean,
      attachedBathroom: Boolean,
      studyTable: Boolean,
      wardrobe: Boolean,
      kitchenAccess: Boolean,
      washingMachine: Boolean,
      parking: Boolean,
      cctv: Boolean,
      powerBackup: Boolean,
    },

    // House Rules
    rules: {
      checkInTime: {
        type: String,
        default: '18:00',
      },
      checkOutTime: {
        type: String,
        default: '09:00',
      },
      guestPolicy: String,
      noiseRestriction: Boolean,
      smokingAllowed: Boolean,
      alcoholAllowed: Boolean,
      petPolicy: String,
    },

    // Contact Information
    ownerPhone: String,
    ownerEmail: String,

    // Images
    images: [String],
    thumbnail: String,

    // Verification Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDate: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Ratings & Reviews
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockReason: String,

    // Rooms (Reference)
    rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
      },
    ],

    // Pricing (Display only - actual prices in Room)
    minPrice: Number,
    maxPrice: Number,

    // Stay Options
    allowsDailyStay: {
      type: Boolean,
      default: true,
    },
    allowsMonthlyStay: {
      type: Boolean,
      default: true,
    },

    // Security Deposit
    securityDepositPercentage: {
      type: Number,
      default: 0,
    },
    refundableDays: {
      type: Number,
      default: 7,
    },
  },
  {
    timestamps: true,
    indexes: [
      { owner: 1 },
      { 'address.city': 1 },
      { genderAllowed: 1 },
      { isVerified: 1 },
      { location: '2dsphere' }, // For geospatial queries
    ],
  }
);

module.exports = mongoose.model('PG', pgSchema);
