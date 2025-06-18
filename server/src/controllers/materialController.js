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
const List = require("../models/List");
const ListMaterial = require("../models/ListMaterial");
const Report = require("../models/Report");
const Like = require("../models/Like");
const Tag = require("../models/Tag");
const MaterialTag = require("../models/MaterialTag");
const globalVar = require("../enums/global");

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
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// Convert to PDF
async function convertToPDF(fileBuffer) {
  return new Promise((resolve, reject) => {
    libre.convert(fileBuffer, '.pdf', undefined, (err, pdfBuffer) => {
      if (err) {
        console.error('LibreOffice conversion error:', err.stack);
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
  const context = canvas.getContext('2d');
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toBuffer('image/png');
}

// Upload buffer to Cloudinary
async function uploadBufferToCloudinary(buffer, publicId, folder, resource_type = 'auto', format) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type,
        public_id: publicId,
        folder,
        format, // Chỉ định format rõ ràng
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
  upload.single('file'),
  async (req, res) => {
    const { title, description, visibility, category_id, tags } = req.body;
    const file = req.file;

    if (!file || !title || !visibility) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const accountId = new mongoose.Types.ObjectId(req.user.id);
      const user = await User.findOne({ account: accountId });
      if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      const userId = user._id;

      const mimeType = file.mimetype;
      let fileExtension, typeName, originalFormat;
      if (mimeType === 'application/pdf') {
        fileExtension = 'pdf';
        typeName = 'PDF';
        originalFormat = 'pdf';
      } else if (mimeType.includes('word')) {
        fileExtension = mimeType.includes('openxml') ? 'docx' : 'doc';
        typeName = 'Word';
        originalFormat = fileExtension;
      } else {
        fileExtension = mimeType.includes('openxml') ? 'pptx' : 'ppt';
        typeName = 'PowerPoint';
        originalFormat = fileExtension;
      }

      let fileType = await FileType.findOne({ extention: fileExtension });
      if (!fileType) {
        fileType = await new FileType({ type_name: typeName, extention: fileExtension }).save();
      }

      const materialId = new mongoose.Types.ObjectId().toString();
      const folder = `SlideMate/${materialId}`;

      const originalPublicId = `original.${originalFormat}`;
      const originalFileUrl = await uploadBufferToCloudinary(file.buffer, originalPublicId, folder, 'raw', originalFormat);

      let pdfBuffer = file.buffer;
      if (fileExtension !== 'pdf') {
        pdfBuffer = await convertToPDF(file.buffer);
      }

      const pdfPublicId = 'converted.pdf';
      const pdfFileUrl = await uploadBufferToCloudinary(pdfBuffer, pdfPublicId, folder, 'raw', 'pdf');

      const data = await pdf(pdfBuffer);
      const totalPages = data.numpages || 1;

      const thumbnailBuffer = await generateThumbnail(pdfBuffer);
      const thumbnailPublicId = 'thumbnail.png';
      const thumbnailUrl = await uploadBufferToCloudinary(thumbnailBuffer, thumbnailPublicId, folder, 'image', 'png');

      const material = await new Material({
        user_id: userId,
        title,
        description,
        original_file_path: originalFileUrl,
        pdf_version_path: pdfFileUrl,
        thumbnail_path: thumbnailUrl,
        total_pages: totalPages,
        total_views: 0,
        total_likes: 0,
        visibility,
        category_id: new mongoose.Types.ObjectId(category_id),
        file_type_id: fileType._id,
      }).save();

      // Xử lý tags
      if (tags && Array.isArray(tags)) {
        for (const tagName of tags) {
          const trimmedTag = tagName.trim().toLowerCase();
          if (!trimmedTag) continue;

          let tag = await Tag.findOne({ tag_name: trimmedTag });

          if (!tag) {
            tag = await new Tag({ tag_name: trimmedTag }).save();
          }

          await new MaterialTag({
            material_id: material._id,
            tag_id: tag._id,
          }).save();
        }
      }

      res.status(201).json({ message: 'Upload successful', material });
    } catch (error) {
      console.error('Upload error:', error.stack);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
];

// Get material by ID
const getMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;

    // Kiểm tra materialId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(materialId)) {
      return res.status(400).json({ message: 'Invalid materialId' });
    }

    // Find the material
    const material = await Material.findById(materialId).populate({
      path: 'user_id',
      populate: {
        path: 'account',
        model: 'Account',
        select: 'username _id',
      },
    });

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Fetch category name
    const category = await Category.findById(material.category_id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Initialize is_saved and is_liked as false
    let is_saved = false;
    let is_liked = false;

    // Check save and like status for authenticated users
    if (req.user?.id) {
      const accountId = new mongoose.Types.ObjectId(req.user.id);
      const user = await User.findOne({ account: accountId });
      if (user) {
        // Kiểm tra trạng thái lưu
        const laterList = await List.findOne({ user_id: user._id, list_name: globalVar.DEFAULT_LIST_NAME });
        if (laterList) {
          const savedMaterial = await ListMaterial.findOne({
            list_id: laterList._id,
            material_id: material._id,
          });
          is_saved = !!savedMaterial;
        }

        // Kiểm tra trạng thái thích
        const likedMaterial = await Like.findOne({
          user_id: user._id,
          material_id: material._id,
        });
        is_liked = !!likedMaterial;
      }
    }

    // Format material to match getMaterialsByCategory
    const formattedMaterial = {
      id: material._id,
      title: material.title,
      description: material.description,
      original_file_path: material.original_file_path,
      pdf_version_path: material.pdf_version_path,
      thumbnail_path: material.thumbnail_path,
      total_pages: material.total_pages,
      total_views: material.total_views,
      total_likes: material.total_likes || 0,
      visibility: material.visibility,
      category_name: category.category_name,
      created_at: material.createdAt,
      updated_at: material.updatedAt,
      user: {
        userId: material.user_id?._id,
        accountId: material.user_id?.account?._id,
        username: material.user_id?.account?.username,
      },
      file_type: material.file_type_id,
      is_saved,
      is_liked, // Thêm is_liked
    };

    res.json({ material: formattedMaterial });
  } catch (error) {
    console.error('Error fetching material:', error.stack);
    res.status(500).json({ message: 'Failed to fetch material', error: error.message });
  }
};


const getMaterialsByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;

    // Find the category
    const category = await Category.findOne({ category_name: categoryName });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Fetch materials for the category
    const materials = await Material.find({ category_id: category._id, is_active: true, visibility: 'PUBLIC' }).populate({
      path: 'user_id',
      mode: 'User',
      populate: {
        path: 'account',
        model: 'Account',
        select: 'username _id',
      },
    });

    // Initialize formatted materials with is_saved: false, is_liked: false
    let formattedMaterials = materials.map((material) => ({
      id: material._id,
      title: material.title,
      description: material.description,
      original_file_path: material.pdf_version_path,
      pdf_version_path: material.pdf_version_path,
      thumbnail_path: material.thumbnail_path,
      total_pages: material.total_pages,
      total_views: material.total_views,
      total_likes: material.total_likes,
      visibility: material.visibility,
      category_name: category.category_name,
      created_at: material.createdAt,
      updated_at: material.updatedAt,
      user: {
        userId: material.user_id?._id,
        accountId: material.user_id?.account?._id,
        username: material.user_id?.account?.username,
      },
      file_type: material.file_type_id,
      is_saved: false, // Default for unauthenticated/no user
      is_liked: false, // Default for unauthenticated/no user
    }));

    // Check save and like status for authenticated users
    if (req.user?.id) {
      const accountId = new mongoose.Types.ObjectId(req.user.id);
      const user = await User.findOne({ account: accountId });
      if (user) {
        // Lấy danh sách material đã lưu
        const laterList = await List.findOne({ user_id: user._id, list_name: globalVar.DEFAULT_LIST_NAME });
        let savedMaterialIds = [];
        if (laterList) {
          const savedMaterials = await ListMaterial.find({ list_id: laterList._id }).select('material_id');
          savedMaterialIds = savedMaterials.map((lm) => lm.material_id.toString());
        }

        // Lấy danh sách material đã thích
        const likedMaterials = await Like.find({ user_id: user._id }).select('material_id');
        const likedMaterialIds = likedMaterials.map((like) => like.material_id.toString());

        // Cập nhật is_saved và is_liked
        formattedMaterials = materials.map((material) => ({
          id: material._id,
          title: material.title,
          description: material.description,
          original_file_path: material.pdf_version_path,
          pdf_version_path: material.pdf_version_path,
          thumbnail_path: material.thumbnail_path,
          total_pages: material.total_pages,
          total_views: material.total_views,
          total_likes: material.total_likes,
          visibility: material.visibility,
          category_name: category.category_name,
          created_at: material.createdAt,
          updated_at: material.updatedAt,
          user: {
            userId: material.user_id?._id,
            accountId: material.user_id?.account?._id,
            username: material.user_id?.account?.username,
          },
          file_type: material.file_type_id,
          is_saved: savedMaterialIds.includes(material._id.toString()),
          is_liked: likedMaterialIds.includes(material._id.toString()),
        }));
      }
    }

    res.json({ category: categoryName, materials: formattedMaterials });
  } catch (error) {
    console.error('Error fetching materials by category:', error.stack);
    res.status(500).json({
      message: 'Failed to fetch materials by category',
      error: error.message,
    });
  }
};

const report = async (req, res) => {
  try {
    const { materialId, content } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!materialId || !content) {
      return res.status(400).json({ message: 'Thiết id tài liệu' });
    }

    // Kiểm tra materialId có hợp lệ
    if (!mongoose.Types.ObjectId.isValid(materialId)) {
      return res.status(400).json({ message: 'Id tài liệu không hợp lệ' });
    }

    // Lấy user_id từ User dựa trên account ID
    const accountId = new mongoose.Types.ObjectId(req.user.id);
    const user = await User.findOne({ account: accountId });
    if (!user) {
      return res.status(404).json({ message: 'User không tồn tại' });
    }
    const userId = user._id;

    // Xác định khoảng thời gian của ngày hiện tại
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // 00:00:00 của ngày hiện tại
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // 23:59:59 của ngày hiện tại

    // Kiểm tra xem user đã báo cáo material trong ngày hôm nay chưa
    if (
      await Report.findOne({
        user_id: user._id,
        material_id: materialId,
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
    ) {
      return res.status(400).json({ message: 'Hôm nay bạn đã báo cáo bài này rồi' });
    }

    // Đếm số báo cáo của user cho material_id trong ngày hiện tại
    const reportCount = await Report.countDocuments({
      user_id: userId,
      material_id: materialId,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // Kiểm tra giới hạn 3 báo cáo
    if (reportCount >= 3) {
      return res.status(429).json({
        message: 'Bạn đã đạt giới hạn 3 lần báo cáo ngày hôm nay',
      });
    }

    // Tạo báo cáo mới
    const report = new Report({
      user_id: userId,
      material_id: materialId,
      report_content: content,
      status: 'PENDING', // Mặc định theo schema
      is_delete_material: false, // Giá trị mặc định
      is_ban_account: false, // Giá trị mặc định
      // admin_id: null, // Giả định schema đã bỏ required: true
    });

    // Lưu báo cáo vào database
    await report.save();

    res.status(201).json({ message: 'Báo cáo thành công', report });
  } catch (error) {
    console.error('Error reporting material:', error.stack);
    res.status(500).json({
      message: 'Báo cáo thất bại',
      error: error.message,
    });
  }
};

const toggleLike = async (req, res) => {
  try {
    const { materialId } = req.params; // Lấy materialId từ URL
    // Kiểm tra materialId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(materialId)) {
      return res.status(400).json({ message: 'Invalid materialId' });
    }

    // Lấy user_id từ User dựa trên account ID
    const accountId = new mongoose.Types.ObjectId(req.user.id);
    const user = await User.findOne({ account: accountId });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    const userId = user._id;

    // Kiểm tra material tồn tại
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Kiểm tra xem user đã thích material chưa
    const existingLike = await Like.findOne({
      user_id: userId,
      material_id: materialId,
    });

    let liked = false;
    let message = '';

    if (existingLike) {
      // Nếu đã thích, xóa Like và giảm total_likes
      await Like.deleteOne({ _id: existingLike._id });
      await Material.findByIdAndUpdate(materialId, {
        $inc: { total_likes: -1 },
      });
      liked = false;
      message = 'Đã bỏ thích tài liệu!';
    } else {
      // Nếu chưa thích, tạo Like mới và tăng total_likes
      await new Like({
        user_id: userId,
        material_id: materialId,
      }).save();
      await Material.findByIdAndUpdate(materialId, {
        $inc: { total_likes: 1 },
      });
      liked = true;
      message = 'Bạn đã thích tài liệu!';
    }

    res.status(200).json({ liked, message });
  } catch (error) {
    console.error('Error toggling like:', error.stack);
    res.status(500).json({
      message: 'Error toggling like',
      error: error.message,
    });
  }
};

const searchMaterialsByTitle = async (req, res) => {
  try {
    const { query } = req.query; // Get search query from query parameters
    // Validate query
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({ message: 'Invalid or missing search query' });
    }
    
    // Create case-insensitive regex for title search
    const regex = new RegExp(query.trim(), 'i'); // 'i' for case-insensitive
    // Find materials matching the title
    const materials = await Material.find({ title: regex, is_active: true, visibility: 'PUBLIC' }).populate({
      path: 'user_id',
      populate: {
        path: 'account',
        model: 'Account',
        select: 'username _id',
      },
    });

    if (!materials || materials.length === 0) {
      return res.status(404).json({ message: 'No materials found matching the query' });
    }

    // Fetch category names and format materials
    const formattedMaterials = await Promise.all(
      materials.map(async (material) => {
        // Fetch category name
        const category = await Category.findById(material.category_id);
        const categoryName = category ? category.category_name : 'Unknown';

        // Initialize is_saved and is_liked
        let is_saved = false;
        let is_liked = false;

        // Check save and like status for authenticated users
        if (req.user?.id) {
          const accountId = new mongoose.Types.ObjectId(req.user.id);
          const user = await User.findOne({ account: accountId });
          if (user) {
            // Check save status
            const laterList = await List.findOne({ user_id: user._id, list_name: globalVar.DEFAULT_LIST_NAME });
            if (laterList) {
              const savedMaterial = await ListMaterial.findOne({
                list_id: laterList._id,
                material_id: material._id,
              });
              is_saved = !!savedMaterial;
            }

            // Check like status
            const likedMaterial = await Like.findOne({
              user_id: user._id,
              material_id: material._id,
            });
            is_liked = !!likedMaterial;
          }
        }

        // Format material to match getMaterial
        return {
          id: material._id,
          title: material.title,
          description: material.description,
          original_file_path: material.original_file_path,
          pdf_version_path: material.pdf_version_path,
          thumbnail_path: material.thumbnail_path,
          total_pages: material.total_pages,
          total_views: material.total_views,
          total_likes: material.total_likes || 0,
          visibility: material.visibility,
          category_name: categoryName,
          created_at: material.createdAt,
          updated_at: material.updatedAt,
          user: {
            userId: material.user_id?._id,
            accountId: material.user_id?.account?._id,
            username: material.user_id?.account?.username || 'Unknown',
          },
          file_type: material.file_type_id,
          is_saved,
          is_liked,
        };
      })
    );

    res.json({ materials: formattedMaterials });
  } catch (error) {
    console.error('Error searching materials:', error.stack);
    res.status(500).json({ message: 'Failed to search materials', error: error.message });
  }
};

const getRelatedMaterials = async (req, res) => {
  const { id: materialId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(materialId)) {
    return res.status(400).json({ message: 'Invalid material ID' });
  }

  try {
    const material = await Material.findById(materialId);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    // 1. Tìm các tag liên quan
    const tags = await MaterialTag.find({ material_id: material._id }).lean();
    const tagIds = tags.map((t) => t.tag_id);

    // 2. Tìm tài liệu cùng tag (trừ chính nó)
    const relatedByTags = await MaterialTag.aggregate([
      {
        $match: {
          tag_id: { $in: tagIds },
          material_id: { $ne: material._id },
        },
      },
      {
        $group: {
          _id: '$material_id',
          sharedTags: { $sum: 1 },
        },
      },
      { $sort: { sharedTags: -1 } },
      { $limit: 10 },
    ]);

    const relatedIds = relatedByTags.map((r) => r._id);

    // 3. Lấy tài liệu liên quan từ DB
    let relatedMaterials = await Material.find({
      _id: { $in: relatedIds },
      is_active: true,
      visibility: 'PUBLIC',
    })
      .populate({
        path: 'user_id',
        populate: {
          path: 'account',
          model: 'Account',
          select: 'username _id',
        },
      })
      .lean();

    // 4. Nếu chưa đủ thì thêm tài liệu cùng category (loại trừ chính nó và đã có)
    if (relatedMaterials.length < 1) {
      const excludeIds = [...relatedIds.map((id) => id.toString()), material._id.toString()];

      const extraMaterials = await Material.find({
        _id: { $nin: excludeIds },
        category_id: material.category_id,
        is_active: true,
        visibility: 'PUBLIC',
      })
        .limit(10 - relatedMaterials.length)
        .populate({
          path: 'user_id',
          populate: {
            path: 'account',
            model: 'Account',
            select: 'username _id',
          },
        })
        .lean();

      relatedMaterials = [...relatedMaterials, ...extraMaterials];
    }

    // 5. Kiểm tra trạng thái like/save nếu đã đăng nhập
    let savedMaterialIds = [];
    let likedMaterialIds = [];

    if (req.user?.id) {
      const accountId = new mongoose.Types.ObjectId(req.user.id);
      const user = await User.findOne({ account: accountId });

      if (user) {
        const laterList = await List.findOne({ user_id: user._id, list_name: globalVar.DEFAULT_LIST_NAME });
        if (laterList) {
          const savedMaterials = await ListMaterial.find({ list_id: laterList._id }).select('material_id');
          savedMaterialIds = savedMaterials.map((lm) => lm.material_id.toString());
        }

        const likedMaterials = await Like.find({ user_id: user._id }).select('material_id');
        likedMaterialIds = likedMaterials.map((like) => like.material_id.toString());
      }
    }

    // 6. Format kết quả
    const formattedMaterials = await Promise.all(
      relatedMaterials.map(async (m) => {
        const category = await Category.findById(m.category_id);
        const categoryName = category ? category.category_name : 'Unknown';

        return {
          id: m._id,
          title: m.title,
          description: m.description,
          original_file_path: m.original_file_path,
          pdf_version_path: m.pdf_version_path,
          thumbnail_path: m.thumbnail_path,
          total_pages: m.total_pages,
          total_views: m.total_views,
          total_likes: m.total_likes || 0,
          visibility: m.visibility,
          category_name: categoryName,
          created_at: m.createdAt,
          updated_at: m.updatedAt,
          user: {
            userId: m.user_id?._id,
            accountId: m.user_id?.account?._id,
            username: m.user_id?.account?.username || 'Unknown',
          },
          file_type: m.file_type_id,
          is_saved: savedMaterialIds.includes(m._id.toString()),
          is_liked: likedMaterialIds.includes(m._id.toString()),
        };
      })
    );

    return res.json({ materials: formattedMaterials });
  } catch (error) {
    console.error('Error getting related materials:', error.stack || error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getTopViewedMaterialsByCategory = async (req, res) => {
  const { category_id } = req.params; // hoặc req.query.name nếu bạn truyền qua query
  try {
    const category = Category.findOne({_id: category_id});

    // 2. Lấy 10 tài liệu có lượt xem cao nhất
    let materials = await Material.find({
      category_id: new mongoose.Types.ObjectId(category_id),
      is_active: true,
      visibility: 'PUBLIC',
    })
      .sort({ total_views: -1 })
      .limit(10)
      .populate({
        path: 'user_id',
        populate: {
          path: 'account',
          model: 'Account',
          select: 'username _id',
        },
      });

    // 3. Chuẩn bị danh sách is_saved và is_liked
    let savedMaterialIds = [];
    let likedMaterialIds = [];

    if (req.user?.id) {
      const accountId = new mongoose.Types.ObjectId(req.user.id);
      const user = await User.findOne({ account: accountId });
      if (user) {
        const laterList = await List.findOne({ user_id: user._id, list_name: globalVar.DEFAULT_LIST_NAME });
        if (laterList) {
          const savedMaterials = await ListMaterial.find({ list_id: laterList._id }).select('material_id');
          savedMaterialIds = savedMaterials.map((lm) => lm.material_id.toString());
        }

        const likedMaterials = await Like.find({ user_id: user._id }).select('material_id');
        likedMaterialIds = likedMaterials.map((like) => like.material_id.toString());
      }
    }

    // 4. Format kết quả giống các hàm khác
    const formattedMaterials = materials.map((material) => ({
      id: material._id,
      title: material.title,
      description: material.description,
      original_file_path: material.pdf_version_path,
      pdf_version_path: material.pdf_version_path,
      thumbnail_path: material.thumbnail_path,
      total_pages: material.total_pages,
      total_views: material.total_views,
      total_likes: material.total_likes || 0,
      visibility: material.visibility,
      category_name: category.category_name,
      created_at: material.createdAt,
      updated_at: material.updatedAt,
      user: {
        userId: material.user_id?._id,
        accountId: material.user_id?.account?._id,
        username: material.user_id?.account?.username || 'Unknown',
      },
      file_type: material.file_type_id,
      is_saved: savedMaterialIds.includes(material._id.toString()),
      is_liked: likedMaterialIds.includes(material._id.toString()),
    }));

    return res.json({ category: category.category_name, materials: formattedMaterials });
  } catch (error) {
    console.error('Error fetching top viewed materials:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const increaseMaterialView = async (req, res) => {
  const { id } = req.params;

  try {
    const material = await Material.findByIdAndUpdate(
      id,
      { $inc: { total_views: 1 } },
      { new: true }
    );

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.status(200).json({ message: "View count increased", material });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserUploadedMaterials = async (req, res) => {
  try {
    const accountId = new mongoose.Types.ObjectId(req.user.id);
    const user = await User.findOne({ account: accountId });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const materials = await Material.find({ 
      user_id: user._id,
      is_active: true 
    })
    .populate('category_id', 'category_name')
    .populate('file_type_id', 'type_name')
    .sort({ createdAt: -1 });

    // Get tags for each material
    const materialsWithTags = await Promise.all(materials.map(async (material) => {
      const materialTags = await MaterialTag.find({ material_id: material._id })
        .populate('tag_id', 'tag_name')
        .lean();
      
      const tags = materialTags.map(mt => mt.tag_id.tag_name);

      return {
        id: material._id,
        title: material.title,
        description: material.description,
        original_file_path: material.original_file_path,
        pdf_version_path: material.pdf_version_path,
        thumbnail_path: material.thumbnail_path,
        total_pages: material.total_pages,
        total_views: material.total_views,
        total_likes: material.total_likes,
        visibility: material.visibility,
        category_name: material.category_id.category_name,
        file_type: material.file_type_id.type_name,
        created_at: material.createdAt,
        updated_at: material.updatedAt,
        tags: tags
      };
    }));

    res.json(materialsWithTags);
  } catch (error) {
    console.error('Error getting user materials:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteMaterial = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const { materialId } = req.params;
    const accountId = new mongoose.Types.ObjectId(req.user.id);

    // Ensure materialId is valid
    if (!mongoose.Types.ObjectId.isValid(materialId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid material ID' });
    }

    const user = await User.findOne({ account: accountId }).session(session);
    
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const material = await Material.findOne({ 
      _id: materialId,
      user_id: user._id 
    }).session(session);

    if (!material) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Material not found or you do not have permission to delete it' });
    }

    // Delete all related records within the transaction
    await Promise.all([
      Like.deleteMany({ material_id: material._id }, { session }),
      ListMaterial.deleteMany({ material_id: material._id }, { session }),
      MaterialTag.deleteMany({ material_id: material._id }, { session }),
      Material.findByIdAndUpdate(
        material._id,
        { is_active: false },
        { session, new: true } // Ensure session is passed and return updated document
      )
    ]);

    // Commit the transaction
    await session.commitTransaction();
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    // Handle transient transaction errors
    if (error.errorLabels?.includes('TransientTransactionError')) {
      console.warn('Transient transaction error, consider retrying:', error.message);
      // Optionally implement retry logic here (see below)
    }

    await session.abortTransaction();
    console.error('Error deleting material:', error);
    res.status(500).json({ 
      message: 'Error deleting material',
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

const updateMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { title, description, visibility, tags } = req.body;
    const accountId = new mongoose.Types.ObjectId(req.user.id);
    const user = await User.findOne({ account: accountId });
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const material = await Material.findOne({ 
      _id: materialId,
      user_id: user._id 
    });

    if (!material) {
      return res.status(404).json({ message: 'Material not found or you do not have permission to edit it' });
    }

    // Update basic information (excluding category)
    if (title) material.title = title;
    if (description) material.description = description;
    if (visibility) material.visibility = visibility;

    // Update tags if provided
    if (tags && Array.isArray(tags)) {
      // Remove existing tags
      await MaterialTag.deleteMany({ material_id: material._id });

      // Add new tags
      for (const tagName of tags) {
        const trimmedTag = tagName.trim().toLowerCase();
        if (!trimmedTag) continue;

        let tag = await Tag.findOne({ tag_name: trimmedTag });
        if (!tag) {
          tag = await new Tag({ tag_name: trimmedTag }).save();
        }

        await new MaterialTag({
          material_id: material._id,
          tag_id: tag._id,
        }).save();
      }
    }

    await material.save();

    // Get updated material with populated fields
    const updatedMaterial = await Material.findById(material._id)
      .populate('category_id', 'category_name')
      .populate('file_type_id', 'type_name');

    res.json({ 
      message: 'Material updated successfully',
      material: updatedMaterial
    });
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const toggleMaterialVisibility = async (req, res) => {
  try {
    const { materialId } = req.params;
    const accountId = new mongoose.Types.ObjectId(req.user.id);
    const user = await User.findOne({ account: accountId });
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const material = await Material.findOne({ 
      _id: materialId,
      user_id: user._id 
    });

    if (!material) {
      return res.status(404).json({ message: 'Tài liệu không được tìm thấy' });
    }

    // Toggle visibility
    material.visibility = material.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
    await material.save();

    res.json({ 
      message: 'Khả năng hiện thị',
      visibility: material.visibility
    });
  } catch (error) {
    console.error('Error toggling material visibility:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all materials uploaded by a specific user
const getUserMaterials = async (req, res) => {
  try {
    
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    console.log('Found user:', user.username);

    const materials = await Material.find({ user_id: userId, is_deleted: false })
      .populate('category_id', 'name')
      .populate('user_id', 'username')
      .lean();

    // Get tags for each material
    const materialsWithTags = await Promise.all(materials.map(async (material) => {
      
      const materialTags = await MaterialTag.find({ material_id: material._id })
        .populate('tag_id', 'name')
        .lean();

      const tags = materialTags.map(mt => mt.tag_id.name);

      return {
        ...material,
        tags: tags
      };
    }));

    res.json(materialsWithTags);
  } catch (error) {
    console.error('Error in getUserMaterials:', error);
    res.status(500).json({ message: 'Error fetching user materials' });
  }
};

module.exports = { 
  uploadMaterial, 
  getMaterial, 
  getMaterialsByCategory, 
  report, 
  toggleLike, 
  searchMaterialsByTitle, 
  getRelatedMaterials,
  getTopViewedMaterialsByCategory,
  increaseMaterialView,
  getUserUploadedMaterials,
  deleteMaterial,
  updateMaterial,
  toggleMaterialVisibility,
  getUserMaterials
};