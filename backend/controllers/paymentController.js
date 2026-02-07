const Razorpay = require('razorpay');
const crypto = require('crypto');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const Donation = require('../models/Donation');
const sendEmail = require('../utils/emailService');
const emailTemplates = require('../utils/emailTemplates');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_12345678901234',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret12345678901234'
});

// Upload Certificate to Cloudinary
exports.uploadCertificate = async (req, res) => {
  try {
    const { image, donationId } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(image.split(',')[1], 'base64');

    // Upload to Cloudinary using stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'rose_foundation/certificates',
        public_id: `certificate_${donationId}`,
        resource_type: 'image',
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return res.status(500).json({ error: 'Failed to upload certificate' });
        }

        // Optional: Update donation with certificate URL if you want to store it
        // await Donation.findByIdAndUpdate(donationId, { certificateUrl: result.secure_url });

        res.json({ url: result.secure_url });
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);

  } catch (error) {
    console.error('Certificate upload error:', error);
    res.status(500).json({ error: 'Failed to process certificate' });
  }
};

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

// Get Donation Details for Certificate
exports.getDonationDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const donation = await Donation.findById(id).select('donorName amount createdAt transactionId');

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.json(donation);
  } catch (error) {
    console.error('Fetch donation error:', error);
    res.status(500).json({ error: 'Failed to fetch donation details' });
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
        donorId: donorId || null,
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

// Update Donor Name
exports.updateDonorName = async (req, res) => {
  try {
    const { id } = req.params;
    const { donorName } = req.body;

    if (!donorName) {
      return res.status(400).json({ error: 'Donor name is required' });
    }

    const updatedDonation = await Donation.findByIdAndUpdate(
      id,
      { donorName },
      { new: true }
    );

    if (!updatedDonation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.json({ message: 'Donor name updated successfully', donation: updatedDonation });
  } catch (error) {
    console.error('Update donor error:', error);
    res.status(500).json({ error: 'Failed to update donor name' });
  }
};