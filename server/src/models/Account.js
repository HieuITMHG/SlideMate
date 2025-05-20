const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  google_id: String,
  password: String,
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  googleRefreshToken: { type: String } // Thêm trường refreshToken để lưu Google OAuth refresh token
});

module.exports = mongoose.model('Account', accountSchema);