const Donation = require('../models/Donation');
const Contact = require('../models/Contact');
const Newsletter = require('../models/Newsletter');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
  try {
    const [
      totalDonationsAmount,
      totalDonationsCount,
      totalContacts,
      totalNewsletters,
      totalUsers,
      recentDonations,
      recentContacts
    ] = await Promise.all([
      Donation.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Donation.countDocuments(),
      Contact.countDocuments(),
      Newsletter.countDocuments(),
      User.countDocuments(),
      Donation.find().sort({ createdAt: -1 }).limit(5),
      Contact.find().sort({ createdAt: -1 }).limit(5)
    ]);

    const stats = {
      totalAmount: totalDonationsAmount[0]?.total || 0,
      totalDonations: totalDonationsCount,
      totalContacts: totalContacts,
      totalNewsletters: totalNewsletters,
      totalUsers: totalUsers
    };

    res.json({
      stats,
      donations: recentDonations,
      contacts: recentContacts
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({ error: 'Failed to fetch admin dashboard data' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;
    
    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, phone, role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};
