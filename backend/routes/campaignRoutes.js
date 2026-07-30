const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { cacheMiddleware, clearCache } = require('../middleware/cacheMiddleware');

router.get('/', cacheMiddleware(3600000), campaignController.getCampaigns);
router.get('/active', cacheMiddleware(3600000), campaignController.getActiveCampaigns);
router.post('/', authMiddleware, adminMiddleware, clearCache('campaigns'), campaignController.createCampaign);
router.put('/:id', authMiddleware, adminMiddleware, clearCache('campaigns'), campaignController.updateCampaign);
router.delete('/:id', authMiddleware, adminMiddleware, clearCache('campaigns'), campaignController.deleteCampaign);

module.exports = router;

