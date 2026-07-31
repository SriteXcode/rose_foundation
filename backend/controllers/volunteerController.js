const Volunteer = require('../models/Volunteer');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Add volunteer (Admin Manual Add)
exports.addVolunteer = async (req, res) => {
  try {
    const { name, designation, image, role, email, phone, aadhar, qualification, bio, socialMedia, linkedin, instagram, twitter, github, status } = req.body;
    if (!name || !image) {
      return res.status(400).json({ error: 'Name and image are required' });
    }

    const volunteer = new Volunteer({
      name, 
      designation: designation || role || 'Volunteer', 
      image,
      role: role || 'Volunteer',
      email,
      phone,
      aadhar,
      qualification: qualification || '',
      bio: bio || '',
      socialMedia: {
        linkedin: socialMedia?.linkedin || linkedin || '',
        instagram: socialMedia?.instagram || instagram || '',
        twitter: socialMedia?.twitter || twitter || '',
        github: socialMedia?.github || github || ''
      },
      status: status || 'approved' // Manually added by admin are approved by default
    });

    await volunteer.save();
    res.status(201).json({ message: 'Volunteer added!', volunteer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add volunteer' });
  }
};

// Apply Volunteer (Public Endpoint)
exports.applyVolunteer = async (req, res) => {
  try {
    const { name, email, phone, aadhar, role, qualification, bio, linkedin, instagram, twitter, github } = req.body;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    if (!name || !email || !phone || !aadhar) {
      // Clean up uploaded file if validation fails
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'All fields are required' });
    }

    let imageUrl = '';
    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'rose_foundation/volunteers',
        resource_type: 'image'
      });
      imageUrl = result.secure_url;

      // Delete local file after successful upload
      fs.unlinkSync(req.file.path);
    } catch (uploadError) {
      console.error("Cloudinary upload failed:", uploadError);
      // Try to clean up local file
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    const volunteer = new Volunteer({
      name,
      email,
      phone,
      aadhar,
      qualification: qualification || '',
      bio: bio || '',
      socialMedia: {
        linkedin: linkedin || '',
        instagram: instagram || '',
        twitter: twitter || '',
        github: github || ''
      },
      role: role || 'Volunteer',
      designation: role || 'Volunteer', // Default designation to role
      image: imageUrl, // Save Cloudinary URL
      status: 'pending' // Default status for applications
    });

    await volunteer.save();
    res.status(201).json({ message: 'Application submitted successfully!', volunteer });
  } catch (error) {
    console.error("Application Error:", error);
    // Cleanup is handled in specific blocks, but redundant safety check here wouldn't hurt if we had scope access to file path
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

// Get volunteers (Admin supports filtering)
exports.getVolunteers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    } else {
      // Default to approved for public view, including existing members created before status field was introduced
      query.$or = [{ status: 'approved' }, { status: { $exists: false } }];
    }

    // Pending applications in admin panel are sorted newest-first (-1).
    // Approved team members are sorted createdAt ascending (1) so new members are placed at the end (far right side).
    const sortOrder = status === 'pending' ? { createdAt: -1 } : { createdAt: 1 };

    const volunteers = await Volunteer.find(query)
      .sort(sortOrder)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Volunteer.countDocuments(query);

    res.json({
      volunteers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalVolunteers: count
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
};

// Update volunteer
exports.updateVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedVolunteer = await Volunteer.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedVolunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    
    res.json({ message: 'Volunteer updated successfully', volunteer: updatedVolunteer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update volunteer' });
  }
};

// Delete volunteer
exports.deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVolunteer = await Volunteer.findByIdAndDelete(id);
    
    if (!deletedVolunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    
    res.json({ message: 'Volunteer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete volunteer' });
  }
};