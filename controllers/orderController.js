const Order = require("../models/Order");
const db = require("../db"); // 🔥 THÊM DÒNG NÀY ĐỂ IMPORT `db`

// Lấy danh sách đơn hàng
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.getAll();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Lỗi lấy danh sách đơn hàng!" });
    }
};

// Lấy chi tiết đơn hàng
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.getById(req.params.id);
        if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng!" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: "Lỗi lấy đơn hàng!" });
    }
};

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
    try {
        const { customerID, shipping_address, responsible_person, items } = req.body;
        
        if (!customerID || !shipping_address || !responsible_person || !items || !items.length) {
            return res.status(400).json({ error: "Thiếu thông tin đơn hàng hoặc danh sách sản phẩm!" });
        }

        const orderId = await Order.create({ customerID, shipping_address, responsible_person, items });
        res.status(201).json({ message: "Đơn hàng đã tạo!", orderId });
    } catch (error) {
        res.status(500).json({ error: "Lỗi tạo đơn hàng!", details: error.message });
    }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const success = await Order.updateStatus(id, status);
        if (!success) return res.status(404).json({ error: "Không tìm thấy đơn hàng!" });

        res.json({ message: "Cập nhật trạng thái thành công!" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi cập nhật trạng thái!", details: error.message });
    }
};

// Hủy đơn hàng (chỉ đổi trạng thái thành "Canceled")
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Order.updateStatus(id, "Canceled"); // 🔥 KHÔNG XÓA ĐƠN HÀNG
        if (!success) return res.status(404).json({ error: "Không tìm thấy đơn hàng!" });

        res.json({ message: "Đơn hàng đã hủy!" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi hủy đơn hàng!", details: error.message });
    }
};

// XÓA ĐƠN HÀNG (CỘNG LẠI KHO TRƯỚC KHI XÓA)
exports.deleteOrder = async (req, res) => {
  const orderId = req.params.id;
  const connection = await db.getConnection();

  try {
      await connection.beginTransaction();

      // Lấy danh sách sản phẩm trong `order_items`
      const [orderItems] = await connection.query(
          "SELECT productID, quantity FROM order_items WHERE order_id = ?",
          [orderId]
      );

      // Cộng lại số lượng vào `products.stock` và `inventory.stock_level`, giảm `inventory.sold_quantity`
      for (const item of orderItems) {
          await connection.query(
              "UPDATE products SET stock = stock + ? WHERE productID = ?",
              [item.quantity, item.productID]
          );

          await connection.query(
              "UPDATE inventory SET stock_level = stock_level + ?, sold_quantity = sold_quantity - ? WHERE productID = ?",
              [item.quantity, item.quantity, item.productID]
          );
      }

      // Xóa `order_items`
      await connection.query("DELETE FROM order_items WHERE order_id = ?", [orderId]);

      // Xóa đơn hàng
      const [result] = await connection.query("DELETE FROM orders WHERE id = ?", [orderId]);

      if (result.affectedRows === 0) {
          throw new Error("Không tìm thấy đơn hàng!");
      }

      await connection.commit();
      res.json({ message: "Đơn hàng đã bị xóa và kho đã cập nhật!" });

  } catch (error) {
      await connection.rollback();
      res.status(500).json({ error: "Lỗi xóa đơn hàng!", details: error.message });
  } finally {
      connection.release();
  }
};

