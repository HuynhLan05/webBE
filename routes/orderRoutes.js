const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController"); // Import đúng controller

// Lấy danh sách đơn hàng
router.get("/", orderController.getAllOrders); // ⚠ Kiểm tra hàm getAllOrders có bị undefined không

// Lấy chi tiết đơn hàng
router.get("/:id", orderController.getOrderById);

// Tạo đơn hàng mới
router.post("/", orderController.createOrder);

// Cập nhật trạng thái đơn hàng
router.put("/:id/status", orderController.updateOrderStatus);
// Cập nhật đơn hàng
router.put("/:id", orderController.updateOrder);

// Xóa đơn hàng
router.delete("/:id", orderController.deleteOrder);


module.exports = router;
