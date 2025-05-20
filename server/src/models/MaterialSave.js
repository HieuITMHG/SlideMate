const mongoose = require('mongoose');

const materialSaveSchema = new mongoose.Schema({
  material_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lists_id: { type: mongoose.Schema.Types.ObjectId, ref: 'List' }
});
module.exports = mongoose.model('MaterialSave', materialSaveSchema);