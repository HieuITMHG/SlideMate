const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  last_name: String,
  first_name: String,
  organization: String,
  phone: String,
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account', 
    required: true 
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Admin', adminSchema);