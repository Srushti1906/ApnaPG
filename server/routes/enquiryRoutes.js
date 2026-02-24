const express = require('express');
const router = express.Router();
const { createEnquiry } = require('../controllers/enquiryController');

// Public: create an enquiry
router.post('/', createEnquiry);

module.exports = router;
