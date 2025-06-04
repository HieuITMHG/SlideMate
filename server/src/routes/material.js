const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const auth = require('../middleware/auth');

// Upload material
router.post('/upload', auth, materialController.uploadMaterial);
router.get('/:materialId', materialController.getMaterial); 
router.get('/category/:categoryName', materialController.getMaterialsByCategory);

module.exports = router;