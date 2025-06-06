const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin, refreshTokenHandler, getMe, logOut } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/refresh-token', refreshTokenHandler);

router.get('/me', auth, getMe);
router.post('/logout', auth, logOut);
module.exports = router;