const mongoose = require('mongoose');

const materialTagSchema = new mongoose.Schema({
  material_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
  tag_name: { type: String, ref: 'Tag' }
});
module.exports = mongoose.model('MaterialTag', materialTagSchema);