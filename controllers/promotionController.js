const Promotion = require("../models/Promotion");

exports.getAllPromotions = async (req, res) => {
    const promotions = await Promotion.getAll();
    res.json(promotions);
};

exports.createPromotion = async (req, res) => {
    try {
        const { product_name, name, discount, start_date, end_date } = req.body;

        if (!product_name || !name || !discount || !start_date || !end_date) {
            return res.status(400).json({ error: "Thiếu dữ liệu đầu vào!" });
        }

        await Promotion.create(product_name, name, discount, start_date, end_date);
        res.status(201).json({ message: "Chương trình ưu đãi đã được thêm" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.updatePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        const { product_name, name, discount, start_date, end_date } = req.body;

        if (!product_name || !name || !discount || !start_date || !end_date) {
            return res.status(400).json({ error: "Thiếu dữ liệu cập nhật!" });
        }

        const success = await Promotion.update(id, product_name, name, discount, start_date, end_date);
        if (!success) {
            return res.status(404).json({ error: "Không tìm thấy chương trình ưu đãi!" });
        }

        res.json({ message: " Chương trình ưu đãi đã được cập nhật" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.deletePromotion = async (req, res) => {
    const { id } = req.params;
    await Promotion.delete(id);
    res.json({ message: "Chương trình ưu đãi đã bị xóa" });
};
