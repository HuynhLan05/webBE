const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");

// Lấy tất cả thương hiệu
router.get("/", brandController.getAllBrands);

// Lấy thương hiệu theo ID
router.get("/:id", brandController.getBrandById);

// Thêm thương hiệu mới
router.post("/", brandController.addBrand);

// Cập nhật thương hiệu
router.put("/:id", brandController.updateBrand);

// Xóa thương hiệu
router.delete("/:id", brandController.deleteBrand);

module.exports = router;
