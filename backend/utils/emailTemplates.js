// utils/emailTemplates.js

const emailTemplates = {
  // Contact form auto-reply
  contactReply: (name) => ({
    subject: "Thank you for contacting Black Rose Foundation 🌹",
    html: `
      <div style="font-family: Arial, sans-serif; padding:20px; background:#f9f9f9; color:#333;">
        <h2 style="color:#B22222;">Hello ${name},</h2>
        <p>Thank you for reaching out to <strong>Black Rose Foundation</strong>. 🌹</p>
        <p>We have received your message and our team will get back to you soon.</p>
        <br/>
        <p>Warm Regards,</p>
        <p><strong>Black Rose Foundation Team</strong></p>
        <hr/>
        <small>This is an automated response. Please do not reply to this email.</small>
      </div>
    `
  }),

  // Donation receipt
  donationReceipt: (name, amount) => ({
    subject: "Donation Receipt - Black Rose Foundation 🌹",
    html: `
      <div style="font-family: Arial, sans-serif; padding:20px; background:#fff3f3; color:#333;">
        <h2 style="color:#B22222;">Dear ${name},</h2>
        <p>Thank you for your generous donation of <strong>₹${amount}</strong> to <strong>Black Rose Foundation</strong>.</p>
        <p>Your contribution helps us empower communities and bring meaningful change. 🌍</p>
        <br/>
        <p>Best Wishes,</p>
        <p><strong>Black Rose Foundation Team</strong></p>
        <hr/>
        <small>This email serves as a receipt of your donation.</small>
      </div>
    `
  }),

  // Newsletter subscription
  newsletterWelcome: (name) => ({
    subject: "Welcome to the Black Rose Foundation Newsletter 🌹",
    html: `
      <div style="font-family: Arial, sans-serif; padding:20px; background:#f0f8ff; color:#333;">
        <h2 style="color:#B22222;">Hi ${name},</h2>
        <p>Thank you for subscribing to our <strong>Newsletter</strong>! 🎉</p>
        <p>You'll now receive updates about our projects, events, and impact stories.</p>
        <br/>
        <p>Together, we can make a difference. ❤️</p>
        <p><strong>Black Rose Foundation Team</strong></p>
      </div>
    `
  }),

  // New User Registration
  welcomeEmail: (name) => ({
    subject: "Welcome to the Black Rose Foundation Family! 🌹",
    html: `
      <div style="font-family: Arial, sans-serif; padding:20px; background:#fff; color:#333; border: 1px solid #eee;">
        <h2 style="color:#B22222;">Welcome, ${name}!</h2>
        <p>We are thrilled to have you join the <strong>Black Rose Foundation</strong> family.</p>
        <p>Your account has been successfully created. You can now log in to view your profile and manage your contributions.</p>
        <br/>
        <p>Thank you for being part of our mission.</p>
        <p><strong>The Black Rose Foundation Team</strong></p>
      </div>
    `
  })
};

module.exports = emailTemplates;
