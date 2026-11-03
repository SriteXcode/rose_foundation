const PushSubscription = require('../models/PushSubscription');
const { sendPushNotification, vapidPublicKey } = require('../utils/pushNotificationService');

// Get VAPID public key
exports.getVapidPublicKey = (req, res) => {
  res.json({ publicKey: vapidPublicKey });
};

// Subscribe a device
exports.subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Valid subscription object is required' });
    }

    const { endpoint, keys, expirationTime } = subscription;
    const role = req.user?.role || 'admin';
    const userId = req.user?._id || null;
    const userAgent = req.headers['user-agent'] || '';

    const updated = await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        endpoint,
        keys,
        expirationTime,
        role,
        user: userId,
        userAgent,
        createdAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Subscribed to push notifications successfully', id: updated._id });
  } catch (error) {
    console.error('Push subscribe error:', error);
    res.status(500).json({ error: 'Failed to save push subscription' });
  }
};

// Unsubscribe a device
exports.unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }

    await PushSubscription.findOneAndDelete({ endpoint });
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
};

// Send a test push notification
exports.sendTestNotification = async (req, res) => {
  try {
    const result = await sendPushNotification({
      title: '🔔 Test Notification: Black Rose Foundation',
      body: 'Web push notifications are working perfectly on this device!',
      url: '/admin'
    }, 'admin');

    res.json({ message: 'Test notification triggered', result });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
};
