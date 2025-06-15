const mongoose = require('mongoose');

const listMaterialSchema = new mongoose.Schema({
  material_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Material', require: true},
  list_id: {type: mongoose.Schema.Types.ObjectId, ref: 'List', require: true}
});

module.exports = mongoose.model('ListMaterial', listMaterialSchema);