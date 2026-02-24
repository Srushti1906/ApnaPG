const express = require('express');
const {
  createReview,
  getPGReviews,
  getReviewById,
  updateReview,
  deleteReview,
  markHelpful,
  respondToReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/pg/:pgId', getPGReviews);
router.get('/:id', getReviewById);

// Private routes
router.post('/', protect, authorize('User'), createReview);
router.put('/:id', protect, authorize('User'), updateReview);
router.delete('/:id', protect, deleteReview);

// Helpful marking
router.post('/:id/helpful', protect, markHelpful);

// Owner response
router.put('/:id/respond', protect, authorize('Owner'), respondToReview);

module.exports = router;
