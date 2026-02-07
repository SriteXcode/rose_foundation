const express = require('express');
const { createOrder, verifyPayment, getDonationDetails, uploadCertificate, updateDonorName } = require('../controllers/paymentController');
const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/certificate/:id', getDonationDetails);
router.post('/upload-certificate', uploadCertificate);
router.put('/update-donor/:id', updateDonorName);

module.exports = router;