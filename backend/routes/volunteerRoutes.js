const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Import upload middleware
const { cacheMiddleware, clearCache } = require('../middleware/cacheMiddleware');

router.get('/', volunteerController.getVolunteers);
router.get('/code/:code', volunteerController.getVolunteerByCode);
router.get('/dashboard/:code', volunteerController.getVolunteerDashboard);
router.get('/my-portal', authMiddleware, volunteerController.getMyVolunteerPortal);
router.post('/', authMiddleware, adminMiddleware, clearCache('volunteers'), volunteerController.addVolunteer);
router.put('/:id', authMiddleware, adminMiddleware, clearCache('volunteers'), volunteerController.updateVolunteer);
router.put('/:id/toggle-home', authMiddleware, adminMiddleware, clearCache('volunteers'), volunteerController.toggleShowOnHome);
router.delete('/:id', authMiddleware, adminMiddleware, clearCache('volunteers'), volunteerController.deleteVolunteer);

// Fundraiser specific management routes (Admin)
router.get('/fundraisers/list', authMiddleware, adminMiddleware, volunteerController.getFundraisers);
router.post('/fundraisers', authMiddleware, adminMiddleware, clearCache('volunteers'), volunteerController.addFundraiser);
router.post('/fundraisers/promote/:id', authMiddleware, adminMiddleware, clearCache('volunteers'), volunteerController.promoteToFundraiser);
router.post('/fundraisers/generate-razorpay-qr', authMiddleware, adminMiddleware, volunteerController.generateRazorpayQrCode);
router.put('/fundraisers/:id', authMiddleware, adminMiddleware, clearCache('volunteers'), volunteerController.updateFundraiser);
router.delete('/fundraisers/:id/demote', authMiddleware, adminMiddleware, clearCache('volunteers'), volunteerController.demoteFundraiser);

// Public route for application
router.post('/apply', upload.single('image'), clearCache('volunteers'), volunteerController.applyVolunteer);

module.exports = router;