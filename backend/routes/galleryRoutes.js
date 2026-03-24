const express = require('express');
const { addGalleryItem, getGalleryItems, deleteGalleryItem } = require('../controllers/galleryController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { cacheMiddleware, clearCache } = require('../middleware/cacheMiddleware');

const router = express.Router();

router.get('/', cacheMiddleware(3600000), getGalleryItems);

router.post('/', authMiddleware, adminMiddleware, clearCache('gallery'), addGalleryItem);
router.delete('/:id', authMiddleware, adminMiddleware, clearCache('gallery'), deleteGalleryItem);

module.exports = router;
