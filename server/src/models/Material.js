// models/Material.js
const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    original_file_path: {
      type: String,
      required: true,
    },
    pdf_version_path: {
      type: String,
      required: true,
    },
    thumbnail_path: {
      type: String,
      required: true,
    },
    total_pages: {
      type: Number,
    },
    total_views: {
      type: Number,
      default: 0,
    },
    total_likes: {
      type: Number,
      default: 0,
    },
    visibility: {
      type: String,
      enum: ["PUBLIC", "PRIVATE"],
      required: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category", 
    },
    file_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FileType",
      required: true,
    },
    is_active: {type: Boolean, default:false}
  },
  { timestamps: true } 
);

module.exports = mongoose.model("Material", materialSchema);