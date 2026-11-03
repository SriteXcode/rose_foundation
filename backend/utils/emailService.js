// utils/emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Use with caution, helps with some certificate issues
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000
});

/**
 * Send Email with template
 * @param {string} to - Recipient email
 * @param {object} template - { subject, html, text, replyTo }
 * @param {string} [replyTo] - Optional reply-to address
 */
const sendEmail = async (to, template, replyTo = null) => {
  try {
    const finalReplyTo = replyTo || template.replyTo || undefined;
    const mailOptions = {
      from: `"Black Rose Foundation" <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      text: template.text || "Please view this email in HTML mode.",
      html: template.html,
      ...(finalReplyTo ? { replyTo: finalReplyTo } : {})
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Email not sent");
  }
};

module.exports = sendEmail;
