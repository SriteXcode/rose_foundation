const Campaign = require('../models/Campaign');

// Get all campaigns (public)
exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('relatedBlogPost', 'title slug coverImage summary')
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
};

// Get active campaigns for popup
exports.getActiveCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: 'active' })
      .populate('relatedBlogPost', 'title slug coverImage summary');
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active campaigns' });
  }
};

// Create campaign (admin)
exports.createCampaign = async (req, res) => {
  try {
    const campaignData = { ...req.body };
    if (!campaignData.startDate || campaignData.startDate === '') delete campaignData.startDate;
    if (!campaignData.endDate || campaignData.endDate === '') delete campaignData.endDate;
    if (!campaignData.relatedBlogPost || campaignData.relatedBlogPost === '') campaignData.relatedBlogPost = null;

    const campaign = new Campaign(campaignData);
    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: error.message || 'Failed to create campaign' });
  }
};

// Update campaign (admin)
exports.updateCampaign = async (req, res) => {
  try {
    const campaignData = { ...req.body };
    if (!campaignData.startDate || campaignData.startDate === '') campaignData.startDate = undefined;
    if (!campaignData.endDate || campaignData.endDate === '') campaignData.endDate = undefined;
    if (!campaignData.relatedBlogPost || campaignData.relatedBlogPost === '') campaignData.relatedBlogPost = null;

    const campaign = await Campaign.findByIdAndUpdate(req.params.id, campaignData, { new: true });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json(campaign);
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: error.message || 'Failed to update campaign' });
  }
};

// Delete campaign (admin)
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
};
