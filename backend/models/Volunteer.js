const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, default: 'Volunteer' }, // Kept for backward compatibility
  image: { type: String, required: true }, // URL path to image
  email: { type: String },
  phone: { type: String },
  aadhar: { type: String },
  role: { type: String, enum: ['Volunteer', 'Intern'], default: 'Volunteer' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Volunteer', VolunteerSchema);