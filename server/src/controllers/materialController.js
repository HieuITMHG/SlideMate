const { google } = require('googleapis');
const { fromPath } = require('pdf2pic');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { Readable } = require('stream');
const mongoose = require('mongoose');
const multer = require('multer');

const Material = require('../models/Material');
const Page = require('../models/Page');
const Category = require('../models/Category');
const FileType = require('../models/FileType');
const Account = require('../models/Account');
const { oauth2Client } = require('../config/google');

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];
    cb(null, allowedTypes.includes(file.mimetype));
  },
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

const uploadMaterial = [
  upload.single('file'),
  async (req, res) => {
    const { title, description, visibility, category_name } = req.body;
    const file = req.file;

    if (!file || !title || !visibility) {
      return res.status(400).json({ message: 'Title, file, and visibility are required' });
    }

    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);
      if (!userId) return res.status(401).json({ message: 'User not authenticated' });

      // 1. Ensure category exists
      let category = await Category.findOne({ category_name: category_name || 'General' });
      if (!category) {
        category = await new Category({ category_name: category_name || 'General' }).save();
      }

      // 2. Ensure FileType exists
      const fileExtension = file.mimetype === 'application/pdf' ? 'pdf' : 'ppt';
      const typeName = file.mimetype === 'application/pdf' ? 'PDF' : 'PowerPoint';
      let fileType = await FileType.findOne({ extention: fileExtension });
      if (!fileType) {
        fileType = await new FileType({ type_name: typeName, extention: fileExtension }).save();
      }

      // 3. Google Drive auth
      const account = await Account.findById(userId).select('googleRefreshToken');
      if (!account?.googleRefreshToken) {
        return res.status(401).json({ message: 'Missing Google refresh token. Please re-authenticate.' });
      }

      oauth2Client.setCredentials({ refresh_token: account.googleRefreshToken });
      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      // 4. Create Google Drive folder
      const folder = await drive.files.create({
        resource: {
          name: `Material_${title}_${Date.now()}`,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });
      const folderId = folder.data.id;

      // 5. Upload original file to Drive
      const fileStream = Readable.from(file.buffer);
      const uploadedFile = await drive.files.create({
        resource: { name: file.originalname, parents: [folderId] },
        media: { mimeType: file.mimetype, body: fileStream },
        fields: 'id',
      });
      const originalFileId = uploadedFile.data.id;

      // 6. Convert PDF to PNG (if applicable)
      let totalPage = 1;
      let firstImgId = null;
      const pages = [];

      if (file.mimetype === 'application/pdf') {
        const tempDir = path.join(os.tmpdir(), 'materialshare');
        await fs.mkdir(tempDir, { recursive: true });

        const tempPdfPath = path.join(tempDir, `temp_${Date.now()}.pdf`);
        await fs.writeFile(tempPdfPath, file.buffer);

        const outputOptions = {
          density: 100,
          format: 'png',
          width: 600,
          height: 600,
        };

        let images;
        try {
          const converter = fromPath(tempPdfPath, outputOptions);
          images = await converter.bulk(-1, { responseType: 'buffer' });
        } catch (err) {
          throw new Error('PDF to PNG conversion failed: ' + err.message);
        }

        // Delete temp PDF file
        await fs.unlink(tempPdfPath);

        totalPage = images.length;

        for (let i = 0; i < images.length; i++) {
          const imgBuffer = images[i].buffer;
          const imgStream = Readable.from(imgBuffer);

          const imgRes = await drive.files.create({
            resource: {
              name: `page_${i + 1}.png`,
              parents: [folderId],
              mimeType: 'image/png',
            },
            media: {
              mimeType: 'image/png',
              body: imgStream,
            },
            fields: 'id',
          });

          const imageId = imgRes.data.id;

          pages.push(
            new Page({
              material_id: null, // update after saving material
              page_number: i + 1,
              image_id: imageId,
            })
          );

          if (i === 0) firstImgId = imageId;
        }
      }

      // 7. Save material
      const material = await new Material({
        user_id: userId,
        title,
        description,
        original_file_id: originalFileId,
        folder_id: folderId,
        first_img_id: firstImgId,
        total_page: totalPage,
        total_view: 0,
        visibility,
        category_name: category.category_name,
        file_type_id: fileType._id,
      }).save();

      // 8. Save page records
      for (const page of pages) {
        page.material_id = material._id;
        await page.save();
      }

      res.status(201).json({ message: 'Material uploaded successfully', material });
    } catch (error) {
      console.error('Error uploading material:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
];

const getMaterialPages = async (req, res) => {
  try {
    const { materialId } = req.params;
    const pages = await Page.find({ material_id: materialId }).sort({ page_number: 1 });
    res.json({ pages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pages', error: error.message });
  }
};

module.exports = { uploadMaterial, getMaterialPages };
