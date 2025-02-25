const User = require("../models/user.model.js");
const bcryptjs = require("bcryptjs");
const generateVerificationCode = require("../utils/generateVerificationCode.js");
const generateTokenAndSetCookie = require("../utils/generateTokenAndSetCookie.js");
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendForgotPasswordEmail,
  sendResetSuccessEmail,
} = require("../mailtrap/email.js");
const crypto = require("crypto");

const register = async (req, res) => {
  const { email, password, name, phone } = req.body;
  try {
    if (!email || !password || !name || !phone) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      const userAlreadyExists = await User.findOne({ phone });
      if (userAlreadyExists) {
        return res.status(400).json({ message: "User already exists" });
      }
      return res.status(400).json({ message: "User already exists" });
    }
    
    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const verificationTokenExpireAt = Date.now() + 20 * 60 * 60 * 1000;

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      username: email,
      phone,
      verificationToken: verificationCode,
      verificationTokenExpireAt: verificationTokenExpireAt,
    });

    generateTokenAndSetCookie(res, user._id);
    await sendVerificationEmail(user.email, verificationCode);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateTokenAndSetCookie(res, user._id);
    user.lastLoginDate = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const logout = async (req, res) => {
  res.clearCookie("token");
  res.send("Logged out");
};

const verifyemail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({ verificationToken: code }).select(
      "verificationTokenExpireAt email name isVerified"
    );
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }
    if (user.verificationTokenExpireAt < Date.now()) {
      return res.status(400).json({ message: "Verification code expired" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpireAt = undefined;
    await user.save();
    await sendWelcomeEmail(user.email, user.name);

    return res
      .status(200)
      .json({ message: "Email verified successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpireAt = Date.now() + 1 * 60 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpireAt = resetTokenExpireAt;

    await user.save();
    await sendForgotPasswordEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    return res.status(200).json({ message: "Verification code sent" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpireAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpireAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  verifyemail,
  forgotPassword,
  resetPassword,
  checkAuth,
};

