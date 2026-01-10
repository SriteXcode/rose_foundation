const Newsletter = require('../models/Newsletter');
const NewsletterHistory = require('../models/NewsletterHistory');
const sendEmail = require('../utils/emailService');

// Subscribe to newsletter
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const existing = await Newsletter.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already subscribed' });

    const subscription = new Newsletter({ email });
    await subscription.save();

    res.status(201).json({ message: 'Successfully subscribed!', subscriptionId: subscription._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to subscribe' });
  }
};

// Get all active subscribers
exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
};

// Get newsletter history
exports.getNewsletterHistory = async (req, res) => {
  try {
    const history = await NewsletterHistory.find().sort({ sentAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch newsletter history' });
  }
};

// Send Newsletter
exports.sendNewsletter = async (req, res) => {
  try {
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    const subscribers = await Newsletter.find({ isActive: true });
    
    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'No active subscribers found' });
    }

    // Send emails in parallel
    const emailPromises = subscribers.map(sub => 
      sendEmail(sub.email, {
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; padding:20px; color:#333;">
            <h2 style="color:#B22222;">${subject}</h2>
            <div style="white-space: pre-wrap;">${message}</div>
            <br/>
            <hr/>
            <p><small>You received this email because you subscribed to Black Rose Foundation updates.</small></p>
          </div>
        `
      }).catch(err => console.error(`Failed to send to ${sub.email}:`, err))
    );

    await Promise.all(emailPromises);

    // Save to history
    const historyEntry = new NewsletterHistory({
      subject,
      content: message,
      recipientCount: subscribers.length
    });
    await historyEntry.save();

    res.json({ 
      message: `Newsletter sent successfully to ${subscribers.length} subscribers!`,
      count: subscribers.length,
      historyId: historyEntry._id
    });

  } catch (error) {
    console.error('Newsletter send error:', error);
    res.status(500).json({ error: 'Failed to send newsletter' });
  }
};