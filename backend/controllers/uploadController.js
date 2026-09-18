const cloudinary = require('../config/cloudinary');
const fs = require('fs');

exports.uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'rose_foundation',
    });

    // Delete local file safely
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (unlinkErr) {
      console.warn('Could not delete temporary file:', unlinkErr.message);
    }

    return res.json({ 
      message: 'File uploaded successfully to Cloudinary', 
      imageUrl: result.secure_url 
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Try to delete local file even if upload fails
    try {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (unlinkErr) {
      console.warn('Could not delete temporary file on error:', unlinkErr.message);
    }

    return res.status(500).json({ error: error.message || 'Failed to upload image to Cloudinary' });
  }
};