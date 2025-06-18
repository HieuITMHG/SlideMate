const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireAdmin = require("../middleware/requireAdmin");
const AdminController = require("../controllers/adminController");
// check auth
router.get('/check-auth', auth, requireAdmin, AdminController.checkAuth);

// dashboard overview
router.get("/overview", auth, requireAdmin, AdminController.getOverviewData);

// users managegents
router.get('/users', auth, requireAdmin, AdminController.getAllUsers);
router.post('/users/:id/deactivate', auth, requireAdmin, AdminController.deactivateUser);
router.post('/users/:id/activate',auth, requireAdmin,  AdminController.activateUser);

// categories managements
router.get("/categories", AdminController.getAllCategories);
router.post("/categories/new", auth, requireAdmin, AdminController.createNewCategory);
router.post("/categories/rename", auth, requireAdmin, AdminController.renameCategory);

// material reports managements
router.get("/reports/pending", auth, requireAdmin, AdminController.getAllPendingReportGroupByMaterial);
router.get("/reports/handled", auth, requireAdmin, AdminController.getAllHandledReports)
router.post("/reports/handle", auth, requireAdmin, AdminController.handleAllReportsOfMaterial)

// statistics management
router.get("/statistics", auth, requireAdmin, AdminController.getStatisticsData);
module.exports = router;