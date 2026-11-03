// utils/emailTemplates.js

const emailTemplates = {
  // Admin notification for new contact submission
  adminContactNotification: (name, email, message) => ({
    subject: `📬 New Contact Inquiry from ${name} - Black Rose Foundation`,
    replyTo: email,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: #18181b; padding: 24px; color: #ffffff;">
          <span style="background: #2563eb; color: #ffffff; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">New Website Inquiry</span>
          <h2 style="margin: 12px 0 4px; font-size: 20px; font-weight: 800; color: #ffffff;">Contact Form Submission</h2>
          <p style="margin: 0; font-size: 12px; color: #a1a1aa;">Received on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
        </div>

        <div style="padding: 24px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="color: #64748b; padding: 6px 0; width: 85px;"><strong>Sender:</strong></td>
                <td style="color: #0f172a; font-weight: 700;">${name}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 6px 0;"><strong>Email:</strong></td>
                <td><a href="mailto:${email}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${email}</a></td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 24px;">
            <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px;">Message Content:</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${message}</div>
          </div>

          <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
            <a href="mailto:${email}?subject=Regarding your message to Black Rose Foundation" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-size: 13px; font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
              Reply to ${name} (${email})
            </a>
            <p style="margin: 10px 0 0; font-size: 11px; color: #94a3b8;">You can also hit "Reply" in your email client to respond directly.</p>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 14px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
          Black Rose Foundation • Admin Notifications System
        </div>
      </div>
    `
  }),

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
