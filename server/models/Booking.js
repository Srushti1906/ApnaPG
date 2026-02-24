const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    // Booking Identifiers
    bookingId: {
      type: String,
      unique: true,
      required: true,
    },

    // User & Property References
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PG',
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Booking Details
    bookingType: {
      type: String,
      enum: ['Daily', 'Monthly'],
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    numberOfNights: {
      type: Number,
      required: true,
      min: 1,
    },

    // Status
    status: {
      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'CheckedIn',
        'CheckedOut',
        'Cancelled',
        'Completed',
      ],
      default: 'Pending',
    },

    // Pricing
    roomPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment Details
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded', 'Failed'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Card', 'UPI', 'NetBanking', 'Wallet'],
      default: null,
    },
    transactionId: String,
    paidAt: Date,

    // Verification (for one-day stay)
    idVerified: {
      type: Boolean,
      default: false,
    },
    idProof: String,
    emergencyContactVerified: {
      type: Boolean,
      default: false,
    },

    // Special Requests
    specialRequests: String,
    kitchenAccess: Boolean,

    // Cancellation Details
    cancellationReason: String,
    cancelledAt: Date,
    refundAmount: {
      type: Number,
      default: 0,
    },
    cancellationPolicy: String,

    // Gender Validation (For safety)
    userGender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    pgGenderPolicy: {
      type: String,
      enum: ['Boys', 'Girls', 'Family/Couple', 'Mixed'],
      required: true,
    },

    // Approval/Rejection
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    rejectionReason: String,
    rejectedAt: Date,

    // Feedback
    hasReview: {
      type: Boolean,
      default: false,
    },
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },

    // Notes
    internalNotes: String,
  },
  {
    timestamps: true,
    indexes: [
      { user: 1 },
      { owner: 1 },
      { pg: 1 },
      { room: 1 },
      { bookingId: 1 },
      { status: 1 },
      { paymentStatus: 1 },
      { checkInDate: 1 },
      { checkOutDate: 1 },
    ],
  }
);

// Auto-generate Booking ID
bookingSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingId = `BK${Date.now()}${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
