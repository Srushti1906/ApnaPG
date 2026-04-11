const express = require('express');
const {
  createBooking,
  getBookingById,
  getUserBookings,
  getOwnerBookings,
  getOwnerCustomers,
  approveBooking,
  rejectBooking,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, authorize, checkGenderCompatibility } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');

const router = express.Router();

// Private routes
router.post('/', protect, validateBooking, checkGenderCompatibility, createBooking);

// Owner routes (before :id to avoid conflicts)
router.get('/owner/customers', protect, authorize('Owner'), getOwnerCustomers);
router.get('/owner/bookings', protect, authorize('Owner'), getOwnerBookings);

// User routes
router.get('/user/bookings', protect, authorize('User'), getUserBookings);

// Get booking by ID
router.get('/:id', protect, getBookingById);

// Owner approval routes
router.put('/:id/approve', protect, authorize('Owner'), approveBooking);
router.put('/:id/reject', protect, authorize('Owner'), rejectBooking);

// User cancellation
router.put('/:id/cancel', protect, authorize('User'), cancelBooking);

module.exports = router;
