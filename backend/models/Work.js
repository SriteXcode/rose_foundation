const mongoose = require('mongoose');

const WorkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String },
  beneficiaries: { type: Number, default: 0 },
  status: { type: String, enum: ['ongoing', 'completed', 'planned'], default: 'ongoing' },
  images: [{ type: String }],
  startDate: { type: Date },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Work', WorkSchema);