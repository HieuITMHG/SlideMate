const mongoose = require('mongoose');

const fileTypeSchema = new mongoose.Schema({
  type_name: String,
  extention: String
});

module.exports = mongoose.model('FileType', fileTypeSchema);