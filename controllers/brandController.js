const Brand = require("../models/Brand");

exports.getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.getAll();
        res.json(brands);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBrandById = async (req, res) => {
    try {
        const { id } = req.params;
        const brand = await Brand.getById(id);
        if (!brand) {
            return res.status(404).json({ error: "Không tìm thấy thương hiệu!" });
        }
        res.json(brand);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addBrand = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newBrandId = await Brand.add(name, description);
        res.status(201).json({ message: "Thương hiệu đã được thêm!", brandID: newBrandId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const success = await Brand.update(id, name, description);
        if (!success) {
            return res.status(404).json({ error: "Không tìm thấy thương hiệu để cập nhật!" });
        }

        res.json({ message: "Thương hiệu đã được cập nhật" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Brand.delete(id);

        if (!success) {
            return res.status(404).json({ error: "Không tìm thấy thương hiệu để xóa!" });
        }

        res.json({ message: "Thương hiệu đã bị xóa" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
