const { google } = require('googleapis');
const { Readable } = require('stream');
const mongoose = require('mongoose');
const multer = require('multer');
const libre = require('libreoffice-convert');
const pdf = require('pdf-parse');
const { createCanvas } = require('canvas'); // Add canvas
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

const Material = require('../models/Material');
const Category = require('../models/Category');
const FileType = require('../models/FileType');
const Account = require('../models/Account');
const { oauth2Client } = require('../config/google');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];
    cb(null, allowedTypes.includes(file.mimetype));
  },
  limits: { fileSize: 100 * 1024 * 1024 },
});

// Hàm chuyển đổi sang PDF bằng LibreOffice
async function convertToPDF(fileBuffer, fileExtension) {
  return new Promise((resolve, reject) => {
    if (!Buffer.isBuffer(fileBuffer)) {
      return reject(new Error('Input must be a Buffer'));
    }
    console.log('Converting file, size:', fileBuffer.length);
    libre.convert(fileBuffer, '.pdf', undefined, (err, pdfBuffer) => {
      if (err) {
        console.error('LibreOffice conversion error:', err.stack);
        return reject(new Error(`Conversion failed: ${err.message}`));
      }
      console.log('PDF conversion successful, size:', pdfBuffer.length);
      resolve(pdfBuffer);
    });
  });
}

// Hàm upload lên Google Drive
async function uploadToDrive(drive, fileBuffer, fileName, folderId, mimeType) {
  if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
    throw new Error('Invalid or empty file buffer');
  }
  console.log(`Uploading ${fileName}, size: ${fileBuffer.length}`);
  const fileStream = Readable.from(fileBuffer);
  fileStream.on('error', (err) => {
    console.error('Stream error:', err.stack);
  });
  try {
    const uploadedFile = await drive.files.create({
      resource: { name: fileName, parents: [folderId] },
      media: { mimeType, body: fileStream },
      fields: 'id',
    });
    console.log(`Uploaded ${fileName}, ID: ${uploadedFile.data.id}`);
    return uploadedFile.data.id;
  } catch (error) {
    console.error('Drive upload error:', error.stack);
    throw error;
  }
}

// Hàm tạo thumbnail từ PDF bằng pdfjs-dist và canvas
async function generateThumbnail(pdfBuffer) {
  try {
    // Load PDF with pdfjs-dist
    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
    const page = await pdf.getPage(1); // First page
    const viewport = page.getViewport({ scale: 0.5 }); // Scale for thumbnail

    // Create canvas
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    // Render page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // Export as PNG
    const imageBuffer = canvas.toBuffer('image/png');
    console.log('Thumbnail generated, size:', imageBuffer.length);
    return imageBuffer;
  } catch (error) {
    console.error('pdfjs-dist thumbnail error:', error.stack);
    throw new Error(`Thumbnail generation failed: ${error.message}`);
  }
}

const uploadMaterial = [
  upload.single('file'),
  async (req, res) => {
    const { title, description, visibility, category_name } = req.body;
    const file = req.file;
    if (!file || !title || !visibility) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);
      if (!userId) return res.status(401).json({ message: 'User not authenticated' });

      let category = await Category.findOne({ category_name: category_name || 'General' });
      if (!category) {
        category = await new Category({ category_name: category_name || 'General' }).save();
      }

      const mimeType = file.mimetype;
      let fileExtension, typeName;
      if (mimeType === 'application/pdf') {
        fileExtension = 'pdf';
        typeName = 'PDF';
      } else if (mimeType.includes('word')) {
        fileExtension = mimeType.includes('openxml') ? 'docx' : 'doc';
        typeName = 'Word';
      } else {
        fileExtension = mimeType.includes('openxml') ? 'pptx' : 'ppt';
        typeName = 'PowerPoint';
      }

      let fileType = await FileType.findOne({ extention: fileExtension });
      if (!fileType) {
        fileType = await new FileType({ type_name: typeName, extention: fileExtension }).save();
      }

      const account = await Account.findById(userId).select('googleRefreshToken');
      if (!account?.googleRefreshToken) {
        return res.status(401).json({ message: 'Google refresh token missing' });
      }

      oauth2Client.setCredentials({ refresh_token: account.googleRefreshToken });
      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      const folder = await drive.files.create({
        resource: {
          name: `Material_${title}_${Date.now()}`,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });
      const folderId = folder.data.id;

      const originalFileId = await uploadToDrive(drive, file.buffer, `${title}_original.${fileExtension}`, folderId, mimeType);

      let pdfBuffer = file.buffer;
      if (fileExtension !== 'pdf') {
        try {
          pdfBuffer = await convertToPDF(file.buffer, fileExtension);
        } catch (error) {
          console.error('Conversion error:', error.stack);
          return res.status(500).json({ message: 'Failed to convert to PDF', error: error.message });
        }
      }

      const pdfFileId = await uploadToDrive(drive, pdfBuffer, `${title}_converted.pdf`, folderId, 'application/pdf');

      const data = await pdf(pdfBuffer);
      const totalPages = data.numpages || 1;

      console.log("chưa ok");
      console.log('File buffer length:', file.buffer.length);
      if (!file.buffer || file.buffer.length === 0) {
        return res.status(400).json({ message: 'File buffer is empty or invalid' });
      }
      console.log('PDF buffer length:', pdfBuffer.length);
      if (!pdfBuffer || pdfBuffer.length === 0) {
        return res.status(500).json({ message: 'PDF buffer is empty or invalid' });
      }

      // Generate thumbnail using pdfjs-dist and canvas
      let imageBuffer;
      try {
        imageBuffer = await generateThumbnail(pdfBuffer);
        console.log('Image buffer length:', imageBuffer.length);
      } catch (error) {
        console.error('Thumbnail generation error:', error.stack);
        return res.status(500).json({ message: 'Failed to generate thumbnail', error: error.message });
      }
      console.log("ok lun fen");

      const imageId = await uploadToDrive(drive, imageBuffer, `${title}_thumbnail.png`, folderId, 'image/png');
      console.log(imageId);

      const material = await new Material({
        user_id: userId,
        title,
        description,
        folder_id: folderId,
        original_file_id: originalFileId,
        pdf_version_id: pdfFileId,
        thumbnail_id: imageId,
        total_page: totalPages,
        total_view: 0,
        visibility,
        category_name: category.category_name,
        file_type_id: fileType._id,
      }).save();

      res.status(201).json({ message: 'Upload successful', material });
    } catch (error) {
      console.error('Upload error:', error.stack);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
];

const getMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const material = await Material.findById(materialId);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.json({ material });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch material', error: error.message });
  }
};

const getMaterialsByCategory = async (req, res) => {
  console.log("ccafsodfjdf");
  try {
    const { categoryName } = req.params;
    console.log(categoryName);
    // Tìm category trong DB
    const category = await Category.findOne({ category_name: categoryName });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    console.log(categoryName);
    // Tìm các material theo category_name
    const materials = await Material.find({ category_name: categoryName })

    if (!materials || materials.length === 0) {
      return res.status(404).json({ message: 'No materials found for this category' });
    }

    console.log(materials);

    // Format response
    const formattedMaterials = materials.map(material => ({
      id: material._id,
      title: material.title,
      description: material.description,
      folder_id: material.folder_id,
      original_file_id: material.original_file_id,
      pdf_version_id: material.pdf_version_id,
      thumbnail_id: material.thumbnail_id,
      total_page: material.total_page,
      total_view: material.total_view,
      visibility: material.visibility,
      category_name: material.category_name,
      user: material.user_id,
      file_type: material.file_type_id,
      created_at: material.createdAt,
      updated_at: material.updatedAt,
      // ✅ Thêm dòng này để tạo URL Google Drive
      thumbnailUrl: material.thumbnail_id
        ? `https://drive.google.com/thumbnail?id=${material.thumbnail_id}&sz=w1000`
        : null
    }));


    res.json({ category: categoryName, materials: formattedMaterials });
  } catch (error) {
    console.error('Error fetching materials by category:', error.stack);
    res.status(500).json({ message: 'Failed to fetch materials by category', error: error.message });
  }
};

module.exports = { uploadMaterial, getMaterial, getMaterialsByCategory };