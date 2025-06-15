const mongoose = require('mongoose');

const fileTypeSchema = new mongoose.Schema({
  type_name: {type: String, require: true, unique: true, enum: ['Presentation', 'Document']},
  extention: {type: String, require: true, unique: true, enum: ['doc', 'ppt', 'pdf','pptx', 'docx']}
});

module.exports = mongoose.model('FileType', fileTypeSchema);