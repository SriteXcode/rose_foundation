const Contact = require('../models/Contact');
const sendEmail = require("../utils/emailService");

// Submit contact form
exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const contact = new Contact({ name, email, message });
    await contact.save();

    res.status(201).json({
      message: 'Thank you for your message! We will get back to you soon.',
      contactId: contact._id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
};

// Get all contact messages (admin)
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};


// const Contact = require("../models/Contact");
// const sendEmail = require("../utils/emailService");

// // Submit contact form
// exports.submitContact = async (req, res) => {
//   try {
//     const { name, email, message } = req.body;

//     if (!name || !email || !message) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     // Save in DB
//     const contact = new Contact({ name, email, message });
//     await contact.save();

//     // Send email
//     await sendEmail(
//       "ngo.blackrose@gmail.com", // receiver (admin/NGO email)
//       "New Contact Form Submission",
//       `From: ${name} <${email}>\n\nMessage: ${message}`, // plain text
//       `<h2>Contact Form Submission</h2>
//        <p><strong>Name:</strong> ${name}</p>
//        <p><strong>Email:</strong> ${email}</p>
//        <p><strong>Message:</strong> ${message}</p>` // HTML
//     );

//     res.status(201).json({
//       message: "Contact form submitted & email sent successfully",
//       contactId: contact._id,
//     });
//   } catch (err) {
//     console.error("Error in submitContact:", err);
//     res.status(500).json({ error: "Failed to submit contact form" });
//   }
// };

// // Get all contact messages (admin)
// exports.getContacts = async (req, res) => {
//   try {
//     const contacts = await Contact.find().sort({ createdAt: -1 });
//     res.json(contacts);
//   } catch (error) {
//     console.error("Error in getContacts:", error);
//     res.status(500).json({ error: "Failed to fetch contacts" });
//   }
// };
