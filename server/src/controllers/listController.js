const List = require('../models/List');
const ListMaterial = require('../models/ListMaterial');
const User = require('../models/User');
const globalVar = require("../enums/global");

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
      await ListMaterial.create({
        material_id: material_id,
        list_id: userList._id
      });
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

module.exports = {
    toggleSaveMaterial
};