const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadImage } = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Route to upload image
// Requires Admin authentication
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), uploadImage);

module.exports = router;