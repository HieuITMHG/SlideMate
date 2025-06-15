const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const {validate_password} = require('../utils/user')
const { sendVerificationEmail } = require("../utils/email"); // Import email util
const {generateTokens, setTokensCookie} = require("../utils/auth")

const User = require("../models/User");
const Account = require("../models/Account");
const Role = require("../models/Role");


const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Đăng ký người dùng

const registerUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Check if email or username already exists
    if (await Account.findOne({ email })) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }
    if (await Account.findOne({ username })) {
      return res.status(400).json({ message: "User name đã được sử dụng" });
    }

    // Validate password
    if (!validate_password(password).is_valid) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải dài hơn 8 ký tự" });
    }

    // Find or create User role
    const role =
      (await Role.findOne({ role_name: "User" })) ||
      (await new Role({ role_name: "User" }).save());

    // Generate verification token
    const otp = crypto.randomBytes(32).toString("hex");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const fifteenMinutes = 15 * 60 * 1000;
    // Create account with is_active: false and verification_token
    const account = await new Account({
      email,
      password: hashedPassword,
      username,
      role: role._id,
      is_active: false, // Account is inactive until verified
      otp: otp,
      otp_expired_time: new Date(Date.now() + fifteenMinutes)
    }).save();

    // Create associated User document
    await new User({ account: account._id }).save();

    // Send verification email
    await sendVerificationEmail(email, username, otp);

    res.status(201).json({
      message: "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.",
      user: { email, username },
    });
  } catch (error) {
    console.error("Registration error:", error.stack);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Đăng nhập người dùng
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const account = await Account.findOne({ email });

    if (!account || !(await bcrypt.compare(password, account.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!account.is_active) {
      return res.status(400).json({message:"Tài khoản không khả dụng"});
    }

    const { accessToken, refreshToken } = generateTokens(account._id);
    setTokensCookie(res, accessToken, refreshToken);

    res.json({ user: { email: account.email , username: account.username, role_id: account.role } });
  } catch (error) {
    console.error("Login error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};

// Đăng nhập bằng Google
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    const { sub: googleId, email, name } = await googleClient
      .verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      .then((ticket) => ticket.getPayload());

    let account = await Account.findOne({ email });

    if (!account) {
      const role = await Role.findOne({ role_name: "User" }) || (await new Role({ role_name: "User" }).save());
      account = await new Account({
        email,
        username: name || `User_${googleId}`,
        role: role._id,
        is_active: true
      }).save();

      await new User({ first_name: name || "Unknown", account: account._id }).save();
    }

    const { accessToken, refreshToken } = generateTokens(account._id);
    setTokensCookie(res, accessToken, refreshToken);

    res.status(200).json({
      user: { email, name: account.username },
      accessToken,
    });
  } catch (error) {
    console.error("Google login error:", error.stack);
    res.status(400).json({ message: "Google authentication failed" });
  }
};

// Làm mới token
const refreshTokenHandler = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.user.id);

    setTokensCookie(res, accessToken, newRefreshToken);

    res.json({
      message: "Token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error.stack);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

// Lấy thông tin người dùng
const getMe = async (req, res) => {
  try {
    const account = await Account.findById(req.user.id);
    if (!account) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await User.findOne({ account: account._id });
    res.json({
      user: {
        email: account.email,
        name: user?.first_name || account.username,
      },
    });
  } catch (error) {
    console.error("Error fetching user info:", error.stack);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Đăng xuất
const logOut = async (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });

    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.error("Logout error:", error.stack);
    res.status(500).json({ message: "Lỗi đăng xuất" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token không hợp lệ" });
    }

    const account = await Account.findOne({ verification_token: token, otp_expire_time: { $gt: new Date() } });
    if (!account) {
      return res.status(400).json({ message: "Token xác nhận không hợp lệ hoặc đã hết hạn" });
    }

    if (account.is_active) {
      return res.status(400).json({ message: "Tài khoản đã được xác nhận" });
    }

    account.is_active = true;
    account.verification_token = null;
    await account.save();

    const { accessToken, refreshToken } = generateTokens(account._id);
    setTokensCookie(res, accessToken, refreshToken);

    res.status(200).json({
      message: "Xác nhận email thành công!",
      user: { email: account.email, username: account.username },
    });
  } catch (error) {
    console.error("Verification error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  refreshTokenHandler,
  getMe,
  logOut,
  verifyEmail
};