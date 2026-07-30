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
  heroImagesMobile: [{ type: String }],
  activeCampaign: {
    title: { type: String, default: 'Emergency Relief & Empower Drive' },
    subtitle: { type: String, default: 'Urgent Campaign' },
    description: { type: String, default: 'Help us provide emergency winter kits, clean water, and educational tools to underprivileged children across rural communities.' },
    imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800' },
    targetAmount: { type: Number, default: 100000 },
    currentAmount: { type: Number, default: 45000 },
    buttonText: { type: String, default: 'Donate Now' },
    isActive: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);