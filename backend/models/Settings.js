const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Black Rose Foundation' },
  contactEmail: { type: String, default: 'info@blackrosefoundation.org.in' },
  contactPhone: { type: String, default: '+91 9876543210' },
  address: { type: String, default: '123 Foundation Street, Lucknow, UP 226001' },
  socialLinks: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  heroImagesDesktop: [{ type: String }],
  heroImagesMobile: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);