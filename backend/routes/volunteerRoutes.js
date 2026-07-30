const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Import upload middleware
const { cacheMiddleware, clearCache } = require('../middleware/cacheMiddleware');

router.get('/', volunteerController.getVolunteers);
router.post('/', authMiddleware, adminMiddleware, clearCache('volunteers'), volunteerController.addVolunteer);
router.put('/:id', authMiddleware, adminMiddleware, clearCache('volunteers'), volunteerController.updateVolunteer);
router.delete('/:id', authMiddleware, adminMiddleware, clearCache('volunteers'), volunteerController.deleteVolunteer);

// Public route for application
router.post('/apply', upload.single('image'), clearCache('volunteers'), volunteerController.applyVolunteer);

module.exports = router;