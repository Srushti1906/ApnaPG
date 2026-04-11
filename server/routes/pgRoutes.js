const express = require('express');
const router = express.Router();

const {
  createPG,
  getPGs,
  getPGById,
  getOwnerPGs,
  updatePG,
  deletePG,
  getPGRooms,
} = require('../controllers/pgController');

const { protect, authorize } = require('../middleware/auth');


/* ===============================
   Owner Protected Routes (must be before :id routes)
================================ */

// Get owner's PGs
router.get('/owner/my-pgs', protect, authorize('Owner'), getOwnerPGs);

// Create PG
router.post('/', protect, authorize('Owner'), createPG);


/* ===============================
   Public Routes
================================ */

// Get all PGs (with filters & pagination handled in controller)
router.get('/', getPGs);

// Get rooms of a PG (before :id to avoid conflict)
router.get('/:id/rooms', getPGRooms);

// Get single PG by ID
router.get('/:id', getPGById);

// Update PG (owner only)
router.put('/:id', protect, authorize('Owner'), updatePG);

// Delete PG (owner only)
router.delete('/:id', protect, authorize('Owner'), deletePG);


module.exports = router;