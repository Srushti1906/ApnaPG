const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    // PG Reference
    pg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PG',
      required: true,
    },

    // Room Information
    roomNumber: {
      type: String,
      required: true,
    },
    roomType: {
      type: String,
      enum: ['Single', 'Double', 'Triple', 'Dormitory'],
      required: true,
    },
    description: String,

    // Bed Configuration
    bedCount: {
      type: Number,
      required: true,
      min: 1,
    },
    availableBeds: {
      type: Number,
      required: true,
      min: 0,
    },

    // Amenities Specific to Room
    amenities: {
      balcony: Boolean,
      attachedBathroom: Boolean,
      ac: Boolean,
      heater: Boolean,
      studyTable: Boolean,
      wardrobe: Boolean,
      curtains: Boolean,
    },

    // Pricing
    monthlyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    dailyPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // Availability
    availability: {
      // Total beds available for booking
      totalBeds: {
        type: Number,
        required: true,
      },
      // Current vacant beds
      vacantBeds: {
        type: Number,
        required: true,
      },
      // Next available date
      nextAvailableDate: {
        type: Date,
        default: Date.now,
      },
    },

    // One-day Stay Restrictions
    allowOneDayStay: {
      type: Boolean,
      default: true,
    },
    minStayDays: {
      type: Number,
      default: 1,
    },
    maxStayDays: {
      type: Number,
      default: 30,
    },

    // Booking Calendar
    bookingCalendar: [
      {
        date: Date,
        status: {
          type: String,
          enum: ['Available', 'Booked', 'Blocked'],
          default: 'Available',
        },
        booking: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Booking',
        },
      },
    ],

    // Images
    images: [String],

    // Room Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Booking History (recent)
    recentBookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
      },
    ],
  },
  {
    timestamps: true,
    indexes: [
      { pg: 1 },
      { roomType: 1 },
      { 'availability.vacantBeds': 1 },
      { allowOneDayStay: 1 },
    ],
  }
);

module.exports = mongoose.model('Room', roomSchema);
