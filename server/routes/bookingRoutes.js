const express = require('express');
const {
  createBooking,
  getBookingById,
  getUserBookings,
  getOwnerBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, authorize, checkGenderCompatibility } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');

const router = express.Router();

// Private routes
router.post('/', protect, validateBooking, checkGenderCompatibility, createBooking);
router.get('/user/bookings', protect, authorize('User'), getUserBookings);
router.get('/owner/bookings', protect, authorize('Owner'), getOwnerBookings);
router.get('/:id', protect, getBookingById);

// Owner approval routes
router.put('/:id/approve', protect, authorize('Owner'), approveBooking);
router.put('/:id/reject', protect, authorize('Owner'), rejectBooking);

// User cancellation
router.put('/:id/cancel', protect, authorize('User'), cancelBooking);

module.exports = router;
