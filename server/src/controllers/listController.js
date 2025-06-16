const List = require('../models/List');
const ListMaterial = require('../models/ListMaterial');
const User = require('../models/User');
const globalVar = require("../enums/global");
const mongoose = require("mongoose");

const toggleSaveMaterial = async (req, res) => {
  try {
    const { material_id } = req.body;
    const account_id = req.user.id;

    // Find user by account ID
    const user = await User.findOne({ account: account_id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find or create a default list for the user
    let userList = await List.findOne({ user_id: user._id });
    if (!userList) {
        await new List({
            list_name: globalVar.DEFAULT_LIST_NAME,
            user_id: user._id,
            description: null
        }).save();
    }

    const existingListMaterial = await ListMaterial.findOne({
      material_id,
      list_id: userList._id
    });

    if (existingListMaterial) {
      // If exists, remove it (unsave)
      await ListMaterial.deleteOne({ _id: existingListMaterial._id });
      return res.status(200).json({
        message: 'Đã bỏ tài liệu khỏi danh sách xem sau',
        saved: false
      });
    } else {
      // If not exists, add it (save)
      console.log(material_id);
      await new ListMaterial({
        material_id: material_id,
        list_id: userList._id
      }).save();
      return res.status(200).json({
        message: 'Đã thêm tài liệu vào danh sách xem sau',
        saved: true
      });
    }
  } catch (error) {
    console.error('Error in toggleSaveMaterial:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getMyList = async (req, res) => {
  try {
    // Lấy user_id từ User dựa trên account ID
    const accountId = new mongoose.Types.ObjectId(req.user.id);
    const user = await User.findOne({ account: accountId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userId = user._id;

    // Lấy tất cả danh sách của user
    const lists = await List.find({ user_id: userId }).select('list_name description createdAt updatedAt');

    // Format danh sách
    const formattedLists = lists.map((list) => ({
      id: list._id,
      list_name: list.list_name,
      description: list.description || '',
      created_at: list.createdAt,
      updated_at: list.updatedAt,
    }));

    res.json({ lists: formattedLists });
  } catch (error) {
    console.error('Error fetching user lists:', error.stack);
    res.status(500).json({
      message: 'Failed to fetch user lists',
      error: error.message,
    });
  }
};

const getMyListDetail = async (req, res) => {
  try {
    const { listId } = req.params;

    // Kiểm tra listId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      return res.status(400).json({ message: 'Invalid listId' });
    }

    // Lấy user_id từ User dựa trên account ID
    const accountId = new mongoose.Types.ObjectId(req.user.id);
    const user = await User.findOne({ account: accountId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userId = user._id;

    // Tìm danh sách
    const list = await List.findOne({ _id: listId, user_id: userId });
    if (!list) {
      return res.status(404).json({ message: 'List not found or not owned by user' });
    }

    // Lấy danh sách material_id từ ListMaterial
    const listMaterials = await ListMaterial.find({ list_id: listId }).select('material_id');
    const materialIds = listMaterials.map((lm) => lm.material_id);

    // Nếu không có tài liệu nào, trả về danh sách rỗng
    if (!materialIds.length) {
      return res.json({
        list: {
          id: list._id,
          list_name: list.list_name,
          description: list.description || '',
          created_at: list.createdAt,
          updated_at: list.updatedAt,
        },
        materials: [],
      });
    }

    // Lấy thông tin chi tiết của materials
    const materials = await Material.find({ _id: { $in: materialIds } }).populate({
      path: 'user_id',
      populate: {
        path: 'account',
        model: 'Account',
        select: 'username _id',
      },
    });

    // Lấy category_name
    const categoryIds = materials.map((m) => m.category_id);
    const categories = await Category.find({ _id: { $in: categoryIds } }).select('_id category_name');
    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c.category_name]));

    // Lấy danh sách material đã thích
    const likedMaterials = await Like.find({ user_id: userId, material_id: { $in: materialIds } }).select('material_id');
    const likedMaterialIds = likedMaterials.map((like) => like.material_id.toString());

    // Lấy danh sách material đã lưu (dựa trên ListMaterial của user)
    const savedMaterials = await ListMaterial.find({ list_id: listId, material_id: { $in: materialIds } }).select('material_id');
    const savedMaterialIds = savedMaterials.map((lm) => lm.material_id.toString());

    // Format materials
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
      category_name: categoryMap.get(material.category_id.toString()) || 'General',
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

    // Format response
    res.json({
      list: {
        id: list._id,
        list_name: list.list_name,
        description: list.description || '',
        created_at: list.createdAt,
        updated_at: list.updatedAt,
      },
      materials: formattedMaterials,
    });
  } catch (error) {
    console.error('Error fetching list details:', error.stack);
    res.status(500).json({
      message: 'Failed to fetch list details',
      error: error.message,
    });
  }
};

const createListAndAddMaterial = async (req, res) => {
  try {
    const { materialId, list_name } = req.body;

    // Kiểm tra đầu vào
    if (!list_name?.trim()) {
      return res.status(400).json({ message: 'Tên danh sách là bắt buộc' });
    }
    if (!mongoose.Types.ObjectId.isValid(materialId)) {
      return res.status(400).json({ message: 'materialId không hợp lệ' });
    }

    // Lấy user_id từ User dựa trên account ID
    const accountId = new mongoose.Types.ObjectId(req.user.id);
    const user = await User.findOne({ account: accountId });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    const userId = user._id;

    // Tìm danh sách với list_name
    let list = await List.findOne({
      user_id: userId,
      list_name: list_name.trim(),
    });

    // Nếu danh sách chưa tồn tại, tạo mới
    if (!list) {
      list = new List({
        list_name: list_name.trim(),
        user_id: userId,
        description: null,
      });
      await list.save();
    }

    // Kiểm tra xem material đã có trong danh sách chưa
    const existingListMaterial = await ListMaterial.findOne({
      list_id: list._id,
      material_id: materialId,
    });

    if (existingListMaterial) {
      return res.status(400).json({ message: 'Tài liệu đã có trong danh sách này' });
    }

    // Thêm material vào danh sách
    await new ListMaterial({
      list_id: list._id,
      material_id: materialId,
    }).save();

    res.status(201).json({
      message: `Đã thêm tài liệu vào danh sách "${list_name}"`,
      listId: list._id,
    });
  } catch (error) {
    console.error('Lỗi khi tạo danh sách và thêm tài liệu:', error.stack);
    res.status(500).json({
      message: 'Không thể tạo danh sách hoặc thêm tài liệu',
      error: error.message,
    });
  }
};


module.exports = {
    toggleSaveMaterial,
    getMyList,
    getMyListDetail,
    createListAndAddMaterial,
};