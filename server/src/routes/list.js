const express = require('express');
const router = express.Router();
const {
    toggleSaveMaterial
} = require('../controllers/listController');

const auth = require('../middleware/auth');

router.post('/toggle-save', auth, toggleSaveMaterial);

module.exports = router;
