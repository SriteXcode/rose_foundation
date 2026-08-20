const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, default: 'Volunteer' }, // Kept for backward compatibility
  image: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' }, // URL path to image
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
  showOnHome: { type: Boolean, default: true, index: true },
  volunteerCode: { type: String, unique: true, sparse: true, index: true },
  qrCode: { type: String, default: '' },
  totalRaised: { type: Number, default: 0 },
  // Fundraiser Privileges & Dual QR Management
  isFundraiser: { type: Boolean, default: false, index: true },
  fundraiserCode: { type: String, unique: true, sparse: true, index: true },
  razorpayQrId: { type: String, index: true, default: '' },
  upiId: { type: String, default: '' },
  directPaymentQrImage: { type: String, default: '' },
  ledgerQrCode: { type: String, default: '' },
  fundraiserGoal: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Volunteer', VolunteerSchema);