const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public Routes
router.get('/', blogController.getAllPosts);
router.get('/:slug', blogController.getPostBySlug);

// Admin Routes (Protected)
router.post('/', authMiddleware, adminMiddleware, blogController.createPost);
router.put('/:id', authMiddleware, adminMiddleware, blogController.updatePost);
router.delete('/:id', authMiddleware, adminMiddleware, blogController.deletePost);

module.exports = router;