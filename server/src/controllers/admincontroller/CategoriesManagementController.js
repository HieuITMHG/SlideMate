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

module.exports = { getAllCaregories, createNewCategory };