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
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
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