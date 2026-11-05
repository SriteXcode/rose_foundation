const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || 'BAiZJjKX6wSg0OeyHcvT2TswjFab_k4qvlz2f3JZItV9VlyZ2GbzTMh7jhuEvV3MAoTim7SMcYPxF6E8IidZRGA';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 'nV9CgySpXRV3Y6jRndjw6jIMLB3IQqA3v2EwF_Wc3Eg';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:blackrosefoundation111@gmail.com';

try {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} catch (err) {
  console.error('Error setting VAPID details for web-push:', err.message);
}

/**
 * Send a web push notification to subscribed clients
 * @param {object} payload - { title, body, url, icon }
 * @param {string} targetRole - 'admin' or null for all
 */
const sendPushNotification = async (payload, targetRole = 'admin') => {
  try {
    const filter = targetRole ? { role: targetRole } : {};
    const subscriptions = await PushSubscription.find(filter);

    if (!subscriptions || subscriptions.length === 0) {
      console.log('ℹ️ Web Push: No active push subscriptions found for target role:', targetRole);
      return { sent: 0, total: 0 };
    }

    const payloadString = JSON.stringify({
      title: payload.title || 'Black Rose Foundation',
      body: payload.body || 'New contact inquiry received',
      icon: payload.icon || '/blackrose_logo.png',
      url: payload.url || '/admin',
      timestamp: Date.now()
    });

    let successCount = 0;
    const promises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth
          }
        }, payloadString);
        successCount++;
      } catch (err) {
        // If the subscription is gone or expired (404 / 410), delete it from the database
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log(`🗑️ Removing expired push subscription [${sub._id}]`);
          await PushSubscription.findByIdAndDelete(sub._id);
        } else {
          console.error(`⚠️ Web Push failed for device [${sub._id}]:`, err.message);
        }
      }
    });

    await Promise.allSettled(promises);
    console.log(`✅ Web Push sent to ${successCount}/${subscriptions.length} subscribed devices`);
    return { sent: successCount, total: subscriptions.length };
  } catch (error) {
    console.error('❌ Error in sendPushNotification:', error);
    return { error: error.message };
  }
};

module.exports = {
  sendPushNotification,
  vapidPublicKey
};
