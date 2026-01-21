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
    const msg = error.response?.data?.error || error.message || 'Failed to send message';
    toast.error(`Error: ${msg}. Please try again.`);
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
    const msg = error.response?.data?.error || error.message || 'Failed to subscribe';
    toast.error(`Error: ${msg}. Please try again.`);
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
    const orderResponse = await axiosInstance.post('/payment/create-order', {
      amount: parseFloat(donationAmount)
    });

    const orderData = orderResponse.data;

    // 2. Initialize Razorpay options
    const options = {
      key: response.data.key,
      amount: response.data.amount,
      currency: "INR",
      name: "Blackrose Foundation",
      description: "Donation for social cause",
      order_id: orderData.orderId,
      handler: async function (response) {
        // 3. Verify Payment on success
        try {
          // Manually trigger global loading if needed, or just let axios handle it
          // Note: Since this is a callback, the previous 'finally' block has already executed.
          // The global loader will pop up again for this request.
          
          await axiosInstance.post('/payment/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            amount: parseFloat(donationAmount),
            donorName: user?.name || 'Anonymous',
            donorEmail: user?.email || 'anonymous@example.com',
            donorPhone: user?.phone,
            donorId: user?._id
          });

          toast.success('Thank you for your generous donation! You will receive a confirmation email shortly.');
        } catch (error) {
          console.error('Payment verification error:', error);
          const msg = error.response?.data?.error || 'Payment verification failed';
          toast.error(`Error: ${msg}`);
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
    const msg = error.response?.data?.error || error.message || 'Payment initiation failed';
    toast.error(`Error: ${msg}. Please try again.`);
  } finally {
    setIsLoading(false);
  }
};
