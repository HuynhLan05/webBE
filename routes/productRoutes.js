const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../middleware/upload");

// Lấy danh sách sản phẩm
router.get("/", productController.getAllProducts);

// Lấy sản phẩm theo ID
router.get("/:productID", productController.getProductById);

// Thêm sản phẩm mới (hỗ trợ upload ảnh)
router.post("/", upload.single("thumbnail"), productController.createProduct);

// Cập nhật sản phẩm (có thể thay đổi ảnh)
router.put("/:productID", upload.single("thumbnail"), productController.updateProduct);

// Xóa sản phẩm
router.delete("/:productID", productController.deleteProduct);

module.exports = router;

