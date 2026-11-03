// client/src/utils/pushNotifications.js
import axiosInstance from './api';

const DEFAULT_VAPID_PUBLIC_KEY = 'BAiZJjKX6wSg0OeyHcvT2TswjFab_k4qvlz2f3JZItV9VlyZ2GbzTMh7jhuEvV3MAoTim7SMcYPxF6E8IidZRGA';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const isPushSupported = () => {
  return typeof window !== 'undefined' && 
    'serviceWorker' in navigator && 
    'PushManager' in window && 
    'Notification' in window;
};

export const getPushSubscription = async () => {
  if (!isPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.error('Error getting push subscription:', err);
    return null;
  }
};

export const subscribeToPush = async () => {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported in this browser.');
  }

  // Request browser permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(
      permission === 'denied' 
        ? 'Notification permission was denied. Please allow notifications in your browser site settings.' 
        : 'Notification permission was dismissed.'
    );
  }

  // Register the push service worker
  let registration;
  try {
    registration = await navigator.serviceWorker.register('/sw-push.js', { scope: '/' });
    await navigator.serviceWorker.ready;
  } catch (swErr) {
    console.warn('Standalone sw-push.js registration failed, falling back to ready SW:', swErr);
    registration = await navigator.serviceWorker.ready;
  }

  // Fetch VAPID key
  let vapidKey = DEFAULT_VAPID_PUBLIC_KEY;
  try {
    const res = await axiosInstance.get('/notifications/vapid-key');
    if (res.data?.publicKey) {
      vapidKey = res.data.publicKey;
    }
  } catch (err) {
    console.warn('Using default VAPID public key:', err.message);
  }

  const applicationServerKey = urlBase64ToUint8Array(vapidKey);

  // Subscribe with PushManager
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey
  });

  // Save to backend
  await axiosInstance.post('/notifications/subscribe', {
    subscription: subscription.toJSON()
  });

  return subscription;
};

export const unsubscribeFromPush = async () => {
  if (!isPushSupported()) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();

    try {
      await axiosInstance.post('/notifications/unsubscribe', { endpoint });
    } catch (err) {
      console.warn('Failed to notify backend of unsubscription:', err.message);
    }
  }
};

export const sendTestPush = async () => {
  const res = await axiosInstance.post('/notifications/test');
  return res.data;
};
