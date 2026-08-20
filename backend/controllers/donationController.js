const Donation = require('../models/Donation');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');

// Record donation
exports.addDonation = async (req, res) => {
  try {
    let { amount, donorName, donorEmail, donorPhone, transactionId, donor, volunteerId, volunteerCode, volunteerName } = req.body;
    
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

    let resolvedVolunteer = null;

    if (volunteerId) {
      try {
        resolvedVolunteer = await Volunteer.findById(volunteerId);
      } catch (err) {}
    }

    const lookupCode = (volunteerCode || req.body.fundraiserCode || '').trim();
    if (!resolvedVolunteer && lookupCode) {
      try {
        resolvedVolunteer = await Volunteer.findOne({
          $or: [
            { volunteerCode: lookupCode.toUpperCase() },
            { fundraiserCode: lookupCode.toUpperCase() }
          ]
        });
      } catch (volErr) {
        console.error('Error resolving volunteer in addDonation:', volErr);
      }
    }

    const resolvedVolunteerId = resolvedVolunteer ? resolvedVolunteer._id : (volunteerId || null);
    const resolvedVolunteerCode = resolvedVolunteer ? (resolvedVolunteer.volunteerCode || resolvedVolunteer.fundraiserCode) : (volunteerCode || null);
    const resolvedFundraiserCode = resolvedVolunteer ? (resolvedVolunteer.fundraiserCode || resolvedVolunteer.volunteerCode) : (req.body.fundraiserCode || null);
    const resolvedVolunteerName = resolvedVolunteer ? resolvedVolunteer.name : (volunteerName || null);

    const donation = new Donation({
      amount: Number(amount), 
      donorName, 
      donorEmail, 
      donorPhone, 
      donorId: donor?.userId || req.body.donorId || null,
      volunteerId: resolvedVolunteerId,
      volunteerCode: resolvedVolunteerCode,
      fundraiserCode: resolvedFundraiserCode,
      volunteerName: resolvedVolunteerName,
      razorpayQrId: resolvedVolunteer?.razorpayQrId || '',
      transactionId: transactionId || `TXN_${Date.now()}`, 
      status: req.body.status || 'completed'
    });

    await donation.save();

    if (resolvedVolunteerId && donation.status === 'completed') {
      try {
        await Volunteer.findByIdAndUpdate(resolvedVolunteerId, {
          $inc: { totalRaised: Number(amount) }
        });
      } catch (volUpdateErr) {
        console.error('Failed to increment volunteer totalRaised:', volUpdateErr);
      }
    }

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
