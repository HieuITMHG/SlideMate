const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const auth = require('../middleware/auth');
const softauth = require('../middleware/softauth');

// Upload material
router.post('/upload', auth, materialController.uploadMaterial);
router.get('/:materialId',softauth, materialController.getMaterial); 
router.get('/category/:categoryName', softauth, materialController.getMaterialsByCategory);
router.post('/report', auth, materialController.report);

module.exports = router;