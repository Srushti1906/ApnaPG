const Review = require('../models/Review');
const Booking = require('../models/Booking');
const PG = require('../models/PG');

// @route   POST /api/reviews
// @desc    Create a review (Only booked users)
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const {
      pgId,
      bookingId,
      title,
      comment,
      ratings,
      overallRating,
    } = req.body;

    // Validation
    if (!pgId || !bookingId || !title || !comment || !overallRating) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Check if booking exists and user is the one who booked
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Can only review your own bookings',
      });
    }

    // Check if booking is completed
    if (booking.status !== 'Completed' && booking.status !== 'CheckedOut') {
      return res.status(400).json({
        success: false,
        message: 'Can only review after checkout',
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking',
      });
    }

    // Create review
    const review = await Review.create({
      pg: pgId,
      booking: bookingId,
      user: req.user._id,
      owner: booking.owner,
      title,
      comment,
      ratings,
      overallRating,
      verifiedBooking: true,
    });

    // Update booking
    booking.hasReview = true;
    booking.review = review._id;
    await booking.save();

    // Update PG rating
    const pgReviews = await Review.find({ pg: pgId, isApproved: true });
    if (pgReviews.length > 0) {
      const avgRating = pgReviews.reduce((sum, r) => sum + r.overallRating, 0) / pgReviews.length;
      await PG.findByIdAndUpdate(pgId, {
        averageRating: avgRating,
        reviewCount: pgReviews.length,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message,
    });
  }
};

// @route   GET /api/reviews/pg/:pgId
// @desc    Get all reviews for a PG
// @access  Public
exports.getPGReviews = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      pg: req.params.pgId,
      isApproved: true,
    })
      .populate('user', 'fullName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments({
      pg: req.params.pgId,
      isApproved: true,
    });

    res.status(200).json({
      success: true,
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message,
    });
  }
};

// @route   GET /api/reviews/:id
// @desc    Get single review
// @access  Public
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'fullName')
      .populate('pg', 'name');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching review',
      error: error.message,
    });
  }
};

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Authorization
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review',
      });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Review updated',
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message,
    });
  }
};

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Authorization
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    // Update booking
    await Booking.findByIdAndUpdate(review.booking, {
      hasReview: false,
      review: null,
    });

    res.status(200).json({
      success: true,
      message: 'Review deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message,
    });
  }
};

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Marked as helpful',
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking review',
      error: error.message,
    });
  }
};

// @route   PUT /api/reviews/:id/respond
// @desc    Owner responds to review
// @access  Private
exports.respondToReview = async (req, res) => {
  try {
    const { comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Authorization
    if (review.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    review.ownerResponse = {
      comment,
      respondedAt: new Date(),
    };

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Response added',
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error responding to review',
      error: error.message,
    });
  }
};
