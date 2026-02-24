const PG = require('../models/PG');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const User = require('../models/User');

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Private (Admin only)
exports.getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOwners = await User.countDocuments({ role: 'Owner' });
    const totalPGs = await PG.countDocuments();
    const verifiedPGs = await PG.countDocuments({ isVerified: true });
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'Completed' });
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$finalPrice' } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalOwners,
        totalPGs,
        verifiedPGs,
        pendingPGs: totalPGs - verifiedPGs,
        totalBookings,
        completedBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message,
    });
  }
};

// @route   GET /api/admin/bookings
// @desc    Get all bookings (admin)
// @access  Admin
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find(filter)
      .populate('user', 'fullName email phone')
      .populate('pg', 'name address location')
      .populate('room', 'roomNumber dailyPrice monthlyPrice')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.status(200).json({ success: true, bookings, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching bookings', error: err.message });
  }
};

// @route   GET /api/admin/pgs/pending
// @desc    Get pending PGs for verification
// @access  Private (Admin only)
exports.getPendingPGs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const pgs = await PG.find({ isVerified: false })
      .populate('owner', 'fullName email phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: 1 });

    const total = await PG.countDocuments({ isVerified: false });

    res.status(200).json({
      success: true,
      pgs,
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
      message: 'Error fetching pending PGs',
      error: error.message,
    });
  }
};

// @route   PUT /api/admin/pgs/:id/verify
// @desc    Verify a PG
// @access  Private (Admin only)
exports.verifyPG = async (req, res) => {
  try {
    const pg = await PG.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: true,
        verifiedBy: req.user._id,
        verificationDate: new Date(),
      },
      { new: true }
    );

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: 'PG not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'PG verified successfully',
      pg,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying PG',
      error: error.message,
    });
  }
};

// @route   PUT /api/admin/pgs/:id/block
// @desc    Block a PG
// @access  Private (Admin only)
exports.blockPG = async (req, res) => {
  try {
    const { reason } = req.body;

    const pg = await PG.findByIdAndUpdate(
      req.params.id,
      {
        isBlocked: true,
        blockReason: reason,
      },
      { new: true }
    );

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: 'PG not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'PG blocked successfully',
      pg,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error blocking PG',
      error: error.message,
    });
  }
};

// @route   PUT /api/admin/pgs/:id/unblock
// @desc    Unblock a PG
// @access  Private (Admin only)
exports.unblockPG = async (req, res) => {
  try {
    const pg = await PG.findByIdAndUpdate(
      req.params.id,
      {
        isBlocked: false,
        blockReason: null,
      },
      { new: true }
    );

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: 'PG not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'PG unblocked successfully',
      pg,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unblocking PG',
      error: error.message,
    });
  }
};

// @route   GET /api/admin/reviews/pending
// @desc    Get pending reviews for moderation
// @access  Private (Admin only)
exports.getPendingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ isApproved: false })
      .populate('user', 'fullName')
      .populate('pg', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: 1 });

    const total = await Review.countDocuments({ isApproved: false });

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
      message: 'Error fetching pending reviews',
      error: error.message,
    });
  }
};

// @route   PUT /api/admin/reviews/:id/approve
// @desc    Approve a review
// @access  Private (Admin only)
exports.approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        approvedBy: req.user._id,
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review approved',
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving review',
      error: error.message,
    });
  }
};

// @route   PUT /api/admin/reviews/:id/reject
// @desc    Reject a review
// @access  Private (Admin only)
exports.rejectReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: false,
        isVisible: false,
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review rejected',
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting review',
      error: error.message,
    });
  }
};

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      users,
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
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

// @route   PUT /api/admin/users/:id/deactivate
// @desc    Deactivate a user
// @access  Private (Admin only)
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deactivated',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating user',
      error: error.message,
    });
  }
};
