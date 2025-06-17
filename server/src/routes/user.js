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
  resetPassword,
<<<<<<< HEAD
=======
  getUserInfo,
  updateUserInfo,
>>>>>>> a846e9bd2a9a16e9a396a78496bbef7e5c6e0211
  changePassword
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
router.get('/info', auth, getUserInfo);
router.put('/update', auth, updateUserInfo);
router.post('/change-password', auth, changePassword);

//change password
router.post('/change-password', auth,changePassword);

module.exports = router;
