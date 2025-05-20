const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { oauth2Client, generateAuthUrl, refreshAuthToken } = require('../config/google');
const User = require('../models/User');
const Account = require('../models/Account');
const Role = require('../models/Role');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Tạo JWT tokens
const generateTokens = (userId) => ({
  accessToken: jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET, { expiresIn: '1h' }),
  refreshToken: jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET, { expiresIn: '7d' })
});

// Thiết lập cookies
const setTokensCookie = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
  };

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 3600000 });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 604800000 });
};

// Kiểm tra Google Auth
const handleGoogleAuth = async (account) => {
  if (!account.googleRefreshToken) {
    const authUrl = generateAuthUrl(account._id, ['https://www.googleapis.com/auth/drive.file']);
    console.log('Needs Google auth, redirect to:', authUrl);
    return { needsAuth: true, authUrl };
  }

  try {
    await refreshAuthToken(account._id);
    return { needsAuth: false };
  } catch (error) {
    console.error('Google token refresh failed:', error);
    return { needsAuth: true, authUrl: generateAuthUrl(account._id) };
  }
};

// Đăng ký người dùng
const registerUser = async (req, res) => {
  try {
    const { email, password, first_name, username } = req.body;

    if (await Account.findOne({ email })) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const role = await Role.findOne({ role_name: 'User' }) || await new Role({ role_name: 'User' }).save();
    const hashedPassword = await bcrypt.hash(password, 10);

    const account = await new Account({
      email,
      password: hashedPassword,
      username,
      role: role._id
    }).save();

    await new User({ first_name, account: account._id }).save();

    const { accessToken, refreshToken } = generateTokens(account._id);
    setTokensCookie(res, accessToken, refreshToken);

    const googleAuth = await handleGoogleAuth(account);
    res.status(201).json({ user: { email, first_name }, ...googleAuth });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Đăng nhập người dùng
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const account = await Account.findOne({ email });

    if (!account || !(await bcrypt.compare(password, account.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = await User.findOne({ account: account._id });
    const { accessToken, refreshToken } = generateTokens(account._id);
    setTokensCookie(res, accessToken, refreshToken);

    const googleAuth = await handleGoogleAuth(account);
    res.json({ user: { email, name: user?.first_name || account.username }, ...googleAuth });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Đăng nhập bằng Google
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const { sub: googleId, email, name } = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    }).then(ticket => ticket.getPayload());

    let account = await Account.findOne({ email });
    const isNewAccount = !account;

    if (!account) {
      const role = await Role.findOne({ role_name: 'User' }) || await new Role({ role_name: 'User' }).save();
      account = await new Account({
        email,
        googleId,
        username: name,
        role: role._id
      }).save();

      await new User({ first_name: name, account: account._id }).save();
    }

    const { accessToken, refreshToken } = generateTokens(account._id);
    setTokensCookie(res, accessToken, refreshToken);

    const googleAuth = await handleGoogleAuth(account);
    res.status(200).json({
      user: { email, name: account.username },
      accessToken,
      ...googleAuth
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(400).json({ message: 'Google authentication failed' });
  }
};

// Xử lý Google redirect
const googleRedirect = async (req, res) => {
  console.log('Google redirect called with query:', req.query);
  try {
    const { code, state: accountId } = req.query;
    if (!code) {
      throw new Error('Authorization code missing');
    }

    const { tokens } = await oauth2Client.getToken(code);
    console.log('Received tokens:', tokens);

    if (!tokens.refresh_token) {
      throw new Error('No refresh token received');
    }

    await Account.findByIdAndUpdate(accountId, {
      googleRefreshToken: tokens.refresh_token
    });

    oauth2Client.setCredentials(tokens);
    console.log('Redirecting to frontend:', `${process.env.FRONTEND_URL}/oauth-success?accountId=${accountId}`);
    res.redirect(`${process.env.FRONTEND_URL}/`);
  } catch (error) {
    console.error('Google redirect error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/`);
  }
};

const refreshTokenHandler = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Không có refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.user.id);
    setTokensCookie(res, accessToken, newRefreshToken);
    res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    console.error('Lỗi làm mới token:', error);
    res.status(401).json({ message: 'Refresh token không hợp lệ hoặc đã hết hạn' });
  }
};

const getMe = async (req, res) => {
  try {
    const account = await Account.findById(req.user.id);
    if (!account) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findOne({ account: account._id });
    res.json({ 
      user: { 
        email: account.email, 
        name: user?.first_name || account.username 
      },
      hasGoogleAuth: !!account.googleRefreshToken
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  googleLogin, 
  googleRedirect,
  refreshTokenHandler, 
  getMe 
};