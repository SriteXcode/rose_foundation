const Settings = require('../models/Settings');

// Get settings (public)
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// Update settings (admin only)
exports.updateSettings = async (req, res) => {
  try {
    const { siteName, contactEmail, contactPhone, address, socialLinks } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    settings.siteName = siteName || settings.siteName;
    settings.contactEmail = contactEmail || settings.contactEmail;
    settings.contactPhone = contactPhone || settings.contactPhone;
    settings.address = address || settings.address;
    if (socialLinks) {
      settings.socialLinks = { ...settings.socialLinks, ...socialLinks };
    }

    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};