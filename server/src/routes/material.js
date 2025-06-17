const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const auth = require('../middleware/auth');
const softauth = require('../middleware/softauth');

// Upload material
router.get('/search', softauth ,materialController.searchMaterialsByTitle);
router.get('/my-uploads', auth, materialController.getUserUploadedMaterials);
router.post('/upload', auth, materialController.uploadMaterial);
router.post('/report', auth, materialController.report);
router.get('/:materialId', softauth, materialController.getMaterial);
router.delete('/:materialId', auth, materialController.deleteMaterial);
router.patch('/:materialId', auth, materialController.updateMaterial);
router.patch('/:materialId/visibility', auth, materialController.toggleMaterialVisibility);
router.get('/top-category/:category_id', softauth, materialController.getTopViewedMaterialsByCategory);
router.get('/category/:categoryName', softauth, materialController.getMaterialsByCategory);
router.post('/toggle-like/:materialId', auth, materialController.toggleLike);
router.get('/:id/related', softauth, materialController.getRelatedMaterials);
router.patch('/:id/view', materialController.increaseMaterialView);

module.exports = router;