const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { cacheMiddleware, clearCache } = require('../middleware/cacheMiddleware');

router.get('/', cacheMiddleware(3600000), getSettings);
router.put('/', authMiddleware, adminMiddleware, clearCache('settings'), updateSettings);

module.exports = router;