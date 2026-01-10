const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  donorName: { type: String, required: true },
  donorEmail: { type: String, required: true },
  donorPhone: { type: String },
  paymentMethod: { type: String, default: 'Bank Transfer' },
  transactionId: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', DonationSchema);