const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  summary: {
    type: String,
    required: true,
    maxLength: 300 // Brief excerpt for listing
  },
  content: {
    type: String,
    required: true // Can store HTML from rich text editor
  },
  coverImage: {
    type: String,
    required: true
  },
  author: {
    type: String,
    default: 'Admin'
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  authorRole: {
    type: String,
    enum: ['admin', 'fundraiser', 'volunteer'],
    default: 'admin'
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer'
  },
  volunteerCode: {
    type: String,
    index: true
  },
  volunteerName: {
    type: String
  },
  volunteerImage: {
    type: String
  },
  volunteerUpiId: {
    type: String
  },
  showDonationCard: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected'],
    default: 'published',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update 'updatedAt' on save
BlogPostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BlogPost', BlogPostSchema);