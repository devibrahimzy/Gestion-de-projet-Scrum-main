const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const User = require("../models/user.model");
const db = require("../config/database");
const crypto = require("crypto"); 

exports.register = async (req, res) => {
  const { email, password, first_name, last_name, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    id: uuid(),
    email,
    password: hashedPassword,
    first_name,
    last_name,
    role
  });

  res.status(201).json({ message: "User created" });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const [[user]] = await User.findByEmail(email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

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
      role: user.role
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

  const token = crypto.randomBytes(32).toString("hex"); // PAS besoin de bcrypt.hash ici
  const expires = new Date(Date.now() + 3600 * 1000); // 1h expiration

  await db.query(
    "UPDATE users SET resetToken = ?, resetTokenExpires = ? WHERE email = ?",
    [token, expires, email]
  );

  res.json({ message: "Reset token generated", token }); // pour test on renvoie le token
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password required" });
  }

  const [rows] = await db.query(
    "SELECT * FROM users WHERE resetToken = ? AND resetTokenExpires > NOW()",
    [token]
  );

  const user = rows[0];

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.query(
    "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpires = NULL WHERE id = ?",
    [hashedPassword, user.id]
  );

  res.json({ message: "Password reset successfully" });
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
