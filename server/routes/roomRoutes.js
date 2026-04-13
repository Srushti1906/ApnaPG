const express = require('express');
const {
  createRoom,
  getRoomById,
  updateRoom,
  deleteRoom,
  updateAvailability,
  uploadRoomImages,
  deleteRoomImage,
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/:id', getRoomById);

// Owner routes
router.post('/', protect, authorize('Owner'), createRoom);
router.put('/:id', protect, authorize('Owner'), updateRoom);
router.delete('/:id', protect, authorize('Owner'), deleteRoom);
router.put('/:id/availability', protect, authorize('Owner'), updateAvailability);

// Image upload routes
router.post('/:id/upload-images', protect, authorize('Owner'), upload.array('images', 10), uploadRoomImages);
router.delete('/:id/images/:imagePath', protect, authorize('Owner'), deleteRoomImage);

module.exports = router;
