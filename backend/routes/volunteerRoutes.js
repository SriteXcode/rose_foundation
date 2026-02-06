const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Import upload middleware

router.get('/', volunteerController.getVolunteers);
router.post('/', authMiddleware, adminMiddleware, volunteerController.addVolunteer);
router.put('/:id', authMiddleware, adminMiddleware, volunteerController.updateVolunteer);
router.delete('/:id', authMiddleware, adminMiddleware, volunteerController.deleteVolunteer);

// Public route for application
router.post('/apply', upload.single('image'), volunteerController.applyVolunteer);

module.exports = router;