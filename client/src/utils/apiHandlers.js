import { API_BASE_URL } from './constants';
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
    const headers = {
      'Content-Type': 'application/json',
    };

    // Note: Authorization would need to be handled differently without localStorage

    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers,
      body: JSON.stringify(contactForm),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success('Thank you for your message! We will get back to you soon.');
      setContactForm({ name: '', email: '', message: '' });
    } else {
      throw new Error(data.error || 'Failed to send message');
    }
  } catch (error) {
    console.error('Contact form error:', error);
    toast.error(`Error: ${error.message}. Please try again.`);
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
    const response = await fetch(`${API_BASE_URL}/newsletter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: newsletter }),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success('Successfully subscribed to our newsletter!');
      setNewsletter('');
    } else {
      throw new Error(data.error || 'Failed to subscribe');
    }
  } catch (error) {
    console.error('Newsletter error:', error);
    toast.error(`Error: ${error.message}. Please try again.`);
  } finally {
    setIsLoading(false);
  }
};

// Donation handler
export const handleDonation = async (donationAmount, setIsLoading, user) => {
  if (!donationAmount || donationAmount <= 0) {
    toast.error('Please enter a valid donation amount');
    return;
  }

  setIsLoading(true);

  try {
    // 1. Create Order
    const orderResponse = await fetch(`${API_BASE_URL}/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(donationAmount) })
    });

    if (!orderResponse.ok) throw new Error('Failed to create payment order');
    
    const orderData = await orderResponse.json();

    // 2. Initialize Razorpay options
    const options = {
      key: orderData.keyId, // Enter the Key ID generated from the Dashboard
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Black Rose Foundation",
      description: "Donation",
      // image: "https://your-logo-url.com/logo.png", // Optional
      order_id: orderData.orderId,
      handler: async function (response) {
        // 3. Verify Payment on success
        try {
          const verifyResponse = await fetch(`${API_BASE_URL}/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: parseFloat(donationAmount),
              donorName: user?.name || 'Anonymous',
              donorEmail: user?.email || 'anonymous@example.com',
              donorPhone: user?.phone,
              donorId: user?._id
            })
          });

          const verifyData = await verifyResponse.json();

          if (verifyResponse.ok) {
            toast.success('Thank you for your generous donation! You will receive a confirmation email shortly.');
          } else {
            toast.error('Payment verification failed: ' + verifyData.error);
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast.error('Error verifying payment. Please contact support.');
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

    const rzp1 = new window.Razorpay(options);
    
    rzp1.on('payment.failed', function (response){
        toast.error(`Payment Failed: ${response.error.description}`);
    });

    rzp1.open();

  } catch (error) {
    console.error('Donation error:', error);
    toast.error(`Error: ${error.message}. Please try again.`);
  } finally {
    setIsLoading(false);
  }
};