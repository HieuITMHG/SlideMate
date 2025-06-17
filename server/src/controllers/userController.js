const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const {validate_password} = require('../utils/user')
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/email"); // Import email util
const {generateTokens, setTokensCookie} = require("../utils/auth");

const User = require("../models/User");
const Account = require("../models/Account");
const Role = require("../models/Role");
const List = require("../models/List");
const globalVar = require("../enums/global");

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

    if (!validate_password(password).is_valid) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải dài hơn 8 ký tự" });
    }

    const role =
      (await Role.findOne({ role_name: "User" })) ||
      (await new Role({ role_name: "User" }).save());

    const otp = crypto.randomBytes(32).toString("hex");

    const hashedPassword = await bcrypt.hash(password, 10);
    const fifteenMinutes = 15 * 60 * 1000;
 
    const account = await new Account({
      email,
      password: hashedPassword,
      username,
      role: role._id,
      is_active: false, 
      otp: otp,
      otp_expire_time: new Date(Date.now() + fifteenMinutes)
    }).save();

    const user = await new User({ account: account._id }).save();

    if (!(await List.findOne({user_id: user._id}))) {
      await new List({
        list_name: globalVar.DEFAULT_LIST_NAME,
        description: null,
        user_id: user._id
      }).save();
    }

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
    if (!account.is_active) {
      return res.status(400).json({message:"Tài khoản không khả dụng"});
    }

    if (!account) {
      const role = await Role.findOne({ role_name: "User" }) || (await new Role({ role_name: "User" }).save());
      account = await new Account({
        email,
        username: name || `User_${googleId}`,
        role: role._id,
        is_active: true
      }).save();

      const user = await new User({ first_name: name || "Unknown", account: account._id }).save();

        if (! await List.findOne({user_id: user._id})) {
          await new List({
          list_name: globalVar.DEFAULT_LIST_NAME,
          description: null,
          user_id: user._id
        }).save();
      }
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
    console.log(token);
    const account = await Account.findOne({ otp: token, otp_expire_time: { $gt: new Date() } });
    if (!account) {
      return res.status(400).json({ message: "Token xác nhận không hợp lệ hoặc đã hết hạn" });
    }

    if (account.is_active) {
      return res.status(400).json({ message: "Tài khoản đã được xác nhận" });
    }

    account.is_active = true;
    account.otp = null;
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

const sendResetCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Account.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email không tồn tại' });

    const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit code
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    user.otp = otp;
    user.otp_expire_time = otpExpire;
    await user.save();

    await sendPasswordResetEmail(email, user.username, otp);
    res.json({ message: 'Mã xác thực đã được gửi đến email' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gửi mã thất bại' });
  }
};

const verifyResetCode = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await Account.findOne({ email });
    console.log(otp);
    console.log(user.otp_expire_time < new Date());
    if (!user || user.otp !== otp || user.otp_expire_time < new Date()) {
      return res.status(400).json({ message: 'Mã không hợp lệ hoặc đã hết hạn' });
    }

    res.json({ message: 'Mã hợp lệ' }); // Có thể gửi token nếu cần
  } catch (error) {
    res.status(500).json({ message: 'Xác minh mã thất bại' });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await Account.findOne({ email });

    if (!user || user.otp !== otp || user.otp_expire_time < new Date()) {
      return res.status(400).json({ message: 'Mã không hợp lệ hoặc đã hết hạn' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otp_expire_time = null;
    user.is_active = true;
    await user.save();

    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Đặt lại mật khẩu thất bại' });
  }
};

<<<<<<< HEAD
const changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    // Tìm tài khoản theo ID
    const account = await Account.findById(userId);
    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    // So sánh mật khẩu cũ
    const isMatch = await bcrypt.compare(currentPassword, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // Kiểm tra xem mật khẩu mới có trùng với cũ không
    const isSameAsOld = await bcrypt.compare(newPassword, account.password);
    if (isSameAsOld) {
      return res.status(400).json({ message: "Mật khẩu mới không được trùng với mật khẩu cũ" });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu
    account.password = hashedPassword;
    await account.save();

    return res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ" });
=======
const getUserInfo = async (req, res) => {
  try {
    const accountId = req.user.id;

    const account = await Account.findById(accountId).select('-password -otp -otp_expire_time');
    if (!account) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    const user = await User.findOne({ account: accountId });
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const userInfo = {
      username: account.username,
      email: account.email,
      is_active: account.is_active,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      organization: user.organization,
    };
    res.status(200).json({ success: true, data: userInfo });
  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const accountId = req.user.id;

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    const isMatch = await bcrypt.compare(oldPassword, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
    }

    const salt = await bcrypt.genSalt(10);
    account.password = await bcrypt.hash(newPassword, salt);
    await account.save();

    res.status(200).json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const updateUserInfo = async (req, res) => {
  try {
    const accountId = req.user.id;
    const { username, email, first_name, last_name, phone, organization } = req.body;

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    if (username) account.username = username;
    if (email) {
      const existingAccount = await Account.findOne({ email, _id: { $ne: accountId } });
      if (existingAccount) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }
      account.email = email;
    }
    await account.save();

    const user = await User.findOne({ account: accountId });
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (phone) user.phone = phone;
    if (organization) user.organization = organization;
    await user.save();

    const updatedInfo = {
      username: account.username,
      email: account.email,
      is_active: account.is_active,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      organization: user.organization,
    };

    res.status(200).json({ success: true, data: updatedInfo });
  } catch (error) {
    console.error('Lỗi cập nhật thông tin:', error);
    res.status(500).json({ message: 'Lỗi server' });
>>>>>>> a846e9bd2a9a16e9a396a78496bbef7e5c6e0211
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  refreshTokenHandler,
  getMe,
  logOut,
  verifyEmail,
  sendResetCode,
  verifyResetCode,
  resetPassword,
<<<<<<< HEAD
  changePassword,
=======
  getUserInfo,
  updateUserInfo,
  changePassword
>>>>>>> a846e9bd2a9a16e9a396a78496bbef7e5c6e0211
};