const List = require('../models/List');
const ListMaterial = require('../models/ListMaterial');
const User = require('../models/User');
const Material = require('../models/Material');
const globalVar = require("../enums/global");
const Like = require('../models/Like');
const mongoose = require("mongoose");

const toggleSaveLater = async (req, res) => {
  try {
    const { material_id } = req.body;
    const account_id = req.user.id;

    // Find user by account ID
    const user = await User.findOne({ account: account_id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find or create a default list for the user
    let userList = await List.findOne({ user_id: user._id, list_name: globalVar.DEFAULT_LIST_NAME });
    if (!userList) {
        userList = await new List({
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
    console.error('Error in toggleSaveLater:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const toggleSaveList = async (req, res) => {
  try {
    const { material_id, list_id } = req.body;
    const account_id = req.user.id;

    // Find user by account ID
    const user = await User.findOne({ account: account_id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the list
    let userList = await List.findOne({ _id: list_id, user_id: user._id });

    if (!userList) {
        return res.status(404).json({
          message: 'List không được tìm thấy',
          saved: false
        })
    }

    const existingListMaterial = await ListMaterial.findOne({
      material_id,
      list_id: userList._id
    });

    if (existingListMaterial) {
      // If exists, remove it (unsave)
      await ListMaterial.deleteOne({ _id: existingListMaterial._id });
      return res.status(200).json({
        message: 'Đã bỏ tài liệu khỏi danh sách',
        saved: false
      });
    } else {
      // If not exists, add it (save)
      await new ListMaterial({
        material_id: material_id,
        list_id: userList._id
      }).save();
      return res.status(200).json({
        message: 'Đã thêm tài liệu vào danh sách',
        saved: true
      });
    }
  } catch (error) {
    console.error('Error in toggleSaveList:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getMyList = async (req, res) => {
  if (req.user.id) {
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

const getUserLists = async (req, res) => {
  try {
    // 1. Get account ID from req.user
    const accountId = req.user.id;
    if (!accountId) {
      return res.status(401).json({ message: 'Unauthorized: No account ID found' });
    }

    // 2. Find the user associated with the account
    const user = await User.findOne({ account: accountId }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userId = user._id;

    // 3. Fetch all lists for the user
    const lists = await List.find({ user_id: userId }).lean();

    // 4. For each list, count active materials and get the first active material's thumbnail
    const listsWithDetails = await Promise.all(
      lists.map(async (list) => {
        const materialCount = await ListMaterial.aggregate([
        {
          $match: {
            list_id: new mongoose.Types.ObjectId(list._id),
          },
        },
        {
          $lookup: {
            from: 'materials',
            localField: 'material_id',
            foreignField: '_id',
            as: 'material',
          },
        },
        { $unwind: '$material' },
        {
          $match: {
            'material.is_active': true,
            $or: [
              { 'material.user_id': new mongoose.Types.ObjectId(user._id) }, 
              { 'material.visibility': 'PUBLIC' },                              
            ],
          },
        },
        {
          $count: 'count',
        },
      ]);

        const count = materialCount[0]?.count || 0;

        // Find the first active material in the list
        const firstMaterial = await ListMaterial.findOne({
          list_id: list._id,
        })
          .populate({
            path: 'material_id',
            match: { is_active: true },
          })
          .lean();

        // Get thumbnail from the first active material (if it exists)
        const thumbnail = firstMaterial?.material_id?.thumbnail_path || null;

        return {
          id: list._id,
          name: list.list_name,
          items: count,
          image: thumbnail,
          description: list.description || '',
          createdAt: list.createdAt,
          updatedAt: list.updatedAt,
        };
      })
    );

    // 5. Send the response
    res.status(200).json({
      success: true,
      data: listsWithDetails,
    });
  } catch (error) {
    console.error('Error fetching user lists:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createList = async (req, res) => {
  try {
    const user = await User.findOne({ account: new mongoose.Types.ObjectId(req.user.id) });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const { list_name } = req.body;

    const existingList = await List.findOne({ list_name, user_id: user._id });
    if (existingList) {
      return res.status(400).json({ message: 'Bạn đã có danh sách với tên này rồi' });
    }

    const list = await List.create({ list_name, user_id: user._id });

    res.status(201).json({
      success: true,
      data: { id: list._id, name: list.list_name, items: 0, image: null },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const getListMaterials = async (req, res) => {
  try {
    const { listId } = req.params;
    const user = await User.findOne({ account: new mongoose.Types.ObjectId(req.user.id) });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const list = await List.findOne({ _id: listId, user_id: user._id });
    if (!list) return res.status(404).json({ message: 'List not found' });

    const listMaterials = await ListMaterial.find({ list_id: listId }).populate({
    path: 'material_id',
    match: {
      is_active: true,
      $or: [
        { visibility: 'PUBLIC' },
        { visibility: 'PRIVATE', user_id: user._id } 
      ]
    },
    populate: [
      { path: 'user_id', populate: { path: 'account' } },
      { path: 'category_id' },
      { path: 'file_type_id' },
    ],
  });

    // Lấy tất cả List của user để tìm ListMaterial tương ứng
    const userLists = await List.find({ user_id: user._id }).select('_id');
    const userListIds = userLists.map((l) => l._id);

    // Lấy tất cả ListMaterial thuộc các List của user
    const savedMaterials = await ListMaterial.find({
      list_id: { $in: userListIds },
    }).select('material_id');

    const savedMaterialIds = savedMaterials.map((m) => m.material_id.toString());

    const likedMaterials = await Like.find({ user_id: user._id });
    const likedMaterialIds = likedMaterials.map((l) => l.material_id.toString());

    const formattedMaterials = await Promise.all(
      listMaterials
        .filter((lm) => lm.material_id) // Lọc bỏ material_id là null
        .map(async (lm) => {
          const m = lm.material_id;
          const category = m.category_id;
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

    console.log(formattedMaterials.length);

    res.status(200).json({ success: true, data: formattedMaterials });
  } catch (error) {
    console.error('Error in getListMaterials:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const getList = async (req, res) => {
  try {
    const { listId } = req.params;
    const user = await User.findOne({ account: new mongoose.Types.ObjectId(req.user.id) });
    // if (!user) return res.status(404).json({ message: 'User not found' });

    const list = await List.findOne({ _id: listId, user_id: user._id });
    if (!list) return res.status(404).json({ message: 'List not found' });

    res.status(200).json({
      success: true,
      data: {
        id: list._id,
        name: list.list_name,
        description: list.description || '',
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteList = async (req, res) => {
  try {
    const { listId } = req.params;
    const accountId = req.user.id;
    const user = await User.findOne({ account: accountId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const list = await List.findOneAndDelete({ _id: listId, user_id: user._id });
    if (!list) return res.status(404).json({ message: 'List not found' });

    // Xóa tất cả ListMaterial liên quan
    await ListMaterial.deleteMany({ list_id: listId });

    res.status(200).json({ success: true, message: 'List deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateListName = async (req, res) => {
  try {
    const { listId } = req.params;
    const { list_name } = req.body;
    const accountId = req.user.id;
    const user = await User.findOne({ account: accountId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!list_name || !list_name.trim()) {
      return res.status(400).json({ message: 'List name is required' });
    }

    const list = await List.findOneAndUpdate(
      { _id: listId, user_id: user._id },
      { list_name: list_name.trim() },
      { new: true }
    );
    if (!list) return res.status(404).json({ message: 'List not found' });

    res.status(200).json({
      success: true,
      data: {
        id: list._id,
        name: list.list_name,
        description: list.description || '',
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyListWithMaterialStatus = async (req, res) => {
  if (!req.user.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const { material_id } = req.params;
    
    // Lấy user_id từ User dựa trên account ID
    const accountId = new mongoose.Types.ObjectId(req.user.id);
    const user = await User.findOne({ account: accountId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userId = user._id;

    // Lấy tất cả danh sách của user (trừ list "later")
    const lists = await List.find({ 
      user_id: userId,
      list_name: { $ne: globalVar.DEFAULT_LIST_NAME }
    }).select('list_name description createdAt updatedAt');

    // Lấy trạng thái material trong từng list
    const listsWithStatus = await Promise.all(
      lists.map(async (list) => {
        const existingListMaterial = await ListMaterial.findOne({
          material_id: material_id,
          list_id: list._id
        });

        return {
          id: list._id,
          list_name: list.list_name,
          description: list.description || '',
          created_at: list.createdAt,
          updated_at: list.updatedAt,
          is_saved: !!existingListMaterial
        };
      })
    );

    res.json({ lists: listsWithStatus });
  } catch (error) {
    console.error('Error fetching user lists with material status:', error.stack);
    res.status(500).json({
      message: 'Failed to fetch user lists',
      error: error.message,
    });
  }
};

module.exports = {
    toggleSaveLater,
    getMyList,
    getMyListDetail,
    createListAndAddMaterial,
    getUserLists,
    createList,
    getListMaterials,
    getList,
    deleteList,
    updateListName,
    toggleSaveList,
    getMyListWithMaterialStatus
};