// server.js - Main Express server
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); // ✅ bcrypt on backend
const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
  const corsOptions = {
    origin: "http://localhost:5173",
    methods: "GET,POST, PUT, DELETE, PATCH, HEAD",
    credentials:true,
  };

  app.use(cors(corsOptions))
// Middleware
// app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blackrose_foundation', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  password: { type: String, required: true },
  role: { type: String, default: "user" } // 'user' or 'admin'
}, { timestamps: true });

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

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

const NewsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const GallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

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

// Create models
const User = mongoose.model("User", userSchema);
const Contact = mongoose.model('Contact', ContactSchema);
const Donation = mongoose.model('Donation', DonationSchema);
const Newsletter = mongoose.model('Newsletter', NewsletterSchema);
const Gallery = mongoose.model('Gallery', GallerySchema);
const Work = mongoose.model('Work', WorkSchema);


// Middleware for authentication
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// Middleware for admin check
function adminMiddleware(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Black Rose Foundation API is running' });
});

// Register route
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword
    });

    res.json({ message: "Registered successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin dashboard route
app.get("/api/admin/dashboard", authMiddleware, adminMiddleware, async (req, res) => {
  // Example dummy data
  res.json({
    stats: {
      totalAmount: 50000,
      totalDonations: 25,
      totalContacts: 12,
      totalNewsletters: 40
    }
  });
});



// Contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const contact = new Contact({ name, email, message });
    await contact.save();
    
    console.log('New contact message received:', contact);
    res.status(201).json({ 
      message: 'Thank you for your message! We will get back to you soon.',
      contactId: contact._id 
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// Get all contact messages (admin only)
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Newsletter subscription
app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ email });
    if (existingSubscription) {
      return res.status(400).json({ error: 'Email already subscribed' });
    }

    const subscription = new Newsletter({ email });
    await subscription.save();
    
    res.status(201).json({ 
      message: 'Successfully subscribed to our newsletter!',
      subscriptionId: subscription._id 
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe to newsletter' });
  }
});

// Get newsletter subscribers (admin only)
app.get('/api/newsletter', async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
});

// Donation tracking
app.post('/api/donations', async (req, res) => {
  try {
    const { amount, donorName, donorEmail, donorPhone, transactionId } = req.body;
    
    if (!amount || !donorName || !donorEmail) {
      return res.status(400).json({ error: 'Amount, donor name, and email are required' });
    }

    const donation = new Donation({
      amount,
      donorName,
      donorEmail,
      donorPhone,
      transactionId,
      status: 'pending'
    });
    
    await donation.save();
    
    res.status(201).json({ 
      message: 'Donation recorded successfully!',
      donationId: donation._id 
    });
  } catch (error) {
    console.error('Donation recording error:', error);
    res.status(500).json({ error: 'Failed to record donation' });
  }
});

// Get donation statistics
app.get('/api/donations/stats', async (req, res) => {
  try {
    const totalDonations = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const monthlyDonations = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      totalAmount: totalDonations[0]?.total || 0,
      totalCount: totalDonations[0]?.count || 0,
      monthlyStats: monthlyDonations
    });
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    res.status(500).json({ error: 'Failed to fetch donation statistics' });
  }
});

// Get all donations (admin only)
app.get('/api/donations', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// Gallery management
app.post('/api/gallery', async (req, res) => {
  try {
    const { title, description, imageUrl, category } = req.body;
    
    if (!title || !imageUrl || !category) {
      return res.status(400).json({ error: 'Title, image URL, and category are required' });
    }

    const galleryItem = new Gallery({ title, description, imageUrl, category });
    await galleryItem.save();
    
    res.status(201).json({ 
      message: 'Gallery item added successfully!',
      item: galleryItem 
    });
  } catch (error) {
    console.error('Gallery item creation error:', error);
    res.status(500).json({ error: 'Failed to add gallery item' });
  }
});

// Get gallery items
app.get('/api/gallery', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    
    const galleryItems = await Gallery.find(filter).sort({ createdAt: -1 });
    res.json(galleryItems);
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

// Works/Projects management
app.post('/api/works', async (req, res) => {
  try {
    const { title, description, category, location, beneficiaries, status, images, startDate, endDate } = req.body;
    
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }

    const work = new Work({
      title,
      description,
      category,
      location,
      beneficiaries,
      status,
      images,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    });
    
    await work.save();
    
    res.status(201).json({ 
      message: 'Work/Project added successfully!',
      work: work 
    });
  } catch (error) {
    console.error('Work creation error:', error);
    res.status(500).json({ error: 'Failed to add work/project' });
  }
});

// Get works/projects
app.get('/api/works', async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    
    const works = await Work.find(filter).sort({ createdAt: -1 });
    res.json(works);
  } catch (error) {
    console.error('Error fetching works:', error);
    res.status(500).json({ error: 'Failed to fetch works' });
  }
});

// Get work statistics
app.get('/api/works/stats', async (req, res) => {
  try {
    const totalBeneficiaries = await Work.aggregate([
      { $group: { _id: null, total: { $sum: '$beneficiaries' } } }
    ]);

    const projectsByCategory = await Work.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const projectsByStatus = await Work.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      totalBeneficiaries: totalBeneficiaries[0]?.total || 0,
      projectsByCategory,
      projectsByStatus
    });
  } catch (error) {
    console.error('Error fetching work stats:', error);
    res.status(500).json({ error: 'Failed to fetch work statistics' });
  }
});

// Organization info endpoint
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

// Error handling middleware
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
  console.log(`Black Rose Foundation API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});