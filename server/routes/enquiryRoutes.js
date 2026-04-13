const express = require('express');
const router = express.Router();
const { createEnquiry, getOwnerEnquiries } = require('../controllers/enquiryController');
const { protect, authorize } = require('../middleware/auth');

// Public: create an enquiry
router.post('/', createEnquiry);

// Protected: Get owner's enquiries
router.get('/owner/enquiries', protect, authorize('Owner'), getOwnerEnquiries);

module.exports = router;
