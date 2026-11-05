import toast from 'react-hot-toast';

export const DEFAULT_UPI_ID = '251908200515@indus';
export const DEFAULT_PAYEE_NAME = 'Blackrose Foundation';

export const isMobileDevice = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i;
  return mobileRegex.test(ua) || (isTouch && window.innerWidth <= 1024);
};

export const isAndroid = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent || '');
};

export const isIOS = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent || '');
};

/**
 * Builds standard NPCI-compliant UPI URI & Android Intents
 * app: 'universal' | 'phonepe' | 'gpay' | 'paytm'
 */
export const buildUpiUrl = ({ upiId, payeeName, amount, note, app = 'universal' } = {}) => {
  const cleanUpi = (upiId && upiId.trim()) || DEFAULT_UPI_ID;
  const cleanName = (payeeName && payeeName.trim()) || DEFAULT_PAYEE_NAME;
  const parsedAmt = amount ? parseFloat(amount) : null;

  let query = `pa=${encodeURIComponent(cleanUpi)}&pn=${encodeURIComponent(cleanName)}&cu=INR`;
  if (parsedAmt && parsedAmt > 0) {
    query += `&am=${parsedAmt.toFixed(2)}`;
  }
  query += `&tn=${encodeURIComponent(note || 'Donation to ' + cleanName)}`;

  const android = isAndroid();

  switch (app) {
    case 'phonepe':
      return android 
        ? `intent://pay?${query}#Intent;scheme=upi;package=com.phonepe.app;end` 
        : `phonepe://pay?${query}`;
    case 'gpay':
      return android 
        ? `intent://pay?${query}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end` 
        : `gpay://upi/pay?${query}`;
    case 'paytm':
      return android 
        ? `intent://pay?${query}#Intent;scheme=upi;package=net.one97.paytm;end` 
        : `paytmmp://pay?${query}`;
    case 'universal':
    default:
      return android
        ? `intent://pay?${query}#Intent;scheme=upi;end`
        : `upi://pay?${query}`;
  }
};

/**
 * Universal execution method for UPI payment intent
 */
export const triggerUpiPayment = ({
  upiId,
  payeeName,
  amount,
  note,
  app = 'universal',
  onDesktopFallback
} = {}) => {
  const cleanUpi = (upiId && upiId.trim()) || DEFAULT_UPI_ID;
  const cleanName = (payeeName && payeeName.trim()) || DEFAULT_PAYEE_NAME;

  // 1. Always copy UPI ID to clipboard immediately
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cleanUpi);
    }
  } catch (err) {
    console.warn('Clipboard write error:', err);
  }

  const mobile = isMobileDevice();

  if (!mobile) {
    toast.success(`UPI ID copied: ${cleanUpi}`);
    if (typeof onDesktopFallback === 'function') {
      onDesktopFallback();
    } else {
      window.dispatchEvent(new CustomEvent('openDesktopOnlinePay', {
        detail: { amount: amount || '500', upiId: cleanUpi }
      }));
    }
    return null;
  }

  // On Mobile: trigger intent
  const upiUrl = buildUpiUrl({ upiId: cleanUpi, payeeName: cleanName, amount, note, app });
  const appNames = {
    phonepe: 'PhonePe',
    gpay: 'Google Pay',
    paytm: 'Paytm',
    universal: 'UPI App'
  };

  toast.success(`Opening ${appNames[app] || 'UPI App'}... (UPI ID copied)`);

  try {
    window.location.href = upiUrl;
  } catch (err) {
    console.warn('Navigation error, fallback to assign:', err);
    try {
      window.location.assign(upiUrl);
    } catch {
      window.open(upiUrl, '_self');
    }
  }

  // Fallback for Android if intent isn't handled within 800ms
  if (isAndroid() && app === 'universal') {
    setTimeout(() => {
      const rawQuery = `pa=${encodeURIComponent(cleanUpi)}&pn=${encodeURIComponent(cleanName)}&cu=INR${amount && parseFloat(amount) > 0 ? `&am=${parseFloat(amount).toFixed(2)}` : ''}&tn=${encodeURIComponent(note || 'Donation to ' + cleanName)}`;
      try {
        window.location.href = `upi://pay?${rawQuery}`;
      } catch {
        // Fallback ignored
      }
    }, 800);
  }

  return upiUrl;
};

/**
 * Handles clicks on UPI buttons/links across mobile and desktop
 */
export const handleUpiLinkClick = (e, options = {}) => {
  if (e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
  }
  return triggerUpiPayment(options);
};
