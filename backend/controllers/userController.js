const User = require('../models/User');
const Donation = require('../models/Donation');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get user donations
exports.getUserDonations = async (req, res) => {
  try {
    // req.user from token only has id and role. We need to fetch the user to get the email.
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const donations = await Donation.find({ 
      $or: [
        { donorId: req.user.id },
        { donorEmail: user.email }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(donations);
  } catch (error) {
    console.error('Get User Donations Error:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
};