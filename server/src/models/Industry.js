const mongoose = require('mongoose');
// models/Industry.js
const industrySchema = new mongoose.Schema({
  industry_name: { type: String, required: true }
});
module.exports = mongoose.model('Industry', industrySchema);