const Category = require("../models/Category");

exports.getAllCategories = async (req, res) => {
    const categories = await Category.getAll();
    res.json(categories);
};

exports.getCategoryById = async (req, res) => {
    const { id } = req.params;
    const category = await Category.getById(id);

    if (!category) {
        return res.status(404).json({ error: "Không tìm thấy danh mục!" });
    }

    res.json(category);
};

exports.createCategory = async (req, res) => {
    const { name } = req.body;
    await Category.create(name);
    res.json({ message: "Danh mục đã được thêm" });
};

exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    await Category.update(id, name);
    res.json({ message: "Danh mục đã được cập nhật" });
};

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    await Category.delete(id);
    res.json({ message: "Danh mục đã bị xóa" });
};
