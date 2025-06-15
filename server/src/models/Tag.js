const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  tag_name: { type: String, required: true, unique: true, trim: true, minlength: 1}
});
module.exports = mongoose.model('Tag', tagSchema);