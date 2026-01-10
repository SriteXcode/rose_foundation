const mongoose = require('mongoose');

const NewsletterHistorySchema = new mongoose.Schema({
  subject: { type: String, required: true },
  content: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  recipientCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('NewsletterHistory', NewsletterHistorySchema);