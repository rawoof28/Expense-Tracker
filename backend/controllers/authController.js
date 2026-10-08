const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const otpStore = new Map();
const normalizeEmail = (email = "") => email.trim().toLowerCase();
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const sendOtpEmail = async (email, otp) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("Email SMTP configuration is missing. Add SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT || 587) === 465,
    connectionTimeout: 30000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: email,
    subject: "Your Expense Tracker OTP",
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  });
};

const sendOtp = async (req, res) => {
  try {
    const { email, purpose = "SIGNUP" } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (purpose === "SIGNUP") {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
    }

    const otp = generateOtp();
    await sendOtpEmail(normalizedEmail, otp);

    otpStore.set(normalizedEmail, {
      otp,
      purpose,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    res.status(200).json({
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("sendOtp error:", error.message);
    res.status(500).json({
      message: error.message || "Failed to send OTP.",
    });
  }
};

const validateOtp = async (req, res) => {
  try {
    const { user, otp, purpose = "SIGNUP" } = req.body;
    const normalizedEmail = normalizeEmail(user);
    const otpEntry = otpStore.get(normalizedEmail);

    if (!otpEntry) {
      return res.status(400).json({ message: "No OTP was sent for this email" });
    }

    if (Date.now() > otpEntry.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (otpEntry.purpose !== purpose) {
      return res.status(400).json({ message: "OTP purpose does not match" });
    }

    if (String(otpEntry.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    otpStore.delete(normalizedEmail);

    res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("validateOtp error:", error.message);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// =======================
// Register User
// =======================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const trimmedName = name?.trim();
    const normalizedEmail = normalizeEmail(email);

    if (!trimmedName || !normalizedEmail || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration successful",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// =======================
// Login User
// =======================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT secret is not configured",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// =======================
// Forgot Password
// =======================
const forgotPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const trimmedName = name?.trim();
    const normalizedEmail = email ? normalizeEmail(email) : "";

    if (!trimmedName || !normalizedEmail) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: id },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already in use",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        name: trimmedName,
        email: normalizedEmail,
      },
      {
        new: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// =======================
// Export Controllers
// =======================
module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  updateProfile,
  sendOtp,
  validateOtp,
};