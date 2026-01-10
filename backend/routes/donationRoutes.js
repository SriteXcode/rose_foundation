const express = require('express');
const { addDonation, getDonationStats, getDonations } = require('../controllers/donationController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/', addDonation);
router.get('/stats', getDonationStats);
router.get('/', authMiddleware, adminMiddleware, getDonations);

module.exports = router;
