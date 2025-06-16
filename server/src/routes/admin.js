const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// user management
const {
    getAllUser,
    deactivateUser,
    activateUser
} = require("../controllers/admincontroller/UsersManagementController");

router.get('/users', getAllUser);
router.post('/users/:id/deactivate', deactivateUser);
router.post('/users/:id/activate', activateUser);

const {
    getAllCaregories,
    createNewCategory,
    renameCategory
} = require("../controllers/admincontroller/CategoriesManagementController");
router.get("/categories", getAllCaregories);
router.post("/categories/new", createNewCategory);
router.post("/categories/rename", renameCategory);
module.exports = router;