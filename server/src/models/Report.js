const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user_id: {type: mongoose.Schema.Types.ObjectId, require: true, ref: 'User'},
  admin_id: {type: mongoose.Schema.Types.ObjectId, require: true, ref: 'Admin'},
  material_id: {type: mongoose.Schema.Types.ObjectId, require: true, ref: 'Material'},
  report_content: {type: String, require: true, trim: true},
  status: {type: String, enum: ['PENDING', 'HANDLED'], default: 'PENDING'},
  is_delete_material: Boolean,
  is_ban_account: Boolean
}, 
{timestamps: true});

module.exports = mongoose.model('Report', reportSchema);