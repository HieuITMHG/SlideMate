const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  list_name: String,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  visibility: { type: String, enum: ['PRIVATE', 'PUBLIC', 'PROTECTED'] }
});
module.exports = mongoose.model('List', listSchema);