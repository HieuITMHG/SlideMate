const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  original_file_id: String,
  folder_id: String,
  first_img_id: String,
  total_page: Number,
  total_view: Number,
  visibility: { type: String, enum: ['PRIVATE', 'PUBLIC', 'PROTECTED'] },
  category_name: { type: String, ref: 'Category' },
  file_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FileType' }
});
module.exports = mongoose.model('Material', materialSchema);