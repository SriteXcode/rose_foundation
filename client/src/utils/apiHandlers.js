import axiosInstance from './api';
import toast from 'react-hot-toast';

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
export const handleDonation = async (donationAmount, setIsLoading, user, onSuccess) => {
  if (!donationAmount || donationAmount <= 0) {
    toast.error('Please enter a valid donation amount');
    return;
  }

  setIsLoading(true);

  try {
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
      description: "Donation for social cause",
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
            donorName: user?.name || 'Anonymous',
            donorEmail: user?.email || 'anonymous@example.com',
            donorPhone: user?.phone,
            donorId: user?._id
          });

          toast.success('Thank you for your generous donation!');
          
          const donationResult = {
            donationId: verifyResponse.data.donationId,
            amount: donationAmount,
            donorName: user?.name || 'Anonymous',
            date: new Date().toISOString(),
            transactionId: response.razorpay_payment_id
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
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone || ""
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
        rzp1.open();
      } catch (err) {
        console.error('Razorpay open error:', err);
        toast.error('Failed to open payment window. Please check if popups are blocked.');
        setIsLoading(false);
      }
    }, 100);

  } catch (error) {
    console.error('Donation error:', error);
    toast.error('Unable to initiate donation. Please check your connection or try again.');
  } finally {
    setIsLoading(false);
  }
};
