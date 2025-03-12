const db = require("../db");

class Order {
    // 📌 Lấy tất cả đơn hàng
    static async getAll() {
        const [orders] = await db.query("SELECT * FROM orders");
        return orders;
    }

    // 📌 Lấy chi tiết đơn hàng
    static async getById(orderId) {
      const [order] = await db.query("SELECT * FROM orders WHERE id = ?", [orderId]);
      if (order.length === 0) return null;
  
      // Lấy danh sách sản phẩm trong đơn hàng
      const [items] = await db.query(
          "SELECT oi.productID, oi.quantity, oi.unit_price, (oi.quantity * oi.unit_price) AS item_total_price FROM order_items oi WHERE oi.order_id = ?",
          [orderId]
      );
  
      return { ...order[0], items };
  }
  

    // 📌 Tạo đơn hàng mới
    static async create({ customerID, shipping_address, responsible_person, items }) {
      const connection = await db.getConnection();
      try {
          await connection.beginTransaction();
  
          // 📌 Bước 1: Tạo đơn hàng (ban đầu total_price = 0)
          const [orderResult] = await connection.query(
              "INSERT INTO orders (customerID, shipping_address, responsible_person, status, total_quantity, total_price) VALUES (?, ?, ?, 'Pending', 0, 0)",
              [customerID, shipping_address, responsible_person]
          );
          const orderId = orderResult.insertId;
  
          let totalQuantity = 0;
          let totalPrice = 0;
  
          // 📌 Bước 2: Thêm sản phẩm vào `order_items` và cập nhật kho
          for (const item of items) {
              const [product] = await connection.query(
                  "SELECT price FROM products WHERE productID = ?",
                  [item.productID]
              );
              if (product.length === 0) throw new Error(`Sản phẩm ID ${item.productID} không tồn tại!`);
  
              const unitPrice = product[0].price;
              const itemTotalPrice = item.quantity * unitPrice;
  
              await connection.query(
                  "INSERT INTO order_items (order_id, productID, quantity, unit_price) VALUES (?, ?, ?, ?)",
                  [orderId, item.productID, item.quantity, unitPrice]
              );
  
              totalQuantity += item.quantity;
              totalPrice += itemTotalPrice;
  
              // 📌 Trừ kho trong bảng `products`
              await connection.query(
                  "UPDATE products SET stock = stock - ? WHERE productID = ? AND stock >= ?",
                  [item.quantity, item.productID, item.quantity]
              );
  
              // 📌 Cập nhật `inventory`: Giảm `stock_level`, tăng `sold_quantity`
              await connection.query(
                  "UPDATE inventory SET stock_level = stock_level - ?, sold_quantity = sold_quantity + ? WHERE productID = ?",
                  [item.quantity, item.quantity, item.productID]
              );
          }
  
          // 📌 Bước 3: Cập nhật tổng số lượng và tổng tiền của đơn hàng
          await connection.query(
              "UPDATE orders SET total_quantity = ?, total_price = ? WHERE id = ?",
              [totalQuantity, totalPrice, orderId]
          );
  
          await connection.commit();
          return orderId;
      } catch (error) {
          await connection.rollback();
          throw error;
      } finally {
          connection.release();
      }
  }
  
  

    // 📌 Hủy đơn hàng (Cộng lại kho)
    static async cancel(orderId) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [orderItems] = await connection.query(
                "SELECT productID, quantity FROM order_items WHERE order_id = ?",
                [orderId]
            );

            for (const item of orderItems) {
                await connection.query(
                    "UPDATE products SET stock = stock + ? WHERE productID = ?",
                    [item.quantity, item.productID]
                );
            }

            await connection.query("DELETE FROM order_items WHERE order_id = ?", [orderId]);
            await connection.query("DELETE FROM orders WHERE id = ?", [orderId]);

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // 📌 Cập nhật trạng thái đơn hàng
    static async updateStatus(orderId, newStatus) {
        const [result] = await db.query(
            "UPDATE orders SET status = ? WHERE id = ?",
            [newStatus, orderId]
        );

        return result.affectedRows > 0;
    }
}

module.exports = Order;
