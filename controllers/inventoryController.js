const Inventory = require("../models/Inventory");

//  Lấy toàn bộ danh sách kho hàng
exports.getAllInventory = async (req, res) => {
    try {
        const inventory = await Inventory.getAll();
        if (inventory.length === 0) {
            return res.status(204).send(); // Không có dữ liệu
        }
        res.json(inventory);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách kho hàng:", error);
        res.status(500).json({ error: "Lỗi hệ thống khi lấy kho hàng!" });
    }
};

//  Lấy thông tin kho hàng theo ID
exports.getInventoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const inventory = await Inventory.getById(id);
        if (!inventory) {
            return res.status(404).json({ error: "Không tìm thấy sản phẩm trong kho!" });
        }
        res.json(inventory);
    } catch (error) {
        console.error("Lỗi khi lấy kho hàng theo ID:", error);
        res.status(500).json({ error: "Lỗi hệ thống!" });
    }
};

// Thêm sản phẩm vào kho
exports.addInventory = async (req, res) => {
    try {
        const { productID, product_name, stock_level, restock_date } = req.body;

        if (!productID || !product_name || stock_level === undefined) {
            return res.status(400).json({ error: "Thiếu dữ liệu đầu vào!" });
        }

        console.log(`Thêm sản phẩm ID ${productID} vào kho, số lượng: ${stock_level}`);

        const newInventoryId = await Inventory.add(productID, product_name, stock_level, restock_date);
        res.status(201).json({ message: "Sản phẩm đã được thêm vào kho!", inventoryId: newInventoryId });
    } catch (error) {
        console.error("🔥 Lỗi khi thêm sản phẩm vào kho:", error);
        res.status(400).json({ error: "Không thể thêm sản phẩm vào kho!", details: error.message });
    }
};


// Cập nhật số lượng tồn kho & số lượng đã bán
exports.updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { added_quantity, restock_date } = req.body;

        if (!added_quantity || isNaN(added_quantity) || added_quantity <= 0) {
            return res.status(400).json({ error: "Số lượng nhập thêm phải lớn hơn 0!" });
        }

        console.log(`Cập nhật kho hàng ID ${id}, nhập thêm: ${added_quantity}`);

        const success = await Inventory.update(id, added_quantity, restock_date);
        if (!success) {
            return res.status(404).json({ error: "Không tìm thấy sản phẩm trong kho để cập nhật!" });
        }

        res.json({ message: "Kho hàng đã được cập nhật!" });
    } catch (error) {
        console.error("🔥 Lỗi khi cập nhật kho hàng:", error);
        res.status(500).json({ error: "Lỗi hệ thống!", details: error.message });
    }
};



//  Xóa sản phẩm khỏi kho
exports.deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Inventory.delete(id);

        if (!success) {
            return res.status(404).json({ error: "Không tìm thấy sản phẩm trong kho để xóa!" });
        }

        res.json({ message: "Sản phẩm đã bị xóa khỏi kho!" });
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm khỏi kho:", error);
        res.status(500).json({ error: "Lỗi hệ thống!" });
    }
};

// Lấy danh sách sản phẩm có số lượng tồn kho thấp
exports.getLowStockItems = async (req, res) => {
    try {
        const lowStockItems = await Inventory.getLowStock();
        if (lowStockItems.length === 0) {
            return res.status(204).send(); // Trả về không có nội dung nếu không có sản phẩm nào tồn kho thấp
        }
        res.json(lowStockItems);
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm tồn kho thấp:", error);
        res.status(500).json({ error: "Lỗi hệ thống!" });
    }
};

// Cập nhật kho khi bán sản phẩm (giảm tồn kho, tăng số lượng đã bán)
exports.sellProduct = async (req, res) => {
    try {
        const { productID, quantity } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!productID || !quantity) {
            return res.status(400).json({ error: "Thiếu thông tin sản phẩm hoặc số lượng bán!" });
        }

        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ error: "Số lượng bán phải là số lớn hơn 0!" });
        }

        // Kiểm tra sản phẩm có tồn tại không
        const inventory = await Inventory.getById(productID);
        if (!inventory) {
            return res.status(404).json({ error: "Sản phẩm không tồn tại trong kho!" });
        }

        // Kiểm tra số lượng có đủ không
        if (inventory.stock_level < quantity) {
            return res.status(400).json({ error: "Số lượng trong kho không đủ!" });
        }

        const success = await Inventory.sellProduct(productID, quantity);
        if (!success) {
            return res.status(400).json({ error: "Không thể cập nhật kho hàng. Có thể xảy ra lỗi!" });
        }

        res.json({ message: "Kho hàng đã được cập nhật sau khi bán sản phẩm!" });
    } catch (error) {
        console.error("Lỗi khi cập nhật kho hàng sau khi bán:", error);
        res.status(500).json({ error: "Lỗi hệ thống!" });
    }
};
