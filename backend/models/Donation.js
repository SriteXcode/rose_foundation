const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  donorName: { type: String, required: true },
  donorEmail: { type: String, required: true },
  donorPhone: { type: String },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', default: null },
  volunteerCode: { type: String, index: true, default: null },
  volunteerName: { type: String, default: null },
  fundraiserCode: { type: String, index: true, default: null },
  razorpayQrId: { type: String, index: true, default: '' },
  paymentMethod: { type: String, default: 'Bank Transfer' },
  paymentSource: { type: String, enum: ['gateway', 'razorpay_qr', 'bank_transfer'], default: 'gateway' },
  transactionId: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', DonationSchema);