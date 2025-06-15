const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  list_name: {type:String, require: true, trim: true},
  description: String,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true }
}, {
  timestamps: true
});
module.exports = mongoose.model('List', listSchema);