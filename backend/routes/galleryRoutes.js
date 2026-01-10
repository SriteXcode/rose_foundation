const express = require('express');
const { addGalleryItem, getGalleryItems, deleteGalleryItem } = require('../controllers/galleryController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/', authMiddleware, adminMiddleware, addGalleryItem);
router.get('/', getGalleryItems);
router.delete('/:id', authMiddleware, adminMiddleware, deleteGalleryItem);

module.exports = router;
