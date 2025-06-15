const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin, refreshTokenHandler, getMe, logOut, verifyEmail } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/refresh-token', refreshTokenHandler);

router.get('/me', auth, getMe);
router.post('/logout', auth, logOut);
router.get("/verify-email", verifyEmail);
module.exports = router;