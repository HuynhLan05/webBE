// orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Lấy danh sách đơn hàng
router.get("/", orderController.getAllOrders);

// Lấy chi tiết đơn hàng (bao gồm order_items)
router.get("/:id", orderController.getOrderById);

// Tạo đơn hàng mới
router.post("/", orderController.createOrder);

// Cập nhật trạng thái đơn hàng
router.put("/:id/status", orderController.updateOrderStatus);

// Hủy đơn hàng (cộng lại số lượng vào kho)
router.delete("/:id", orderController.deleteOrder);

module.exports = router;
