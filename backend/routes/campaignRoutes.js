const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', campaignController.getCampaigns);
router.get('/active', campaignController.getActiveCampaigns);
router.post('/', authMiddleware, adminMiddleware, campaignController.createCampaign);
router.put('/:id', authMiddleware, adminMiddleware, campaignController.updateCampaign);
router.delete('/:id', authMiddleware, adminMiddleware, campaignController.deleteCampaign);

module.exports = router;
