const mongoose = require('mongoose');

const materialTagSchema = new mongoose.Schema({
  material_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
  tag_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }
});
module.exports = mongoose.model('MaterialTag', materialTagSchema);