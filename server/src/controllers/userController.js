const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user");
const Account = require("../models/Account");
const Role = require("../models/Role");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Tạo JWT tokens
const generateTokens = (userId) => ({
  accessToken: jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET, { expiresIn: "1h" }),
  refreshToken: jwt.sign({ user: { id: userId } }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" }),
});

// Thiết lập cookies
const setTokensCookie = (res, accessToken, refreshToken) => {
  console.log("set token!!!!");
  const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  };

  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 3600000 }); // 1 hour
  res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 604800000 }); // 7 days
};

// Đăng ký người dùng
const registerUser = async (req, res) => {
  try {
    const { email, password, first_name, username } = req.body;

    if (await Account.findOne({ email })) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const role = await Role.findOne({ role_name: "User" }) || (await new Role({ role_name: "User" }).save());
    const hashedPassword = await bcrypt.hash(password, 10);

    const account = await new Account({
      email,
      password: hashedPassword,
      username,
      role: role._id,
    }).save();

    await new User({ first_name, account: account._id }).save();

    const { accessToken, refreshToken } = generateTokens(account._id);
    setTokensCookie(res, accessToken, refreshToken);

    res.status(201).json({ user: { email, first_name } });
  } catch (error) {
    console.error("Registration error:", error.stack);
    res.status(500).json({ message: "Server error" });
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

    const user = await User.findOne({ account: account._id });
    const { accessToken, refreshToken } = generateTokens(account._id);
    setTokensCookie(res, accessToken, refreshToken);

    res.json({ user: { email, name: user?.first_name || account.username } });
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
        googleId,
        username: name || `User_${googleId}`,
        role: role._id,
      }).save();

      await new User({ first_name: name || "Unknown", account: account._id }).save();
    }

    const { accessToken, refreshToken } = generateTokens(account._id);
    console.log('access_token: '+ accessToken);
    console.log('refresh_token: ' + refreshToken);
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
  console.log(refreshToken);
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

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  refreshTokenHandler,
  getMe,
  logOut,
};