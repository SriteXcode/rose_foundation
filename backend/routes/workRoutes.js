const express = require('express');
const { addWork, getWorks, getWorkStats, updateWork, deleteWork } = require('../controllers/workController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/', authMiddleware, adminMiddleware, addWork);
router.get('/', getWorks);
router.get('/stats', getWorkStats);
router.put('/:id', authMiddleware, adminMiddleware, updateWork);
router.delete('/:id', authMiddleware, adminMiddleware, deleteWork);

module.exports = router;
