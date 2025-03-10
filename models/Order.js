const db = require("../db");

class Order {
  static async getAll() {
    const [orders] = await db.query("SELECT * FROM orders");
    return orders;
  }

  static async getById(orderId) {
    const [order] = await db.query("SELECT * FROM orders WHERE id = ?", [orderId]);
    if (order.length === 0) return null; // Trả về null nếu không tìm thấy

    // Lấy danh sách sản phẩm trong đơn hàng
    const [items] = await db.query(
      "SELECT productID, quantity, unit_price FROM order_items WHERE order_id = ?",
      [orderId]
    );

    return { ...order[0], items };
  }


  // Tạo đơn hàng mới
  static async create({ customerID, total_price, total_quantity, shipping_address, responsible_person, items }) {
    if (!customerID || !total_price || !total_quantity || !shipping_address || !responsible_person || !Array.isArray(items) || items.length === 0) {
      throw new Error("Dữ liệu đầu vào không hợp lệ!");
    }
  
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      // Bước 1: Tạo đơn hàng
      const [orderResult] = await connection.query(
        "INSERT INTO orders (customerID, total_price, total_quantity, shipping_address, responsible_person) VALUES (?, ?, ?, ?, ?)",
        [customerID, total_price, total_quantity, shipping_address, responsible_person]
      );
  
      const orderId = orderResult.insertId;
  
      // Bước 2: Thêm sản phẩm vào `order_items`
      for (const item of items) {
        if (!item.productID || !item.quantity || !item.unit_price) {
          throw new Error("Thông tin sản phẩm không hợp lệ!");
        }
        await connection.query(
          "INSERT INTO order_items (order_id, productID, quantity, unit_price) VALUES (?, ?, ?, ?)",
          [orderId, item.productID, item.quantity, item.unit_price]
        );
      }
  
      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  static async update(orderId, { total_price, total_quantity, shipping_address, responsible_person, items }) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      // Cập nhật thông tin đơn hàng
      await connection.query(
        "UPDATE orders SET total_price = ?, total_quantity = ?, shipping_address = ?, responsible_person = ? WHERE id = ?",
        [total_price, total_quantity, shipping_address, responsible_person, orderId]
      );
  
      // Xóa sản phẩm cũ trong đơn hàng
      await connection.query("DELETE FROM order_items WHERE order_id = ?", [orderId]);
  
      // Thêm sản phẩm mới vào `order_items`
      for (const item of items) {
        if (!item.productID || !item.quantity || !item.unit_price) {
          throw new Error("Thông tin sản phẩm không hợp lệ!");
        }
        await connection.query(
          "INSERT INTO order_items (order_id, productID, quantity, unit_price) VALUES (?, ?, ?, ?)",
          [orderId, item.productID, item.quantity, item.unit_price]
        );
      }
  
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Cập nhật trạng thái đơn hàng + Cập nhật kho nếu "Delivered"
  static async updateStatus(orderId, newStatus) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      // Cập nhật trạng thái đơn hàng
      const [result] = await connection.query("UPDATE orders SET status = ? WHERE id = ?", [newStatus, orderId]);
  
      if (result.affectedRows === 0) {
        throw new Error("Không tìm thấy đơn hàng!");
      }
  
      // Nếu đơn hàng đã giao thành công, cập nhật kho hàng
      if (newStatus === "Delivered") {
        console.log(`Cập nhật kho cho đơn hàng ${orderId}`);
        await this.updateInventory(orderId, connection);
      }
  
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  static async delete(orderId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      // Xóa sản phẩm trong đơn hàng
      await connection.query("DELETE FROM order_items WHERE order_id = ?", [orderId]);
  
      // Xóa đơn hàng
      const [result] = await connection.query("DELETE FROM orders WHERE id = ?", [orderId]);
  
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Cập nhật kho hàng dựa vào sản phẩm trong đơn hàng
  static async updateInventory(orderId, connection) {
    const [orderItems] = await connection.query(
      "SELECT productID, quantity FROM order_items WHERE order_id = ?",
      [orderId]
    );
  
    for (const item of orderItems) {
      const [updateResult] = await connection.query(
        "UPDATE inventory SET stock_level = stock_level - ?, sold_quantity = sold_quantity + ? WHERE productID = ? AND stock_level >= ?",
        [item.quantity, item.quantity, item.productID, item.quantity]
      );
  
      // Nếu không cập nhật được, có thể do hàng tồn kho không đủ
      if (updateResult.affectedRows === 0) {
        throw new Error(`Kho không đủ hàng cho sản phẩm ID ${item.productID}`);
      }
    }
  }
  
}

module.exports = Order;
