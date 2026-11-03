const express = require('express');
const { 
  getVapidPublicKey, 
  subscribe, 
  unsubscribe, 
  sendTestNotification 
} = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/vapid-key', getVapidPublicKey);
router.post('/subscribe', authMiddleware, subscribe);
router.post('/unsubscribe', authMiddleware, unsubscribe);
router.post('/test', authMiddleware, adminMiddleware, sendTestNotification);

module.exports = router;
