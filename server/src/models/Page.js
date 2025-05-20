const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  material_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  page_number: { type: Number, required: true },
  image_id: { type: String, required: true }, // Google Drive ID of PNG
  createdAt: { type: Date, default: Date.now },
});

pageSchema.index({ material_id: 1, page_number: 1 });

module.exports = mongoose.model('Page', pageSchema);