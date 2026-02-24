const express = require('express');
const {
  createRoom,
  getRoomById,
  updateRoom,
  deleteRoom,
  updateAvailability,
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/:id', getRoomById);

// Owner routes
router.post('/', protect, authorize('Owner'), createRoom);
router.put('/:id', protect, authorize('Owner'), updateRoom);
router.delete('/:id', protect, authorize('Owner'), deleteRoom);
router.put('/:id/availability', protect, authorize('Owner'), updateAvailability);

module.exports = router;
