const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// user management
const{
    getAllUser,
    deactivateUser, 
    activateUser
} = require("../controllers/admincontroller/UsersManagementController");

router.get('/users', getAllUser);
router.post('/users/:id/deactivate', deactivateUser);
router.post('/users/:id/activate', activateUser);



module.exports = router;