const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getUserDonations } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.get('/donations', authMiddleware, getUserDonations);

module.exports = router;