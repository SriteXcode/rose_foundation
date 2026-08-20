const Volunteer = require('../models/Volunteer');
const Donation = require('../models/Donation');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const crypto = require('crypto');
const QRCode = require('qrcode');
const Razorpay = require('razorpay');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/emailService');
const emailTemplates = require('../utils/emailTemplates');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_12345678901234',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret12345678901234'
});

// Helper to generate unique Volunteer Code (e.g. BRF-VOL-A1B2)
const generateVolunteerCode = async () => {
  let code = '';
  let exists = true;
  while (exists) {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    code = `BRF-VOL-${randomHex}`;
    const found = await Volunteer.findOne({ volunteerCode: code });
    if (!found) exists = false;
  }
  return code;
};

// Helper to generate unique Fundraiser Code (e.g. BRF-FR-A1B2)
const generateFundraiserCode = async () => {
  let code = '';
  let exists = true;
  while (exists) {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    code = `BRF-FR-${randomHex}`;
    const found = await Volunteer.findOne({ 
      $or: [{ fundraiserCode: code }, { volunteerCode: code }] 
    });
    if (!found) exists = false;
  }
  return code;
};

// Helper to generate base64 QR Code for Public Profile & Transparency Ledger
const generateLedgerQrCode = async (code) => {
  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const donationUrl = `${clientUrl}/v/${code}`;
    return await QRCode.toDataURL(donationUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#09090b',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Ledger QR generation error:', err);
    return '';
  }
};

// Helper to validate UPI ID format (handle@bank)
const validateUpiFormat = (upiId) => {
  if (!upiId || typeof upiId !== 'string') return { isValid: true, cleaned: '' };
  const cleaned = upiId.trim();
  if (cleaned === '') return { isValid: true, cleaned: '' };
  // Standard UPI VPA format: username@bankname
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return {
    isValid: upiRegex.test(cleaned),
    cleaned
  };
};

// Helper to ensure Fundraiser has a registered User account with password = phone number or assigned password
const ensureUserAccountForFundraiser = async ({ name, email, phone, fundraiserCode, customPassword }) => {
  try {
    if (!email || !email.trim()) {
      return { accountExists: false, accountCreated: false };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim().replace(/\s+/g, '') : '';
    
    let existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      // IF USER ALREADY EXISTS: Do NOT alter existing password. Keep credentials as they are!
      if (cleanPhone && !existingUser.phone) existingUser.phone = cleanPhone;
      if (name && (!existingUser.name || existingUser.name === 'Fundraiser')) existingUser.name = name;
      await existingUser.save();

      return {
        accountExists: true,
        accountCreated: false,
        user: existingUser,
        generatedPassword: null
      };
    }

    // Password priority for NEW users: customPassword > cleanPhone > BRF@random
    const rawPassword = (customPassword && customPassword.trim())
      ? customPassword.trim()
      : (cleanPhone && cleanPhone.length >= 4)
        ? cleanPhone
        : `BRF@${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newUser = await User.create({
      name: name || 'Fundraiser',
      email: normalizedEmail,
      phone: cleanPhone || '',
      password: hashedPassword,
      role: 'user'
    });

    // Send onboarding email with login credentials
    try {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 25px; background: #fafafa; color: #18181b; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #e4e4e7;">
          <h2 style="color: #09090b; margin-bottom: 8px;">Welcome to Black Rose Foundation! 🌹</h2>
          <p style="font-size: 14px; color: #52525b; margin-top: 0;">You have been registered as an Official Fundraiser.</p>
          
          <div style="background: #ffffff; padding: 18px; border-radius: 10px; border: 1px solid #e4e4e7; margin: 20px 0;">
            <h3 style="font-size: 14px; font-weight: bold; margin-top: 0; color: #09090b;">Your Account Login Credentials:</h3>
            <p style="margin: 6px 0; font-size: 13px;"><strong>Email:</strong> ${normalizedEmail}</p>
            <p style="margin: 6px 0; font-size: 13px;"><strong>Password:</strong> <code style="background: #f4f4f5; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${rawPassword}</code></p>
            ${fundraiserCode ? `<p style="margin: 6px 0; font-size: 13px;"><strong>Fundraiser ID:</strong> <span style="color: #d97706; font-weight: bold;">${fundraiserCode}</span></p>` : ''}
          </div>

          <p style="font-size: 13px; color: #dc2626; font-weight: bold;">⚠️ Keep your credentials private and safe. Once lost, they cannot be regained!</p>

          <a href="${clientUrl}" style="display: inline-block; background: #18181b; color: #ffffff; padding: 10px 22px; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: bold; margin-top: 10px;">Log in to Black Rose Foundation</a>

          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 25px 0 15px;" />
          <small style="color: #a1a1aa; font-size: 11px;">Black Rose Foundation • Empowering Lives and Social Welfare</small>
        </div>
      `;

      await sendEmail(normalizedEmail, {
        subject: "Welcome Fundraiser - Your Black Rose Foundation Account Login Credentials 🌹",
        html: emailHtml
      });
    } catch (emailErr) {
      console.warn("Fundraiser registration welcome email failed:", emailErr.message);
    }

    return {
      accountExists: false,
      accountCreated: true,
      user: newUser,
      generatedPassword: rawPassword
    };
  } catch (err) {
    console.error("ensureUserAccountForFundraiser error:", err);
    return { accountExists: false, accountCreated: false };
  }
};

// ==========================================
// VOLUNTEER CONTROLLER (Standard Volunteers)
// ==========================================

// Add standard volunteer (Admin Manual Add)
exports.addVolunteer = async (req, res) => {
  try {
    const { name, designation, image, role, email, phone, aadhar, qualification, bio, socialMedia, linkedin, instagram, twitter, github, status } = req.body;
    if (!name || !image) {
      return res.status(400).json({ error: 'Name and image are required' });
    }

    const volunteerCode = await generateVolunteerCode();

    const volunteer = new Volunteer({
      name, 
      designation: designation || role || 'Volunteer', 
      image,
      role: role || 'Volunteer',
      email,
      phone,
      aadhar,
      qualification: qualification || '',
      bio: bio || '',
      socialMedia: {
        linkedin: socialMedia?.linkedin || linkedin || '',
        instagram: socialMedia?.instagram || instagram || '',
        twitter: socialMedia?.twitter || twitter || '',
        github: socialMedia?.github || github || ''
      },
      status: status || 'approved',
      volunteerCode,
      isFundraiser: false,
      totalRaised: 0
    });

    await volunteer.save();
    res.status(201).json({ message: 'Volunteer added successfully!', volunteer });
  } catch (error) {
    console.error('Failed to add volunteer:', error);
    res.status(500).json({ error: 'Failed to add volunteer' });
  }
};

// Apply Volunteer (Public Endpoint)
exports.applyVolunteer = async (req, res) => {
  try {
    const { name, email, phone, aadhar, role, qualification, bio, linkedin, instagram, twitter, github } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    if (!name || !email || !phone || !aadhar) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'All fields are required' });
    }

    let imageUrl = '';
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'rose_foundation/volunteers',
        resource_type: 'image'
      });
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    } catch (uploadError) {
      console.error("Cloudinary upload failed:", uploadError);
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    const volunteerCode = await generateVolunteerCode();

    const volunteer = new Volunteer({
      name,
      email,
      phone,
      aadhar,
      qualification: qualification || '',
      bio: bio || '',
      socialMedia: {
        linkedin: linkedin || '',
        instagram: instagram || '',
        twitter: twitter || '',
        github: github || ''
      },
      role: role || 'Volunteer',
      designation: role || 'Volunteer',
      image: imageUrl,
      status: 'pending',
      volunteerCode,
      isFundraiser: false,
      totalRaised: 0
    });

    await volunteer.save();
    res.status(201).json({ message: 'Application submitted successfully!', volunteer });
  } catch (error) {
    console.error("Application Error:", error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

// Get volunteers (Admin & Public Team support filtering)
exports.getVolunteers = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const { page = 1, limit = 10, status, showOnHome } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    } else {
      query.$or = [{ status: 'approved' }, { status: { $exists: false } }];
    }

    // Filter by Home Page visibility if specified or defaults for public view
    if (showOnHome !== undefined) {
      query.showOnHome = showOnHome === 'true';
    }

    const sortOrder = status === 'pending' ? { createdAt: -1 } : { createdAt: 1 };

    const volunteers = await Volunteer.find(query)
      .sort(sortOrder)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Volunteer.countDocuments(query);

    res.json({
      volunteers,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalVolunteers: count
    });
  } catch (error) {
    console.error('Get Volunteers Error:', error);
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
};

// Toggle Home Page public visibility for a volunteer
exports.toggleShowOnHome = async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteer.findById(id);

    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer profile not found' });
    }

    // Toggle current value (defaults to true if missing/true)
    volunteer.showOnHome = volunteer.showOnHome === false ? true : false;
    await volunteer.save();

    res.json({
      message: volunteer.showOnHome
        ? `${volunteer.name} will now appear on the public Home Page!`
        : `${volunteer.name} is now hidden from the public Home Page!`,
      showOnHome: volunteer.showOnHome,
      volunteer
    });
  } catch (error) {
    console.error('Toggle showOnHome error:', error);
    res.status(500).json({ error: 'Failed to toggle Home Page visibility' });
  }
};

// Update volunteer
exports.updateVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    const existing = await Volunteer.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    if (!existing.volunteerCode) {
      updateData.volunteerCode = await generateVolunteerCode();
    }

    if (updateData.upiId !== undefined) {
      if (updateData.upiId.trim() !== '') {
        const upiCheck = validateUpiFormat(updateData.upiId);
        if (!upiCheck.isValid) {
          return res.status(400).json({
            error: `Invalid UPI ID format "${updateData.upiId.trim()}". Must follow handle@bank format (e.g. john@icici, 9876543210@paytm). Cannot save an invalid UPI ID.`
          });
        }
        updateData.upiId = upiCheck.cleaned;
      } else {
        updateData.upiId = '';
      }
    }

    const updatedVolunteer = await Volunteer.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ message: 'Volunteer updated successfully', volunteer: updatedVolunteer });
  } catch (error) {
    console.error('Update Volunteer Error:', error);
    res.status(500).json({ error: 'Failed to update volunteer' });
  }
};

// Delete volunteer
exports.deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVolunteer = await Volunteer.findByIdAndDelete(id);
    if (!deletedVolunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    res.json({ message: 'Volunteer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete volunteer' });
  }
};

// ==========================================
// FUNDRAISER CONTROLLER (Authorized Fundraisers)
// ==========================================

// Helper to automatically link orphan/unlinked donations (e.g. from unique Razorpay QR webhooks)
const repairUnlinkedDonations = async () => {
  try {
    const unlinkedDonations = await Donation.find({
      $or: [
        { volunteerId: null },
        { volunteerId: { $exists: false } },
        { fundraiserCode: null },
        { fundraiserCode: { $exists: false } }
      ]
    });

    if (!unlinkedDonations || unlinkedDonations.length === 0) return;

    for (const don of unlinkedDonations) {
      let matchedVol = null;

      if (don.razorpayQrId) {
        matchedVol = await Volunteer.findOne({ razorpayQrId: don.razorpayQrId });
      }

      const code = (don.fundraiserCode || don.volunteerCode || '').trim().toUpperCase();
      if (!matchedVol && code) {
        matchedVol = await Volunteer.findOne({
          $or: [
            { fundraiserCode: code },
            { volunteerCode: code }
          ]
        });
      }

      if (matchedVol) {
        let updated = false;
        if (!don.volunteerId || don.volunteerId.toString() !== matchedVol._id.toString()) {
          don.volunteerId = matchedVol._id;
          updated = true;
        }
        if (!don.volunteerCode) {
          don.volunteerCode = matchedVol.volunteerCode || matchedVol.fundraiserCode;
          updated = true;
        }
        if (!don.fundraiserCode) {
          don.fundraiserCode = matchedVol.fundraiserCode || matchedVol.volunteerCode;
          updated = true;
        }
        if (!don.volunteerName) {
          don.volunteerName = matchedVol.name;
          updated = true;
        }
        if (!don.razorpayQrId && matchedVol.razorpayQrId) {
          don.razorpayQrId = matchedVol.razorpayQrId;
          updated = true;
        }

        if (updated) {
          await don.save();
        }
      }
    }
  } catch (err) {
    console.warn('Auto donation repair warning:', err.message);
  }
};

// Get all authorized Fundraisers (Admin list)
exports.getFundraisers = async (req, res) => {
  try {
    // Repair any unlinked donations in background before aggregation
    await repairUnlinkedDonations();

    const { search, page = 1, limit = 50 } = req.query;
    const query = { isFundraiser: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fundraiserCode: { $regex: search, $options: 'i' } },
        { volunteerCode: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const fundraisers = await Volunteer.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const totalFundraisers = await Volunteer.countDocuments(query);

    // Dynamically calculate actual totalRaised for each fundraiser from Donation collection
    const updatedFundraisers = await Promise.all(
      fundraisers.map(async (fundraiser) => {
        const matchConditions = [];
        if (fundraiser._id) matchConditions.push({ volunteerId: fundraiser._id });
        if (fundraiser.volunteerCode) {
          matchConditions.push({ volunteerCode: fundraiser.volunteerCode });
          matchConditions.push({ fundraiserCode: fundraiser.volunteerCode });
        }
        if (fundraiser.fundraiserCode) {
          matchConditions.push({ volunteerCode: fundraiser.fundraiserCode });
          matchConditions.push({ fundraiserCode: fundraiser.fundraiserCode });
        }
        if (fundraiser.razorpayQrId) {
          matchConditions.push({ razorpayQrId: fundraiser.razorpayQrId });
        }

        const agg = await Donation.aggregate([
          { $match: { $or: matchConditions, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const actualTotal = agg[0]?.total || 0;

        if (fundraiser.totalRaised !== actualTotal) {
          fundraiser.totalRaised = actualTotal;
          await Volunteer.findByIdAndUpdate(fundraiser._id, { totalRaised: actualTotal });
        }

        return fundraiser;
      })
    );

    res.json({
      fundraisers: updatedFundraisers,
      totalFundraisers,
      currentPage: Number(page),
      totalPages: Math.ceil(totalFundraisers / Number(limit))
    });
  } catch (error) {
    console.error('Get Fundraisers Error:', error);
    res.status(500).json({ error: 'Failed to fetch fundraisers' });
  }
};

// Add New Fundraiser manually
exports.addFundraiser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      image,
      designation,
      role,
      bio,
      qualification,
      razorpayQrId,
      directPaymentQrImage,
      fundraiserGoal,
      volunteerId,
      upiId
    } = req.body;

    if (!name && !volunteerId) {
      return res.status(400).json({ error: 'Fundraiser name or volunteer ID is required' });
    }

    // Validate UPI ID format if provided
    let cleanedUpiId = '';
    if (upiId && upiId.trim() !== '') {
      const upiCheck = validateUpiFormat(upiId);
      if (!upiCheck.isValid) {
        return res.status(400).json({
          error: `Invalid UPI ID format "${upiId.trim()}". A valid UPI ID must follow handle@bank format (e.g. john@icici, 9876543210@paytm, or fundraiser@razorpay). Cannot save an invalid UPI ID that will fail during payment.`
        });
      }
      cleanedUpiId = upiCheck.cleaned;
    }

    let volunteer;
    if (volunteerId) {
      volunteer = await Volunteer.findById(volunteerId);
      if (!volunteer) {
        return res.status(404).json({ error: 'Selected volunteer not found' });
      }
    }

    const fundraiserCode = (volunteer && volunteer.fundraiserCode) 
      ? volunteer.fundraiserCode 
      : await generateFundraiserCode();

    const activeCode = fundraiserCode || volunteer?.volunteerCode;
    const ledgerQrCode = await generateLedgerQrCode(activeCode);

    if (volunteer) {
      volunteer.isFundraiser = true;
      volunteer.fundraiserCode = fundraiserCode;
      volunteer.ledgerQrCode = ledgerQrCode;
      if (email) volunteer.email = email;
      if (phone) volunteer.phone = phone;
      if (name) volunteer.name = name;
      if (razorpayQrId !== undefined) volunteer.razorpayQrId = razorpayQrId;
      if (upiId !== undefined) volunteer.upiId = cleanedUpiId;
      if (directPaymentQrImage) volunteer.directPaymentQrImage = directPaymentQrImage;
      if (fundraiserGoal) volunteer.fundraiserGoal = Number(fundraiserGoal);
      if (bio) volunteer.bio = bio;
      if (designation) volunteer.designation = designation;
      await volunteer.save();

      // Ensure user account exists (using phone as password if newly registered)
      const userAccountResult = await ensureUserAccountForFundraiser({
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.phone,
        fundraiserCode: volunteer.fundraiserCode
      });

      return res.json({
        message: userAccountResult.accountCreated
          ? `Volunteer promoted! User account created with password: ${userAccountResult.generatedPassword}`
          : 'Volunteer promoted to official Fundraiser!',
        fundraiser: volunteer,
        accountCreated: userAccountResult.accountCreated,
        accountExists: userAccountResult.accountExists,
        generatedPassword: userAccountResult.generatedPassword
      });
    }

    const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

    const newFundraiser = new Volunteer({
      name: (name || '').trim(),
      email: email ? email.trim().toLowerCase() : '',
      phone: phone ? phone.trim() : '',
      image: image || defaultAvatar,
      designation: designation || 'Fundraiser Lead',
      role: 'Volunteer',
      bio: bio || '',
      qualification: qualification || '',
      status: 'approved',
      isFundraiser: true,
      volunteerCode: await generateVolunteerCode(),
      fundraiserCode,
      ledgerQrCode,
      razorpayQrId: razorpayQrId || '',
      upiId: upiId || '',
      directPaymentQrImage: directPaymentQrImage || '',
      fundraiserGoal: Number(fundraiserGoal) || 0,
      totalRaised: 0
    });

    await newFundraiser.save();

    // Ensure user account exists (using phone as password if newly registered)
    const userAccountResult = await ensureUserAccountForFundraiser({
      name: newFundraiser.name,
      email: newFundraiser.email,
      phone: newFundraiser.phone,
      fundraiserCode: newFundraiser.fundraiserCode
    });

    res.status(201).json({
      message: userAccountResult.accountCreated
        ? `Fundraiser created! User account created with password: ${userAccountResult.generatedPassword}`
        : 'Fundraiser created successfully!',
      fundraiser: newFundraiser,
      accountCreated: userAccountResult.accountCreated,
      accountExists: userAccountResult.accountExists,
      generatedPassword: userAccountResult.generatedPassword
    });
  } catch (error) {
    console.error('Add Fundraiser Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create fundraiser' });
  }
};

// Promote existing volunteer to Fundraiser
exports.promoteToFundraiser = async (req, res) => {
  try {
    const { id } = req.params;
    const { razorpayQrId, directPaymentQrImage, fundraiserGoal, email, phone, designation, upiId } = req.body;

    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    if (upiId && upiId.trim() !== '') {
      const upiCheck = validateUpiFormat(upiId);
      if (!upiCheck.isValid) {
        return res.status(400).json({
          error: `Invalid UPI ID format "${upiId.trim()}". Must follow handle@bank syntax (e.g. john@icici, 9876543210@paytm). Cannot save an invalid UPI ID.`
        });
      }
      volunteer.upiId = upiCheck.cleaned;
    } else if (upiId === '') {
      volunteer.upiId = '';
    }

    if (!volunteer.fundraiserCode) {
      volunteer.fundraiserCode = await generateFundraiserCode();
    }

    volunteer.isFundraiser = true;
    volunteer.ledgerQrCode = await generateLedgerQrCode(volunteer.fundraiserCode || volunteer.volunteerCode);
    if (email) volunteer.email = email;
    if (phone) volunteer.phone = phone;
    if (designation) volunteer.designation = designation;
    if (razorpayQrId !== undefined) volunteer.razorpayQrId = razorpayQrId;
    if (directPaymentQrImage !== undefined) volunteer.directPaymentQrImage = directPaymentQrImage;
    if (fundraiserGoal !== undefined) volunteer.fundraiserGoal = Number(fundraiserGoal);

    await volunteer.save();

    // Ensure user account exists
    const userAccountResult = await ensureUserAccountForFundraiser({
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone,
      fundraiserCode: volunteer.fundraiserCode
    });

    res.json({
      message: userAccountResult.accountCreated
        ? `Volunteer promoted! User account created with password: ${userAccountResult.generatedPassword}`
        : 'Volunteer successfully promoted to Fundraiser!',
      fundraiser: volunteer,
      accountCreated: userAccountResult.accountCreated,
      accountExists: userAccountResult.accountExists,
      generatedPassword: userAccountResult.generatedPassword
    });
  } catch (error) {
    console.error('Promote to Fundraiser Error:', error);
    res.status(500).json({ error: error.message || 'Failed to promote to fundraiser' });
  }
};

// Update Fundraiser details & QR codes
exports.updateFundraiser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      designation,
      bio,
      image,
      razorpayQrId,
      upiId,
      directPaymentQrImage,
      fundraiserGoal,
      isFundraiser
    } = req.body;

    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return res.status(404).json({ error: 'Fundraiser not found' });
    }

    if (upiId !== undefined) {
      if (upiId.trim() !== '') {
        const upiCheck = validateUpiFormat(upiId);
        if (!upiCheck.isValid) {
          return res.status(400).json({
            error: `Invalid UPI ID format "${upiId.trim()}". A valid UPI ID must follow handle@bank syntax (e.g. john@icici, 9876543210@paytm, or fundraiser@razorpay). Cannot save an invalid UPI ID.`
          });
        }
        volunteer.upiId = upiCheck.cleaned;
      } else {
        volunteer.upiId = '';
      }
    }

    if (name) volunteer.name = name;
    if (email !== undefined) volunteer.email = email;
    if (phone !== undefined) volunteer.phone = phone;
    if (designation) volunteer.designation = designation;
    if (bio !== undefined) volunteer.bio = bio;
    if (image) volunteer.image = image;
    if (razorpayQrId !== undefined) volunteer.razorpayQrId = razorpayQrId;
    if (upiId !== undefined) volunteer.upiId = upiId;
    if (directPaymentQrImage !== undefined) volunteer.directPaymentQrImage = directPaymentQrImage;
    if (fundraiserGoal !== undefined) volunteer.fundraiserGoal = Number(fundraiserGoal);
    if (isFundraiser !== undefined) volunteer.isFundraiser = Boolean(isFundraiser);

    // Refresh ledger QR code if missing
    if (!volunteer.ledgerQrCode || !volunteer.fundraiserCode) {
      if (!volunteer.fundraiserCode) {
        volunteer.fundraiserCode = await generateFundraiserCode();
      }
      volunteer.ledgerQrCode = await generateLedgerQrCode(volunteer.fundraiserCode || volunteer.volunteerCode);
    }

    // Ensure user account exists if email is present
    let userAccountResult = { accountCreated: false, accountExists: false };
    if (volunteer.email) {
      userAccountResult = await ensureUserAccountForFundraiser({
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.phone,
        fundraiserCode: volunteer.fundraiserCode
      });
    }

    await volunteer.save();
    res.json({
      message: userAccountResult.accountCreated
        ? `Fundraiser updated! New user account created with password: ${userAccountResult.generatedPassword}`
        : 'Fundraiser details updated successfully',
      fundraiser: volunteer,
      accountCreated: userAccountResult.accountCreated,
      accountExists: userAccountResult.accountExists,
      generatedPassword: userAccountResult.generatedPassword
    });
  } catch (error) {
    console.error('Update Fundraiser Error:', error);
    res.status(500).json({ error: error.message || 'Failed to update fundraiser' });
  }
};

// Demote Fundraiser (Remove fundraiser privileges)
exports.demoteFundraiser = async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteer.findByIdAndUpdate(
      id,
      { isFundraiser: false },
      { new: true }
    );

    if (!volunteer) {
      return res.status(404).json({ error: 'Fundraiser not found' });
    }

    res.json({ message: 'Fundraiser privileges removed successfully', volunteer });
  } catch (error) {
    console.error('Demote Fundraiser Error:', error);
    res.status(500).json({ error: 'Failed to demote fundraiser' });
  }
};

// Auto-Generate Razorpay UPI QR Code & Upload image to Cloudinary
exports.generateRazorpayQrCode = async (req, res) => {
  try {
    const { name, fundraiserCode, volunteerId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Fundraiser name is required to generate a QR code' });
    }

    // Determine or generate unique fundraiser code
    let code = fundraiserCode;
    if (!code && volunteerId) {
      const vol = await Volunteer.findById(volunteerId);
      code = vol?.fundraiserCode || vol?.volunteerCode;
    }
    if (!code) {
      code = await generateFundraiserCode();
    }

    // Call Razorpay QR Code API to create a multi-use UPI QR
    const qrPayload = {
      type: 'upi_qr',
      name: `BRF - ${name.slice(0, 30)}`,
      usage: 'multiple_use',
      fixed_amount: false,
      description: `Donation for Black Rose Foundation via ${code}`,
      notes: {
        fundraiserCode: code,
        volunteerName: name,
        source: 'BRF Fundraiser Auto-Generated QR'
      }
    };

    const qrResponse = await razorpay.qrCode.create(qrPayload);

    if (!qrResponse || !qrResponse.id) {
      return res.status(500).json({ error: 'Failed to create QR code with Razorpay API' });
    }

    // Extract VPA/UPI ID from Razorpay QR response or assign formatted fallback
    const extractedUpiId = qrResponse.vpa || (qrResponse.id ? `${qrResponse.id}@razorpay` : '');

    // Upload generated QR image to Cloudinary for permanent high-speed CDN delivery
    let finalQrImageUrl = qrResponse.image_url;
    try {
      if (qrResponse.image_url) {
        const uploadResult = await cloudinary.uploader.upload(qrResponse.image_url, {
          folder: 'rose_foundation/fundraisers/razorpay_qrs',
          public_id: `rzp_qr_${qrResponse.id}`,
          resource_type: 'image'
        });
        finalQrImageUrl = uploadResult.secure_url;
      }
    } catch (uploadError) {
      console.warn('Cloudinary upload warning for Razorpay QR image, fallback to Razorpay URL:', uploadError.message);
      finalQrImageUrl = qrResponse.image_url;
    }

    // Save QR details and UPI ID directly to Volunteer document in MongoDB if match exists
    let volDoc = null;
    if (volunteerId || code) {
      const matchCriteria = [];
      if (volunteerId) matchCriteria.push({ _id: volunteerId });
      if (code) {
        matchCriteria.push({ fundraiserCode: code });
        matchCriteria.push({ volunteerCode: code });
      }
      volDoc = await Volunteer.findOne({ $or: matchCriteria });
      if (volDoc) {
        volDoc.razorpayQrId = qrResponse.id;
        volDoc.directPaymentQrImage = finalQrImageUrl;
        if (extractedUpiId) volDoc.upiId = extractedUpiId;
        await volDoc.save();
      }
    }

    res.json({
      success: true,
      razorpayQrId: qrResponse.id,
      directPaymentQrImage: finalQrImageUrl,
      fundraiserCode: code,
      upiId: extractedUpiId || volDoc?.upiId || '',
      qrDetails: qrResponse
    });
  } catch (error) {
    console.error('Razorpay QR Generation Error:', error);
    const errorMsg = error?.error?.description || error?.message || 'Failed to auto-generate Razorpay QR Code';
    res.status(500).json({ error: errorMsg });
  }
};

// ==========================================
// PUBLIC & DASHBOARD LOOKUPS (Dual QR Support)
// ==========================================

// Get Public Fundraiser/Volunteer Details by Unique Code
exports.getVolunteerByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const upperCode = code.toUpperCase();

    let volunteer = await Volunteer.findOne({
      $or: [
        { fundraiserCode: upperCode },
        { volunteerCode: upperCode }
      ]
    });
    
    if (!volunteer && code.match(/^[0-9a-fA-F]{24}$/)) {
      volunteer = await Volunteer.findById(code);
    }

    if (!volunteer) {
      return res.status(404).json({ error: 'Fundraiser profile not found' });
    }

    // Ensure Ledger QR code exists
    const activeCode = volunteer.fundraiserCode || volunteer.volunteerCode || volunteer._id;
    if (!volunteer.ledgerQrCode) {
      volunteer.ledgerQrCode = await generateLedgerQrCode(activeCode);
      await volunteer.save();
    }

    res.json({
      _id: volunteer._id,
      name: volunteer.name,
      designation: volunteer.designation,
      role: volunteer.role,
      image: volunteer.image,
      bio: volunteer.bio,
      qualification: volunteer.qualification,
      volunteerCode: volunteer.volunteerCode,
      fundraiserCode: volunteer.fundraiserCode,
      isFundraiser: volunteer.isFundraiser,
      razorpayQrId: volunteer.razorpayQrId,
      directPaymentQrImage: volunteer.directPaymentQrImage,
      ledgerQrCode: volunteer.ledgerQrCode,
      fundraiserGoal: volunteer.fundraiserGoal,
      totalRaised: volunteer.totalRaised,
      status: volunteer.status
    });
  } catch (error) {
    console.error('Fetch volunteer by code error:', error);
    res.status(500).json({ error: 'Failed to fetch fundraiser profile' });
  }
};

// Get Transparency Dashboard Data (Dual QR, performance metrics & real-time ledger)
exports.getVolunteerDashboard = async (req, res) => {
  try {
    await repairUnlinkedDonations();

    const { code } = req.params;
    const upperCode = code.toUpperCase();

    let volunteer = await Volunteer.findOne({
      $or: [
        { fundraiserCode: upperCode },
        { volunteerCode: upperCode }
      ]
    });

    if (!volunteer && code.match(/^[0-9a-fA-F]{24}$/)) {
      volunteer = await Volunteer.findById(code);
    }

    if (!volunteer) {
      return res.status(404).json({ error: 'Fundraiser dashboard not found' });
    }

    const activeCode = volunteer.fundraiserCode || volunteer.volunteerCode;
    if (!volunteer.ledgerQrCode) {
      volunteer.ledgerQrCode = await generateLedgerQrCode(activeCode);
      await volunteer.save();
    }

    // Build comprehensive match criteria for ledger donations
    const matchConditions = [];
    if (volunteer._id) matchConditions.push({ volunteerId: volunteer._id });
    if (volunteer.volunteerCode) {
      matchConditions.push({ volunteerCode: volunteer.volunteerCode });
      matchConditions.push({ fundraiserCode: volunteer.volunteerCode });
    }
    if (volunteer.fundraiserCode) {
      matchConditions.push({ volunteerCode: volunteer.fundraiserCode });
      matchConditions.push({ fundraiserCode: volunteer.fundraiserCode });
    }
    if (upperCode) {
      matchConditions.push({ volunteerCode: upperCode });
      matchConditions.push({ fundraiserCode: upperCode });
    }
    if (volunteer.razorpayQrId) {
      matchConditions.push({ razorpayQrId: volunteer.razorpayQrId });
    }

    const donations = await Donation.find({
      $or: matchConditions,
      status: 'completed'
    }).sort({ createdAt: -1 });

    const totalRaised = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

    if (volunteer.totalRaised !== totalRaised) {
      volunteer.totalRaised = totalRaised;
      await volunteer.save();
    }
    const donorCount = donations.length;
    const averageDonation = donorCount > 0 ? Math.round(totalRaised / donorCount) : 0;

    // Monthly calculation
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const thisMonthRaised = donations
      .filter(d => {
        const date = new Date(d.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    res.json({
      volunteer: {
        _id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.phone,
        designation: volunteer.designation,
        role: volunteer.role,
        image: volunteer.image,
        bio: volunteer.bio,
        qualification: volunteer.qualification,
        volunteerCode: volunteer.volunteerCode,
        fundraiserCode: volunteer.fundraiserCode,
        isFundraiser: volunteer.isFundraiser,
        razorpayQrId: volunteer.razorpayQrId,
        directPaymentQrImage: volunteer.directPaymentQrImage,
        ledgerQrCode: volunteer.ledgerQrCode,
        fundraiserGoal: volunteer.fundraiserGoal,
        status: volunteer.status,
        createdAt: volunteer.createdAt
      },
      stats: {
        totalRaised,
        donorCount,
        averageDonation,
        thisMonthRaised,
        fundraiserGoal: volunteer.fundraiserGoal || 0
      },
      donations
    });
  } catch (error) {
    console.error('Volunteer Dashboard Error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// Authenticated: Get currently logged in user's volunteer/fundraiser portal data
exports.getMyVolunteerPortal = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const volunteer = await Volunteer.findOne({
      $or: [
        { email: user.email },
        { userId: user._id }
      ]
    });

    if (!volunteer) {
      return res.status(404).json({ error: 'No volunteer profile linked to this account' });
    }

    req.params.code = volunteer.fundraiserCode || volunteer.volunteerCode || volunteer._id.toString();
    return exports.getVolunteerDashboard(req, res);
  } catch (error) {
    console.error('My Volunteer Portal Error:', error);
    res.status(500).json({ error: 'Failed to access volunteer portal' });
  }
};