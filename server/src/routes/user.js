const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleLogin,
  refreshTokenHandler,
  getMe,
  logOut,
  verifyEmail,
  sendResetCode,
  verifyResetCode,
  resetPassword
} = require('../controllers/userController');
const auth = require('../middleware/auth');

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/refresh-token', refreshTokenHandler);

// Forgot password flow
router.post('/request-reset', sendResetCode);          
router.post('/verify-reset-code', verifyResetCode);   
router.post('/reset-password', resetPassword);       

// Profile & verification
router.get('/me', auth, getMe);
router.post('/logout', auth, logOut);
router.get('/verify-email', verifyEmail);

module.exports = router;
