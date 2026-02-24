const express = require('express');
const { register, login, getCurrentUser, updateProfile, logout } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Private routes
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

module.exports = router;
