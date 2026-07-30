const express = require('express');
const { addWork, getWorks, getWorkStats, updateWork, deleteWork } = require('../controllers/workController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { cacheMiddleware, clearCache } = require('../middleware/cacheMiddleware');

const router = express.Router();

router.get('/', getWorks);
router.get('/stats', getWorkStats);

router.post('/', authMiddleware, adminMiddleware, clearCache('works'), addWork);
router.put('/:id', authMiddleware, adminMiddleware, clearCache('works'), updateWork);
router.delete('/:id', authMiddleware, adminMiddleware, clearCache('works'), deleteWork);

module.exports = router;
