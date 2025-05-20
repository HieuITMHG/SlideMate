const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  last_name: String,
  first_name: String,
  organization: String,
  industry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Industry'
  },
  phone: String,
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account', 
    required: true 
  }
});

module.exports = mongoose.model('User', userSchema);