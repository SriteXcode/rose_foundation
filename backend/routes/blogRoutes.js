const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { clearCache } = require('../middleware/cacheMiddleware');

// Public Routes (Live DB)
router.get('/', blogController.getAllPosts);

// Authenticated: Volunteer's Own Articles (pending, published, draft)
router.get('/my-posts', authMiddleware, blogController.getMyPosts);

// Admin: All Articles with Approval Statuses & Counts
router.get('/admin/all', authMiddleware, adminMiddleware, blogController.adminGetAllPosts);

// Public / Preview: Single Article by Slug
router.get('/:slug', blogController.getPostBySlug);

// Create Article (Admin publishes live; Volunteer submits for admin approval)
router.post('/', authMiddleware, clearCache('blog'), blogController.createPost);

// Update Article (Admin or Author)
router.put('/:id', authMiddleware, clearCache('blog'), blogController.updatePost);

// Admin Approval Actions
router.put('/:id/approve', authMiddleware, adminMiddleware, clearCache('blog'), blogController.approvePost);
router.put('/:id/reject', authMiddleware, adminMiddleware, clearCache('blog'), blogController.rejectPost);

// Delete Article (Admin or Author)
router.delete('/:id', authMiddleware, clearCache('blog'), blogController.deletePost);

module.exports = router;