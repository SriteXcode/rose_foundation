const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackrose_foundation';
  
  if (!process.env.MONGODB_URI) {
    console.warn("⚠️ WARNING: MONGODB_URI is not set in environment variables! Falling back to local database.");
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected`);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
  }
};

module.exports = connectDB;
