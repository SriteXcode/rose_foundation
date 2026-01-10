const Donation = require('../models/Donation');
const User = require('../models/User');

// Record donation
exports.addDonation = async (req, res) => {
  try {
    let { amount, donorName, donorEmail, donorPhone, transactionId, donor } = req.body;
    
    // Handle frontend payload structure
    if (donor && donor.userId) {
      try {
        const user = await User.findById(donor.userId);
        if (user) {
          donorName = user.name;
          donorEmail = user.email;
          donorPhone = user.phone;
        }
      } catch (err) {
        console.error('Error fetching user for donation:', err);
      }
    }

    // Default for anonymous or missing details
    if (!donorName) donorName = 'Anonymous';
    if (!donorEmail) donorEmail = 'anonymous@example.com';

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
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
    res.status(201).json({ message: 'Donation recorded successfully!', donationId: donation._id });
  } catch (error) {
    console.error('Donation recording error:', error);
    res.status(500).json({ error: 'Failed to record donation' });
  }
};

// Get donation stats
exports.getDonationStats = async (req, res) => {
  try {
    const totalDonations = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const monthlyDonations = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
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
    res.status(500).json({ error: 'Failed to fetch donation statistics' });
  }
};

// Get all donations (admin)
exports.getDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
};
