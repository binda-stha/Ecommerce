/**
 * Email Service for Violation and Approval Notifications
 */

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

class EmailService {
  static async sendVerificationEmail(to, token) {
    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/verify-email?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "Verify your email",
      html: `<h2>Welcome!</h2><p>Please verify your email by clicking <a href='${verificationUrl}'>here</a>.</p>`,
    };
    await transporter.sendMail(mailOptions);
    return { success: true };
  }
  static async sendViolationNotification(
    traderEmail,
    violationType,
    description
  ) {
    // Mock implementation for testing
    console.log("📧 VIOLATION EMAIL SENT:");
    console.log(`To: ${traderEmail}`);
    console.log(`Subject: Violation Notice - ${violationType}`);
    console.log(`Message: ${description}`);

    return {
      success: true,
      messageId: "violation_" + Date.now(),
      timestamp: new Date().toISOString(),
    };
  }

  static async sendApprovalNotification(traderEmail, status, details) {
    console.log("📧 APPROVAL EMAIL SENT:");
    console.log(`To: ${traderEmail}`);
    console.log(`Subject: Trader Application ${status.toUpperCase()}`);
    console.log(`Details: ${details || "No additional details"}`);

    return {
      success: true,
      messageId: "approval_" + Date.now(),
      timestamp: new Date().toISOString(),
    };
  }

  static async sendOrderConfirmation(customerEmail, orderDetails) {
    console.log("📧 ORDER CONFIRMATION SENT:");
    console.log(`To: ${customerEmail}`);
    console.log(`Subject: Order Confirmation - Order #${orderDetails.orderId}`);

    return {
      success: true,
      messageId: "order_" + Date.now(),
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = EmailService;
