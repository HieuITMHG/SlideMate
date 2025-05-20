const { google } = require('googleapis');
const Account = require('../models/Account');

require('dotenv').config(); // Đảm bảo tải biến môi trường

// Khởi tạo OAuth2Client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Hàm tạo URL xác thực
const generateAuthUrl = (accountId, additionalScopes = []) => {
  console.log('Generating auth URL for accountId:', accountId);
  const defaultScopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/drive.file'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [...defaultScopes, ...additionalScopes],
    state: accountId.toString(),
    include_granted_scopes: true
  });
  console.log('Generated auth URL:', authUrl);
  return authUrl;
};

// Hàm làm mới token
const refreshAuthToken = async (accountId) => {
  try {
    const account = await Account.findById(accountId).select('googleRefreshToken');
    if (!account || !account.googleRefreshToken) {
      throw new Error('No refresh token available');
    }

    oauth2Client.setCredentials({ refresh_token: account.googleRefreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();

    if (credentials.refresh_token) {
      await Account.findByIdAndUpdate(accountId, {
        googleRefreshToken: credentials.refresh_token
      });
    }

    return oauth2Client;
  } catch (error) {
    console.error('Error refreshing Google token:', error);
    throw error;
  }
};

// Middleware để gắn client đã xác thực
const getAuthenticatedClient = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const account = await Account.findById(req.user.id).select('googleRefreshToken');
    if (!account?.googleRefreshToken) {
      return res.status(403).json({ message: 'Google account not connected' });
    }

    oauth2Client.setCredentials({ refresh_token: account.googleRefreshToken });
    req.googleClient = oauth2Client;
    next();
  } catch (error) {
    console.error('Error authenticating Google client:', error);
    res.status(500).json({ message: 'Google authentication error' });
  }
};

module.exports = {
  oauth2Client,
  generateAuthUrl,
  refreshAuthToken,
  getAuthenticatedClient
};