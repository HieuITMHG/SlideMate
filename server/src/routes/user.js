const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin, refreshTokenHandler, getMe, googleRedirect } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/refresh-token', refreshTokenHandler);
router.get('/google/redirect', googleRedirect);
router.get('/me', auth, getMe);

module.exports = router;