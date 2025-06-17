const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AdminController = require("../controllers/adminController");

// users managegents
router.get('/users', AdminController.getAllUsers);
router.post('/users/:id/deactivate', AdminController.deactivateUser);
router.post('/users/:id/activate', AdminController.activateUser);

// categories managements
router.get("/categories", AdminController.getAllCategories);
router.post("/categories/new", AdminController.createNewCategory);
router.post("/categories/rename", AdminController.renameCategory);

// material reports managements
router.get("/reports/pending",auth, AdminController.getAllPendingReportGroupByMaterial);
router.get("/reports/handled", AdminController.getAllHandledReports)
router.post("/reports/handle",auth, AdminController.handleAllReportsOfMaterial)

// statistics management
router.get("/statistics", AdminController.getStatisticsData);
module.exports = router;