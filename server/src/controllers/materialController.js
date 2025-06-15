const mongoose = require("mongoose");
const multer = require("multer");
const libre = require("libreoffice-convert");
const pdf = require("pdf-parse");
const { createCanvas } = require("canvas");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");

const Material = require("../models/Material");
const Category = require("../models/Category");
const FileType = require("../models/FileType");
const User = require("../models/User");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];
    cb(null, allowedTypes.includes(file.mimetype));
  },
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// Convert to PDF
async function convertToPDF(fileBuffer) {
  return new Promise((resolve, reject) => {
    libre.convert(fileBuffer, ".pdf", undefined, (err, pdfBuffer) => {
      if (err) {
        console.error("LibreOffice conversion error:", err.stack);
        return reject(new Error(`Conversion failed: ${err.message}`));
      }
      resolve(pdfBuffer);
    });
  });
}

// Generate thumbnail
async function generateThumbnail(pdfBuffer) {
  const pdfDoc = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
  const page = await pdfDoc.getPage(1);
  const viewport = page.getViewport({ scale: 0.5 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d");
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toBuffer("image/png");
}

// Upload buffer to Cloudinary
async function uploadBufferToCloudinary(buffer, publicId, folder, resource_type = "auto") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type,
        public_id: publicId,
        folder,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// Main upload function
const uploadMaterial = [
  upload.single("file"),
  async (req, res) => {
    const { title, description, visibility, category_name } = req.body;
    const file = req.file;

    if (!file || !title || !visibility) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const accountId = new mongoose.Types.ObjectId(req.user.id);
      const user = await User.findOne({ account: accountId });
      if (!user) return res.status(404).json({ message: "User not found" });
      const userId = user._id;

      let category = await Category.findOne({ category_name: category_name || "General" });
      if (!category) {
        category = await new Category({ category_name: category_name || "General" }).save();
      }

      const mimeType = file.mimetype;
      let fileExtension, typeName;
      if (mimeType === "application/pdf") {
        fileExtension = "pdf";
        typeName = "PDF";
      } else if (mimeType.includes("word")) {
        fileExtension = mimeType.includes("openxml") ? "docx" : "doc";
        typeName = "Word";
      } else {
        fileExtension = mimeType.includes("openxml") ? "pptx" : "ppt";
        typeName = "PowerPoint";
      }

      let fileType = await FileType.findOne({ extention: fileExtension });
      if (!fileType) {
        fileType = await new FileType({ type_name: typeName, extention: fileExtension }).save();
      }

      const materialId = new mongoose.Types.ObjectId().toString();
      const folder = `SlideMate/${materialId}`;

      // Upload original file
      const originalFileUrl = await uploadBufferToCloudinary(file.buffer, "original", folder);

      // Convert to PDF
      let pdfBuffer = file.buffer;
      if (fileExtension !== "pdf") {
        pdfBuffer = await convertToPDF(file.buffer);
      }
      const pdfFileUrl = await uploadBufferToCloudinary(pdfBuffer, "converted", folder, "raw");

      // Extract PDF data
      const data = await pdf(pdfBuffer);
      const totalPages = data.numpages || 1;

      // Generate thumbnail
      const thumbnailBuffer = await generateThumbnail(pdfBuffer);
      const thumbnailUrl = await uploadBufferToCloudinary(thumbnailBuffer, "thumbnail", folder, "image");

      // Save to DB
      const material = await new Material({
        user_id: userId,
        title,
        description,
        original_file_path: originalFileUrl,
        pdf_version_path: pdfFileUrl,
        thumbnail_path: thumbnailUrl,
        total_page: totalPages,
        total_view: 0,
        total_likes: 0,
        visibility,
        category_id: category._id,
        file_type_id: fileType._id,
      }).save();

      res.status(201).json({ message: "Upload successful", material });
    } catch (error) {
      console.error("Upload error:", error.stack);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];


// Get material by ID
const getMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;

    const material = await Material.findById(materialId).populate({
      path: "user_id",
      populate: {
        path: "account",
        model: "Account",
        select: "username _id",
      },
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    const formattedMaterial = {
      id: material._id,
      title: material.title,
      description: material.description,
      original_file_path: material.original_file_path,
      pdf_version_path: material.pdf_version_path,
      thumbnail_path: material.thumbnail_path,
      total_page: material.total_page,
      total_view: material.total_view,
      visibility: material.visibility,
      category_name: material.category_name,
      created_at: material.createdAt,
      updated_at: material.updatedAt,
      user: {
        userId: material.user_id?._id,
        accountId: material.user_id?.account?._id,
        username: material.user_id?.account?.username,
      },
      file_type: material.file_type_id,
    };

    res.json({ material: formattedMaterial });
  } catch (error) {
    console.error("Error fetching material:", error.stack);
    res.status(500).json({ message: "Failed to fetch material", error: error.message });
  }
};


// Get materials by category
const getMaterialsByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;

    const category = await Category.findOne({ category_name: categoryName });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const materials = await Material.find({ category_id: category._id }).populate({
      path: "user_id",
      populate: {
        path: "account",
        model: "Account",
        select: "username _id",
      },
    });

    const formattedMaterials = materials.map((material) => ({
      id: material._id,
      title: material.title,
      description: material.description,
      original_file_path: material.pdf_version_path,
      pdf_version_path: material.pdf_version_path,
      thumbnail_path: material.thumbnail_path,
      total_page: material.total_page,
      total_view: material.total_view,
      visibility: material.visibility,
      category_name: material.category_name,
      created_at: material.createdAt,
      updated_at: material.updatedAt,
      user: {
        userId: material.user_id?._id,
        accountId: material.user_id?.account?._id,
        username: material.user_id?.account?.username,
      },
      file_type: material.file_type_id,
    }));
    res.json({ category: categoryName, materials: formattedMaterials });
  } catch (error) {
    console.error("Error fetching materials by category:", error.stack);
    res.status(500).json({
      message: "Failed to fetch materials by category",
      error: error.message,
    });
  }
};

module.exports = { uploadMaterial, getMaterial, getMaterialsByCategory };