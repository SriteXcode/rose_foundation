const Campaign = require('../models/Campaign');

// Helper to determine the effective end date/time
const getEffectiveEndDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  // If stored with no specific time (00:00:00 UTC, typical for date-only inputs),
  // allow the campaign to run through the end of that day (23:59:59.999 UTC)
  if (d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 0) {
    d.setUTCHours(23, 59, 59, 999);
  }
  return d;
};

// Auto-complete campaigns whose end date has passed
const updateExpiredCampaigns = async () => {
  try {
    const now = new Date();
    const activeWithEndDate = await Campaign.find({
      status: 'active',
      endDate: { $exists: true, $ne: null }
    });

    const expiredIds = [];
    for (const camp of activeWithEndDate) {
      const effectiveEnd = getEffectiveEndDate(camp.endDate);
      if (effectiveEnd && now > effectiveEnd) {
        expiredIds.push(camp._id);
      }
    }

    if (expiredIds.length > 0) {
      await Campaign.updateMany(
        { _id: { $in: expiredIds } },
        { $set: { status: 'completed' } }
      );
    }
  } catch (err) {
    console.error('Error auto-completing expired campaigns:', err);
  }
};

// Get all campaigns (public)
exports.getCampaigns = async (req, res) => {
  try {
    await updateExpiredCampaigns();

    const campaigns = await Campaign.find()
      .populate('relatedBlogPost', 'title slug coverImage summary')
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
};

// Get active campaigns for popup
exports.getActiveCampaigns = async (req, res) => {
  try {
    await updateExpiredCampaigns();

    const now = new Date();
    // Only query campaigns with status 'active' and popup not disabled
    const campaigns = await Campaign.find({
      status: 'active',
      isPopup: { $ne: false }
    }).populate('relatedBlogPost', 'title slug coverImage summary');

    // Strict filter: exclude any campaign whose end date has passed
    const activeCampaigns = campaigns.filter(camp => {
      if (camp.status !== 'active') return false;
      if (camp.endDate) {
        const effectiveEnd = getEffectiveEndDate(camp.endDate);
        if (effectiveEnd && now > effectiveEnd) return false;
      }
      return true;
    });

    res.json(activeCampaigns);
  } catch (error) {
    console.error('Failed to fetch active campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch active campaigns' });
  }
};

// Create campaign (admin)
exports.createCampaign = async (req, res) => {
  try {
    const campaignData = { ...req.body };
    if (!campaignData.startDate || campaignData.startDate === '') campaignData.startDate = null;
    if (!campaignData.endDate || campaignData.endDate === '') campaignData.endDate = null;
    if (!campaignData.relatedBlogPost || campaignData.relatedBlogPost === '') campaignData.relatedBlogPost = null;

    // If an endDate in the past was given and status is active, mark it completed
    if (campaignData.endDate && campaignData.status === 'active') {
      const effectiveEnd = getEffectiveEndDate(campaignData.endDate);
      if (effectiveEnd && new Date() > effectiveEnd) {
        campaignData.status = 'completed';
      }
    }

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
    if (!campaignData.startDate || campaignData.startDate === '') campaignData.startDate = null;
    if (!campaignData.endDate || campaignData.endDate === '') campaignData.endDate = null;
    if (!campaignData.relatedBlogPost || campaignData.relatedBlogPost === '') campaignData.relatedBlogPost = null;

    // If an endDate in the past was given and status is active, mark it completed
    if (campaignData.endDate && campaignData.status === 'active') {
      const effectiveEnd = getEffectiveEndDate(campaignData.endDate);
      if (effectiveEnd && new Date() > effectiveEnd) {
        campaignData.status = 'completed';
      }
    }

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
