const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { cacheMiddleware, clearCache } = require('../middleware/cacheMiddleware');

// Public Routes (Cached)
router.get('/', cacheMiddleware(3600000), blogController.getAllPosts); // 1 hour cache
router.get('/:slug', cacheMiddleware(3600000), blogController.getPostBySlug);

// Admin Routes (Protected - Clear cache on change)
router.post('/', authMiddleware, adminMiddleware, clearCache('blog'), blogController.createPost);
router.put('/:id', authMiddleware, adminMiddleware, clearCache('blog'), blogController.updatePost);
router.delete('/:id', authMiddleware, adminMiddleware, clearCache('blog'), blogController.deletePost);

module.exports = router;