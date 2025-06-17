const express = require('express');
const router = express.Router();
const {
  toggleSaveMaterial,
  getMyList,
  getMyListDetail,
  createListAndAddMaterial,
  getUserLists,
  createList,
  getList,
  getListMaterials,
  deleteList,
  updateListName,
} = require('../controllers/listController');

const auth = require('../middleware/auth');
const softauth = require('../middleware/softauth');

router.get('/:listId', auth, getList);
router.get('/:listId/materials', auth, getListMaterials);
router.delete('/:listId', auth, deleteList);
router.patch('/:listId', auth, updateListName);
router.post('/', auth, createList);
router.get('/', auth, getUserLists);
router.post('/toggle-save', auth, toggleSaveMaterial);
router.get('/get-my-list', softauth, getMyList);
router.get('/get-my-list-detail/:listId', auth, getMyListDetail); 
router.post('/create', auth, createListAndAddMaterial);

module.exports = router;