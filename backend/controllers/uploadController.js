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

    // Delete local file
    fs.unlinkSync(req.file.path);

    res.json({ 
      message: 'File uploaded successfully to Cloudinary', 
      imageUrl: result.secure_url 
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Try to delete local file even if upload fails
    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
  }
};