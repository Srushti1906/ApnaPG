const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // References
    pg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PG',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Review Content
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },

    // Ratings (Individual)
    ratings: {
      cleanliness: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      amenities: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      ownerBehavior: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      foodQuality: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      valueForMoney: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      safety: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
    },

    // Overall Rating (Average)
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Verification
    verifiedBooking: {
      type: Boolean,
      default: true,
    },

    // Review Status
    isApproved: {
      type: Boolean,
      default: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Visibility
    isVisible: {
      type: Boolean,
      default: true,
    },

    // Response from Owner
    ownerResponse: {
      comment: String,
      respondedAt: Date,
    },

    // Helpfulness (Community Voting)
    helpfulCount: {
      type: Number,
      default: 0,
    },
    unhelpfulCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    indexes: [
      { pg: 1 },
      { user: 1 },
      { booking: 1 },
      { overallRating: 1 },
      { isApproved: 1 },
      { createdAt: -1 },
    ],
  }
);

module.exports = mongoose.model('Review', reviewSchema);
