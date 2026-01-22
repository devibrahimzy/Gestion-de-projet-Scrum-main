const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const nodemailer = require("nodemailer");
const User = require("../models/user.model");
const db = require("../config/database");
const crypto = require("crypto");

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Account',
    text: `Your verification code is: ${code}`,
  };
  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your Password',
    text: `Your password reset code is: ${code}. This code will expire in 1 hour.`,
  };
  await transporter.sendMail(mailOptions);
};

const sendInvitationEmail = async (email, link, role) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Project Invitation',
    text: `You have been invited to join the project as ${role}. Click here to accept: ${link}`,
  };
  await transporter.sendMail(mailOptions);
};

exports.register = async (req, res) => {
  const { email, password, first_name, last_name, role } = req.body;

  // Check if email already exists
  const [existingUser] = await User.findByEmail(email);
  if (existingUser.length > 0) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-character code

  await User.create({
    id: uuid(),
    email,
    password: hashedPassword,
    first_name,
    last_name,
    role,
    verification_code: verificationCode
  });

  // Send verification email
  try {
    await sendVerificationEmail(email, verificationCode);
  } catch (error) {
    console.error('Error sending email:', error);
    // Still return success, but log error
  }

  res.status(201).json({ message: "User created. Please check your email for verification code." });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const [[user]] = await User.findByEmail(email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  // Check if account is verified
  if (!user.is_verified) {
    return res.status(403).json({ message: "Account not verified. Please verify your email first." });
  }

  // Check if account is locked
  if (user.lock_until && new Date(user.lock_until) > new Date()) {
    return res.status(423).json({ message: "Account is temporarily locked due to multiple failed login attempts" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    // Increment failed attempts
    await User.incrementFailedAttempts(email);
    const [updatedUser] = await User.findByEmail(email);
    const failedAttempts = updatedUser[0].failed_attempts;

    if (failedAttempts >= 3) {
      // Lock account for 15 minutes
      const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await User.lockAccount(email, lockUntil);
      return res.status(423).json({ message: "Account locked due to multiple failed login attempts. Try again in 15 minutes." });
    }
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Successful login: reset failed attempts
  await User.resetFailedAttempts(email);

  // Update last login
  await User.updateLastLogin(user.id);

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" } // Explicitly set to 24 hours
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
      isActive: user.is_active || true // Default to true if not set
    }
  });
};


exports.logout = (req, res) => {
  return res.json({ message: "Logged out successfully" });
};


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
  if (rows.length === 0) return res.status(404).json({ message: "Email not found" });

  const resetCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-character code
  const expires = new Date(Date.now() + 3600 * 1000); // 1h expiration

  await db.query(
    "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
    [resetCode, expires, email]
  );

  // Send password reset email
  try {
    await sendPasswordResetEmail(email, resetCode);
  } catch (error) {
    console.error('Error sending email:', error);
    // Still return success, but log error
  }

  res.json({ message: "Password reset code sent to your email" });
};

exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: "Email, code and new password required" });
  }

  const [rows] = await db.query(
    "SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()",
    [email, code]
  );

  const user = rows[0];

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired reset code" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.query(
    "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
    [hashedPassword, user.id]
  );

  res.json({ message: "Password reset successfully" });
};

exports.verifyAccount = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and verification code required" });
  }

  const result = await User.verifyAccount(email, code);
  if (result[0].affectedRows === 0) {
    return res.status(400).json({ message: "Invalid verification code or email" });
  }

  res.json({ message: "Account verified successfully" });
};

exports.getProfile = async (req, res) => {
  const [[profile]] = await User.getProfile(req.user.id);
  if (!profile) return res.status(404).json({ message: "User not found" });

  res.json(profile);
};

exports.updateProfile = async (req, res) => {
  const { first_name, last_name, profile_photo } = req.body; // Add preferences later

  await User.updateProfile(req.user.id, { first_name, last_name, profile_photo });
  res.json({ message: "Profile updated successfully" });
};

exports.changeEmail = async (req, res) => {
  const { new_email } = req.body;

  // Check if new email already exists
  const [existing] = await User.findByEmail(new_email);
  if (existing.length > 0) {
    return res.status(400).json({ message: "Email already in use" });
  }

  // Generate verification code for new email
  const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

  // Update user with new email and code (but keep old email until verified?)
  // For simplicity, set pending_email and pending_code
  // But since no such fields, perhaps send email and if verified, update email.

  // For now, generate code and send to new email, then update if verified.
  // But to implement, need to store pending email.

  // Since db has no pending fields, perhaps update email immediately and mark as unverified, send code to new email.

  await db.query(
    "UPDATE users SET email = ?, is_verified = false, verification_code = ? WHERE id = ?",
    [new_email, verificationCode, req.user.id]
  );

  try {
    await sendVerificationEmail(new_email, verificationCode);
  } catch (error) {
    console.error('Error sending email:', error);
  }

  res.json({ message: "Email change requested. Please verify the new email." });
};

exports.changePassword = async (req, res) => {
  const { old_password, new_password } = req.body;

  if (!old_password || !new_password) {
    return res.status(400).json({ message: "Old and new password required" });
  }

  // Get current user password
  const [[user]] = await User.findById(req.user.id);

  const match = await bcrypt.compare(old_password, user.password);
  if (!match) {
    return res.status(400).json({ message: "Old password is incorrect" });
  }

  // Validate new password complexity (same as register, assume length >6)
  if (new_password.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  }

  const hashedPassword = await bcrypt.hash(new_password, 10);
  await User.changePassword(req.user.id, hashedPassword);

  res.json({ message: "Password changed successfully" });
};


//create admin do not implemnt only used for testing
exports.createAdmin = async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.query(
    `INSERT INTO users 
     (email, password, first_name, last_name, role, isActive)
     VALUES (?, ?, ?, ?, 'ADMIN', true)`,
    [email, hashedPassword, first_name, last_name]
  );

  res.status(201).json({ message: "Admin created successfully" });
};
