const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOTP } = require("../utils/mailer");
const { decrypt } = require("../utils/cryptoUtils");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


router.get("/health", (req, res) => {
  return res.json({
    code: 200,
    message: "Auth service is healthy"
  })
})

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post("/signup", async (req, res) => {
  try {
    // Frontend sends encrypted data
    const { encryptedData } = req.body;
    const { name, age, email, password } = decrypt(encryptedData);

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user = new User({ name, age, email, password, otp, otpExpires });
    await user.save();

    await sendOTP(email, otp);
    res.status(201).json({ message: "OTP sent to email. Please verify." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { encryptedData } = req.body;
    const { email, otp } = decrypt(encryptedData);

    const user = await User.findOne({ email, otp, otpExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id, type: user.type }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Return user data along with token
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      age: user.age
    };

    res.status(200).json({ message: "Verification successful", token, user: userData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { encryptedData } = req.body;
    const { email, password } = decrypt(encryptedData);

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) return res.status(400).json({ message: "Please verify your email" });

    const token = jwt.sign({ id: user._id, type: user.type }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Return user data along with token
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      age: user.age
    };

    res.status(200).json({ message: "Login successful", token, user: userData });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { encryptedData } = req.body;
    const { email } = decrypt(encryptedData);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTP(email, otp);
    res.status(200).json({ message: "OTP sent for password reset" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { encryptedData } = req.body;
    const { email, otp, newPassword } = decrypt(encryptedData);

    const user = await User.findOne({ email, otp, otpExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile - protected route
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpires');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      age: user.age
    };

    res.status(200).json({ user: userData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
