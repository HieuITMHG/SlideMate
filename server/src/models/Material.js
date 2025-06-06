// models/Material.js
const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
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
    total_page: {
      type: Number,
      default: 1,
    },
    total_view: {
      type: Number,
      default: 0,
    },
    visibility: {
      type: String,
      enum: ["PUBLIC", "PRIVATE", "PROTECTED"],
      required: true,
    },
    category_name: {
      type: String,
      required: true,
      ref: "Category", // References Category model
    },
    file_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FileType",
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

module.exports = mongoose.model("Material", materialSchema);