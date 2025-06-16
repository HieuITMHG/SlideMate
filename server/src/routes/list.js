const express = require('express');
const router = express.Router();
const {
  toggleSaveMaterial,
  getMyList,
  getMyListDetail,
  createListAndAddMaterial,
} = require('../controllers/listController');

const auth = require('../middleware/auth');
const softauth = require('../middleware/softauth');

router.post('/toggle-save', auth, toggleSaveMaterial);
router.get('/get-my-list', softauth, getMyList);
router.get('/get-my-list-detail/:listId', auth, getMyListDetail); 
router.post('/create', auth, createListAndAddMaterial);

module.exports = router;