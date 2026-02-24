const express = require('express');
const {
  getPlatformStats,
  getAllBookings,
  getPendingPGs,
  verifyPG,
  blockPG,
  unblockPG,
  getPendingReviews,
  approveReview,
  rejectReview,
  getAllUsers,
  deactivateUser,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and Admin role
router.use(protect, authorize('Admin'));

// Stats
router.get('/stats', getPlatformStats);

// Bookings
router.get('/bookings', getAllBookings);

// PG Moderation
router.get('/pgs/pending', getPendingPGs);
router.put('/pgs/:id/verify', verifyPG);
router.put('/pgs/:id/block', blockPG);
router.put('/pgs/:id/unblock', unblockPG);

// Review Moderation
router.get('/reviews/pending', getPendingReviews);
router.put('/reviews/:id/approve', approveReview);
router.put('/reviews/:id/reject', rejectReview);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/deactivate', deactivateUser);

module.exports = router;
