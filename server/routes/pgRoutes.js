const express = require('express');
const router = express.Router();

const {
  createPG,
  getPGs,
  getPGById,
  updatePG,
  deletePG,
  getPGRooms,
} = require('../controllers/pgController');

const { protect, authorize } = require('../middleware/auth');


/* ===============================
   Public Routes
================================ */

// Get all PGs (with filters & pagination handled in controller)
router.get('/', getPGs);

// Get single PG by ID
router.get('/:id', getPGById);

// Get rooms of a PG
router.get('/:id/rooms', getPGRooms);


/* ===============================
   Owner Protected Routes
================================ */

// Create PG
router.post('/', protect, authorize('Owner'), createPG);

// Update PG
router.put('/:id', protect, authorize('Owner'), updatePG);

// Delete PG
router.delete('/:id', protect, authorize('Owner'), deletePG);


module.exports = router;