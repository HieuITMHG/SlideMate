const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const auth = require('../middleware/auth');

// Upload material
router.post('/upload', auth, materialController.uploadMaterial);
router.get('/:materialId/pages', materialController.getMaterialPages);

module.exports = router;