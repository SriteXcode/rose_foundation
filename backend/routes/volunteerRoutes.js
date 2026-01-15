const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', volunteerController.getVolunteers);
router.post('/', authMiddleware, adminMiddleware, volunteerController.addVolunteer);
router.put('/:id', authMiddleware, adminMiddleware, volunteerController.updateVolunteer);
router.delete('/:id', authMiddleware, adminMiddleware, volunteerController.deleteVolunteer);

module.exports = router;