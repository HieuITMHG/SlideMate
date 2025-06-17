const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const auth = require('../middleware/auth');
const softauth = require('../middleware/softauth');

// Upload material
router.get('/search', softauth ,materialController.searchMaterialsByTitle);
router.post('/upload', auth, materialController.uploadMaterial);
router.post('/report', auth, materialController.report);
router.get('/:materialId', softauth, materialController.getMaterial); 
router.get('/top-category/:name', softauth, materialController.getTopViewedMaterialsByCategory);
router.get('/category/:categoryName', softauth, materialController.getMaterialsByCategory);
router.post('/toggle-like/:materialId', auth, materialController.toggleLike);
router.get('/:id/related', softauth, materialController.getRelatedMaterials);
router.patch('/:id/view', materialController.increaseMaterialView);

module.exports = router;