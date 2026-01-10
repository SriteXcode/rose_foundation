const Razorpay = require('razorpay');
const crypto = require('crypto');
const Donation = require('../models/Donation');
const sendEmail = require('../utils/emailService');
const emailTemplates = require('../utils/emailTemplates');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_12345678901234',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret12345678901234'
});

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const options = {
      amount: amount * 100, // Razorpay works in smallest currency unit (paise)
      currency,
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

// Verify Payment and Save Donation
exports.verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      amount,
      donorName,
      donorEmail,
      donorPhone,
      donorId
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret12345678901234')
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Create donation record
      const donation = new Donation({
        amount,
        donorName: donorName || 'Anonymous',
        donorEmail: donorEmail || 'anonymous@example.com',
        donorPhone,
        transactionId: razorpay_payment_id,
        paymentMethod: 'Razorpay',
        status: 'completed',
        createdAt: new Date()
      });

      await donation.save();

      // Send Donation Receipt
      try {
        if (donorEmail && donorEmail.includes('@')) {
          await sendEmail(
            donorEmail, 
            emailTemplates.donationReceipt(donorName || 'Donor', amount)
          );
        }
      } catch (emailError) {
        console.error("Donation receipt email failed:", emailError);
      }

      res.json({ 
        message: 'Payment verified and donation recorded successfully', 
        donationId: donation._id 
      });
    } else {
      res.status(400).json({ error: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};