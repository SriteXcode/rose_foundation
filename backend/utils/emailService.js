// utils/emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send Email with template
 * @param {string} to - Recipient email
 * @param {object} template - { subject, html }
 */
const sendEmail = async (to, template) => {
  try {
    const mailOptions = {
      from: `"Black Rose Foundation" <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      text: "Please view this email in HTML mode.",
      html: template.html,
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
