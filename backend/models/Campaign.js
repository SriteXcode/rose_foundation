const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: 'Featured Initiative' },
  description: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  targetAmount: { type: Number, default: 100000 },
  currentAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  relatedBlogPost: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', default: null },
  externalLink: { type: String, default: '' },
  buttonText: { type: String, default: 'Donate Now' },
  isPopup: { type: Boolean, default: true },
  startDate: { type: Date, required: false },
  endDate: { type: Date, required: false }
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
