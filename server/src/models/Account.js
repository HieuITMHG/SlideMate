const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  otp: {type: String, default: null},
  otp_expired_time: Date,
  is_active: {type: Boolean, default: false}
},
{timestamps: true});

module.exports = mongoose.model('Account', accountSchema);