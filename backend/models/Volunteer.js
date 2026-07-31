const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, default: 'Volunteer' }, // Kept for backward compatibility
  image: { type: String, required: true }, // URL path to image
  email: { type: String },
  phone: { type: String },
  qualification: { type: String, default: '' },
  bio: { type: String, default: '' },
  socialMedia: {
    linkedin: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    github: { type: String, default: '' }
  },
  role: { type: String, enum: ['Volunteer', 'Intern', 'Team Leader'], default: 'Volunteer' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Volunteer', VolunteerSchema);