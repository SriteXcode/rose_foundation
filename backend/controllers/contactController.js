const Contact = require('../models/Contact');
const sendEmail = require('../utils/emailService');
const emailTemplates = require('../utils/emailTemplates');
const { sendPushNotification } = require('../utils/pushNotificationService');

// Submit contact form
exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const contact = new Contact({ name, email, message });
    await contact.save();

    // 1. Send Admin Email Notification (non-blocking for fast UI response)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'blackrosefoundation111@gmail.com';
    sendEmail(adminEmail, emailTemplates.adminContactNotification(name, email, message))
      .catch(err => console.error('⚠️ Admin notification email error:', err.message));

    // 2. Send Auto-Reply to the user
    sendEmail(email, emailTemplates.contactReply(name))
      .catch(err => console.error('⚠️ User auto-reply email error:', err.message));

    // 3. Send Web Push Notification to all subscribed admins
    sendPushNotification({
      title: `📬 New Message from ${name}`,
      body: message.length > 100 ? `${message.substring(0, 100)}...` : message,
      url: '/admin',
      icon: '/blackrose_logo.png'
    }, 'admin').catch(err => console.error('⚠️ Push notification trigger error:', err.message));

    res.status(201).json({
      message: 'Thank you for your message! We will get back to you soon.',
      contactId: contact._id
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
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

// Delete a contact message (admin)
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact message not found' });
    }
    res.json({ message: 'Contact message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact message' });
  }
};

// Update contact message status (admin)
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['unread', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ error: 'Contact message not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact status' });
  }
};
