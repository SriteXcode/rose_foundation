const express = require('express');
const { subscribe, getSubscribers, sendNewsletter, getNewsletterHistory } = require('../controllers/newsletterController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/', subscribe);
router.get('/', authMiddleware, adminMiddleware, getSubscribers);
router.post('/send', authMiddleware, adminMiddleware, sendNewsletter);
router.get('/history', getNewsletterHistory);

module.exports = router;