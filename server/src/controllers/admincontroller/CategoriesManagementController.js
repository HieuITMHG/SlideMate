const Category = require("../../models/Category");
const Printer = require("../../utils/debugPrinter");

const getAllCaregories = async (req, res) => {
    try {
        Printer.notify("call api get all categories");
        const categories = await Category.find();
        const data = categories.map(c => ({
            id: c._id,
            name: c.category_name
        }));
        res.json({ message: "ok", "data": data });
    } catch (err) {
        console.error("error:", err);
        res.status(500).json({ message: err });
    }
};

const createNewCategory = async (req, res) => {
    try {
        Printer.notify("call api create new category, name: ", req.body.name);
        const name = req.body.name;
        const exixst = await Category.find({ category_name: name });
        if (exixst.length > 0) {
            throw new Error("Tên danh mục đã tồn tại!");
        }

        const newcat = await Category.create({ category_name: name });
        res.json({ message: "ok", "data": [] });
    } catch (err) {
        console.error("error:", err);
        res.status(500).json({ message: err.message });
    }
};

const renameCategory = async (req, res) =>{
    try{
        const {id, new_name} = req.body;
        Printer.notify("call api rename category: ", req.body);


        // check id
        const checkId = await Category.exists({_id:id});
        if (!checkId)
            throw new Error("id danh mục không tồn tại")

        const category = await Category.find({_id:id});
        if (category[0].category_name == new_name)
            throw new Error("Tên danh mục không thay đổi");

        const checkDuplicateName = Category.exists({category_name:new_name});
        if(checkDuplicateName)
            throw new Error("Tên danh mục đã tồn tại")

        // update
        const result = await Category.updateOne({_id: id}, {$set:{category_name:new_name}});

        console.log(result);
        res.json({ message: "ok" , "data":[]});
    }catch(err){
        console.error("error:", err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAllCaregories, createNewCategory, renameCategory };