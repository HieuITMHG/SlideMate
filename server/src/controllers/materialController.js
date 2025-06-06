const mongoose = require("mongoose");
const multer = require("multer");
const libre = require("libreoffice-convert");
const pdf = require("pdf-parse");
const { createCanvas } = require("canvas");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const fs = require("fs").promises;
const path = require("path");

const Material = require("../models/Material");
const Category = require("../models/Category");
const FileType = require("../models/FileType");
const User = require("../models/user");

// Configure multer for memory storage
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
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// Convert document to PDF using LibreOffice
async function convertToPDF(fileBuffer, fileExtension) {
  return new Promise((resolve, reject) => {
    if (!Buffer.isBuffer(fileBuffer)) {
      return reject(new Error("Input must be a Buffer"));
    }
    console.log("Converting file, size:", fileBuffer.length);
    libre.convert(fileBuffer, ".pdf", undefined, (err, pdfBuffer) => {
      if (err) {
        console.error("LibreOffice conversion error:", err.stack);
        return reject(new Error(`Conversion failed: ${err.message}`));
      }
      console.log("PDF conversion successful, size:", pdfBuffer.length);
      resolve(pdfBuffer);
    });
  });
}

// Generate thumbnail from PDF using pdfjs-dist and canvas
async function generateThumbnail(pdfBuffer) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
    const page = await pdf.getPage(1); // First page
    const viewport = page.getViewport({ scale: 0.5 }); // Scale for thumbnail

    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    const imageBuffer = canvas.toBuffer("image/png");
    console.log("Thumbnail generated, size:", imageBuffer.length);
    return imageBuffer;
  } catch (error) {
    console.error("pdfjs-dist thumbnail error:", error.stack);
    throw new Error(`Thumbnail generation failed: ${error.message}`);
  }
}

// Upload material endpoint
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
      if (!user) {
        return res.status(404).json({ message: "User not found for this account" });
      }

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

      // Create material directory
      const materialId = new mongoose.Types.ObjectId();
      const materialDir = path.join(__dirname, "../../public/materials", materialId.toString());
      await fs.mkdir(materialDir, { recursive: true });

      // Save original file
      const originalFilePath = path.join(materialDir, `original.${fileExtension}`);
      await fs.writeFile(originalFilePath, file.buffer);
      console.log(`Saved original file: ${originalFilePath}`);

      // Convert to PDF if not already PDF
      let pdfBuffer = file.buffer;
      if (fileExtension !== "pdf") {
        try {
          pdfBuffer = await convertToPDF(file.buffer, fileExtension);
        } catch (error) {
          console.error("Conversion error:", error.stack);
          return res.status(500).json({ message: "Failed to convert to PDF", error: error.message });
        }
      }

      // Save PDF file
      const pdfFilePath = path.join(materialDir, "converted.pdf");
      await fs.writeFile(pdfFilePath, pdfBuffer);
      console.log(`Saved PDF file: ${pdfFilePath}`);

      // Get page count
      const data = await pdf(pdfBuffer);
      const totalPages = data.numpages || 1;

      // Validate buffers
      if (!file.buffer || file.buffer.length === 0) {
        return res.status(400).json({ message: "File buffer is empty or invalid" });
      }
      if (!pdfBuffer || pdfBuffer.length === 0) {
        return res.status(500).json({ message: "PDF buffer is empty or invalid" });
      }

      // Generate and save thumbnail
      let imageBuffer;
      try {
        imageBuffer = await generateThumbnail(pdfBuffer);
      } catch (error) {
        console.error("Thumbnail generation error:", error.stack);
        return res.status(500).json({ message: "Failed to generate thumbnail", error: error.message });
      }

      const thumbnailPath = path.join(materialDir, "thumbnail.png");
      await fs.writeFile(thumbnailPath, imageBuffer);
      console.log(`Saved thumbnail: ${thumbnailPath}`);

      // Save material to database
      const material = await new Material({
        user_id: userId,
        title,
        description,
        original_file_path: `/materials/${materialId}/original.${fileExtension}`,
        pdf_version_path: `/materials/${materialId}/converted.pdf`,
        thumbnail_path: `/materials/${materialId}/thumbnail.png`,
        total_page: totalPages,
        total_view: 0,
        visibility,
        category_name: category.category_name,
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
      original_file_path: `http://localhost:3000${material.original_file_path}`,
      pdf_version_path: `http://localhost:3000${material.pdf_version_path}`,
      thumbnail_path: material.thumbnail_path
        ? `http://localhost:3000${material.thumbnail_path}`
        : null,
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

    const materials = await Material.find({ category_name: categoryName }).populate({
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
      original_file_path: `http://localhost:3000${material.pdf_version_path}`,
      pdf_version_path: `http://localhost:3000${material.pdf_version_path}`,
      thumbnail_path: material.thumbnail_path
        ? `http://localhost:3000${material.thumbnail_path}`
        : null,
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