import axiosInstance from './api';
import toast from 'react-hot-toast';
import { loadExternalScript } from './loadExternalScript';

// Contact form submission
export const handleContactSubmit = async (e, contactForm, setContactForm, setIsLoading) => {
  e.preventDefault();

  if (!contactForm.name || !contactForm.email || !contactForm.message) {
    toast.error('Please fill in all fields');
    return;
  }

  setIsLoading(true);

  try {
    await axiosInstance.post('/contact', contactForm);
    toast.success('Thank you for your message! We will get back to you soon.');
    if (window.fbq) {
      window.fbq('track', 'Contact');
    }
    setContactForm({ name: '', email: '', message: '' });
  } catch (error) {
    console.error('Contact form error:', error);
    let msg = error.response?.data?.message || error.response?.data?.error || error.message;
    
    // Default friendly message
    if (!msg || msg.includes('Internal Server Error') || msg.includes('Failed to')) {
      msg = 'Something went wrong. Please try again later.';
    }
    
    toast.error(msg);
  } finally {
    setIsLoading(false);
  }
};

// Newsletter subscription
export const handleNewsletterSubmit = async (e, newsletter, setNewsletter, setIsLoading) => {
  e.preventDefault();

  if (!newsletter) {
    toast.error('Please enter your email address');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newsletter)) {
    toast.error('Please enter a valid email address');
    return;
  }

  setIsLoading(true);

  try {
    await axiosInstance.post('/newsletter', { email: newsletter });
    toast.success('Successfully subscribed to our newsletter!');
    if (window.fbq) {
      window.fbq('track', 'Subscribe', { content_name: 'Newsletter' });
    }
    setNewsletter('');
  } catch (error) {
    console.error('Newsletter error:', error);
    let msg = error.response?.data?.message || error.response?.data?.error || error.message;

    if (msg.includes('already subscribed')) {
      msg = 'You are already subscribed to our newsletter!';
    } else {
      msg = 'Unable to subscribe at the moment. Please try again.';
    }

    toast.error(msg);
  } finally {
    setIsLoading(false);
  }
};

// Donation handler
export const handleDonation = async (donationAmount, setIsLoading, user, onSuccess, volunteerInfo = null) => {
  if (!donationAmount || donationAmount <= 0) {
    toast.error('Please enter a valid donation amount');
    return;
  }

  setIsLoading(true);

  try {
    // Dynamically load Razorpay script
    const isLoaded = await loadExternalScript('https://checkout.razorpay.com/v1/checkout.js');
    
    if (!isLoaded || typeof window.Razorpay === 'undefined') {
      toast.error('Unable to load payment gateway. Please check your internet connection and try again.');
      setIsLoading(false);
      return;
    }

    // 1. Create Order
    const orderResponse = await axiosInstance.post('/payment/create-order', {
      amount: parseFloat(donationAmount)
    });

    const orderData = orderResponse.data;

    // 2. Initialize Razorpay options
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: "INR",
      name: "Blackrose Foundation",
      description: volunteerInfo?.volunteerName ? `Donation via Volunteer ${volunteerInfo.volunteerName}` : "Donation for social cause",
      order_id: orderData.orderId,
      modal: {
        ondismiss: function() {
          setIsLoading(false);
        },
        // Better stability for mobile WebViews
        backdropClose: false,
        escape: false
      },
      handler: async function (response) {
        // 3. Verify Payment on success
        try {
          setIsLoading(true); // Ensure loader is on during verification
          
          const verifyResponse = await axiosInstance.post('/payment/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            amount: parseFloat(donationAmount),
            donorName: volunteerInfo?.donorName || user?.name || 'Anonymous',
            donorEmail: volunteerInfo?.donorEmail || user?.email || 'anonymous@example.com',
            donorPhone: volunteerInfo?.donorPhone || user?.phone || '',
            donorId: user?._id || null,
            volunteerId: volunteerInfo?.volunteerId || null,
            volunteerCode: volunteerInfo?.volunteerCode || null,
            fundraiserCode: volunteerInfo?.fundraiserCode || null,
            volunteerName: volunteerInfo?.volunteerName || null
          });

          toast.success('Thank you for your generous donation!');
          
          if (window.fbq) {
            window.fbq('track', 'Donate', {
              value: parseFloat(donationAmount),
              currency: 'INR'
            });
          }
          
          const donationResult = {
            donationId: verifyResponse.data.donationId,
            amount: donationAmount,
            donorName: volunteerInfo?.donorName || user?.name || 'Anonymous',
            date: new Date().toISOString(),
            transactionId: response.razorpay_payment_id,
            volunteerName: volunteerInfo?.volunteerName || null
          };

          // Save for anonymous users to prevent loss on refresh
          if (!user) {
            try {
              const existing = JSON.parse(localStorage.getItem('anonymousDonations') || '[]');
              // Keep only last 5 donations
              const updated = [donationResult, ...existing].slice(0, 5);
              localStorage.setItem('anonymousDonations', JSON.stringify(updated));
            } catch (err) {
              console.error('Failed to save anonymous donation:', err);
            }
          }
          
          if (onSuccess) {
            onSuccess(donationResult);
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast.error('Payment verification failed. Please contact support if money was deducted.');
        } finally {
          setIsLoading(false);
        }
      },
      prefill: {
        name: volunteerInfo?.donorName || user?.name || "",
        email: volunteerInfo?.donorEmail || user?.email || "",
        contact: volunteerInfo?.donorPhone || user?.phone || ""
      },
      theme: {
        color: "#9F7AEA"
      }
    };

    if (typeof window.Razorpay === 'undefined') {
      toast.error('Payment gateway is still loading. Please try again in a moment.');
      setIsLoading(false);
      return;
    }

    const rzp1 = new window.Razorpay(options);
    
    rzp1.on('payment.failed', function (response){
        toast.error(`Payment Failed: ${response.error.description}`);
    });

    setIsLoading(false); // Stop loader right before opening Razorpay
    
    // Slight delay (100ms) helps mobile browsers/WebViews handle the context switch 
    // from the main app thread to the payment iframe without crashing/freezing.
    setTimeout(() => {
      try {
        if (window.fbq) {
          window.fbq('track', 'InitiateCheckout', {
            value: parseFloat(donationAmount),
            currency: 'INR'
          });
        }
        rzp1.open();
      } catch (err) {
        console.error('Razorpay open error:', err);
        toast.error('Failed to open payment window. Please check if popups are blocked.');
        setIsLoading(false);
      }
    }, 100);

  } catch (error) {
    console.warn('Payment gateway error, recording direct donation fallback:', error);
    try {
      const response = await axiosInstance.post('/donations', {
        amount: parseFloat(donationAmount),
        donorName: volunteerInfo?.donorName || user?.name || 'Anonymous',
        donorEmail: volunteerInfo?.donorEmail || user?.email || 'anonymous@example.com',
        donorPhone: volunteerInfo?.donorPhone || user?.phone || '',
        donorId: user?._id || null,
        volunteerId: volunteerInfo?.volunteerId || null,
        volunteerCode: volunteerInfo?.volunteerCode || null,
        fundraiserCode: volunteerInfo?.fundraiserCode || null,
        volunteerName: volunteerInfo?.volunteerName || null,
        status: 'completed'
      });

      toast.success('Thank you for your generous donation!');
      const donationResult = {
        donationId: response.data.donationId,
        amount: donationAmount,
        donorName: volunteerInfo?.donorName || user?.name || 'Anonymous',
        date: new Date().toISOString(),
        transactionId: `TXN_${Date.now()}`,
        volunteerName: volunteerInfo?.volunteerName || null
      };

      if (!user) {
        try {
          const existing = JSON.parse(localStorage.getItem('anonymousDonations') || '[]');
          const updated = [donationResult, ...existing].slice(0, 5);
          localStorage.setItem('anonymousDonations', JSON.stringify(updated));
        } catch (err) {
          console.error('Failed to save anonymous donation:', err);
        }
      }

      if (onSuccess) {
        onSuccess(donationResult);
      }
    } catch (fallbackError) {
      console.error('Donation recording error:', fallbackError);
      toast.error('Unable to record donation. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};
