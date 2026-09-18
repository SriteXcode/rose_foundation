const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadImage } = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to upload image
// Allows authenticated users (Volunteers, Fundraisers, Admins) to upload images
router.post('/', authMiddleware, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ error: err.message || 'Error processing image file' });
    }
    next();
  });
}, uploadImage);

module.exports = router;