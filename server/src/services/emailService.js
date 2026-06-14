const nodemailer = require("nodemailer");
const config = require("../config/env");

let transporterPromise;

const isPlaceholderValue = (value) =>
  !value || value.includes("your_") || value.includes("placeholder");

const createTransporter = async () => {
  const useFallbackDevAccount =
    config.nodeEnv !== "production" &&
    (isPlaceholderValue(config.emailUser) ||
      isPlaceholderValue(config.emailPass));

  if (useFallbackDevAccount) {
    const testAccount = await nodemailer.createTestAccount();
    console.log(
      "Using Ethereal test account for email previews in development.",
    );

    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return nodemailer.createTransport({
    host: config.emailHost,
    port: config.emailPort,
    secure: config.emailPort === 465,
    auth:
      isPlaceholderValue(config.emailUser) ||
      isPlaceholderValue(config.emailPass)
        ? undefined
        : {
            user: config.emailUser,
            pass: config.emailPass,
          },
  });
};

const getTransporter = async () => {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }

  return transporterPromise;
};

/**
 * Helper to send email
 * @param {object} options - to, subject, html, text
 */
const sendEmail = async (options) => {
  const transporter = await getTransporter();
  const mailOptions = {
    from:
      config.emailUser && !isPlaceholderValue(config.emailUser)
        ? `${config.emailFrom} <${config.emailUser}>`
        : config.emailFrom,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);

    // If using Ethereal mail, log preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Email Preview URL: ${previewUrl}`);
    }
    return info;
  } catch (error) {
    console.error("Nodemailer error sending email:", error);
    // Don't hard crash the app in dev mode if email sending fails
    if (config.nodeEnv === "production") {
      throw error;
    }

    return null;
  }
};

/**
 * Send email verification link
 * @param {object} user - User document
 * @param {string} token - Plain token
 */
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${config.clientUrl}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px;">
      <h2 style="color: #6366f1; text-align: center;">Welcome to SkillNest!</h2>
      <p>Hello ${user.name},</p>
      <p>Thank you for signing up. Please verify your email address to unlock your account and begin learning or instructing on our platform.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email Address</a>
      </div>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="color: #666; font-size: 13px; word-break: break-all;">${verificationUrl}</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px; text-align: center;">This link is valid for 24 hours. If you did not sign up for an account, please ignore this email.</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: "SkillNest — Verify Your Email Address",
    text: `Please verify your email using this link: ${verificationUrl}`,
    html,
  });
};

/**
 * Send password reset email
 * @param {object} user - User document
 * @param {string} token - Plain token
 */
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${config.clientUrl}/auth/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px;">
      <h2 style="color: #ef4444; text-align: center;">Reset Your Password</h2>
      <p>Hello ${user.name},</p>
      <p>We received a request to reset your password for your SkillNest account. Click the button below to set a new password.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="color: #666; font-size: 13px; word-break: break-all;">${resetUrl}</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px; text-align: center;">This link is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: "SkillNest — Reset Your Password",
    text: `Reset your password using this link: ${resetUrl}`,
    html,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
