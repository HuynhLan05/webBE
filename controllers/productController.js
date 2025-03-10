const Product = require("../models/Product");
const upload = require("../middleware/upload");
const db = require("../db"); // Thêm kết nối database
const path = require("path");

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    products.forEach((product) => {
      if (product.thumbnail) {
        product.thumbnail = `${req.protocol}://${req.get(
          "host"
        )}/uploads/${path.basename(product.thumbnail)}`;
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { productID } = req.params;
    const product = await Product.getById(productID);

    if (!product) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm!" });
    }

    if (product.thumbnail) {
      product.thumbnail = `${req.protocol}://${req.get(
        "host"
      )}/uploads/${path.basename(product.thumbnail)}`;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, category, brand, price, stock, state, creator } = req.body;
    const thumbnail = req.file?.filename || null; // Kiểm tra file ảnh an toàn hơn

    if (!name || !category || !price || stock === undefined || !state) {
      return res.status(400).json({ error: "Thiếu dữ liệu đầu vào!" });
    }

    const productID = await Product.create({
      thumbnail,
      name,
      category,
      brand,
      price,
      stock,
      state,
      creator,
    });

    // Kiểm tra lại xem sản phẩm có thực sự vào kho chưa
    const [inventoryItem] = await db.query(
      "SELECT * FROM inventory WHERE productID = ?",
      [productID]
    );
    if (!inventoryItem.length) {
      return res.status(500).json({ error: "Lỗi khi thêm sản phẩm vào kho!" });
    }

    res
      .status(201)
      .json({
        message: "Sản phẩm đã được thêm và cập nhật vào kho!",
        productID,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { productID } = req.params;
    const { name, category, brand, price, stock, state, creator } = req.body;
    const thumbnail = req.file ? req.file.filename : null;

    const updated = await Product.update(productID, {
      thumbnail,
      name,
      category,
      brand,
      price,
      stock,
      state,
      creator,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ error: "Sản phẩm không tồn tại hoặc không có thay đổi!" });
    }

    res.json({ message: "Sản phẩm đã được cập nhật!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { productID } = req.params;

    const deleted = await Product.delete(productID);

    if (!deleted) {
      return res.status(404).json({ error: "Sản phẩm không tồn tại!" });
    }

    res.json({ message: "Sản phẩm đã bị xóa!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
