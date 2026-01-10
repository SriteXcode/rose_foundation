const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to DB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET,POST,PUT,DELETE,PATCH,HEAD",
  credentials: true,
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/works', require('./routes/workRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Organization info
app.get('/api/organization', (req, res) => {
  res.json({
    name: 'Black Rose Foundation',
    mission: 'To empower communities through sustainable development programs, education initiatives, healthcare support, and social welfare activities.',
    vision: 'To create a world where every individual has equal opportunities to thrive, regardless of their background or circumstances.',
    foundedYear: 2020,
    headquarters: 'Lucknow, Uttar Pradesh, India',
    website: 'www.blackrosefoundation.org.in',
    email: 'info@blackrosefoundation.org.in',
    phone: '+91 9876543210',
    address: '123 Foundation Street, Lucknow, UP 226001',
    bankDetails: {
      accountName: 'Black Rose Foundation',
      accountNumber: '1234567890123456',
      bankName: 'State Bank of India',
      branch: 'Lucknow Main Branch',
      ifscCode: 'SBIN0001234',
      swiftCode: 'SBININBB123'
    },
    socialMedia: {
      facebook: 'https://facebook.com/blackrosefoundation',
      twitter: 'https://twitter.com/blackrosefdn',
      instagram: 'https://instagram.com/blackrosefoundation',
      linkedin: 'https://linkedin.com/company/blackrosefoundation',
      youtube: 'https://youtube.com/blackrosefoundation'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Black Rose Foundation API is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});