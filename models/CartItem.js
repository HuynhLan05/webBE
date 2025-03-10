const db = require("../db");

class CartItem {
  // Lấy tất cả sản phẩm trong giỏ hàng
  static async getAll() {
    const [rows] = await db.query("SELECT * FROM cart_items");
    return rows;
  }

  // Lấy giỏ hàng của một khách hàng theo customerID
  static async getByCustomer(customerID) {
    const [rows] = await db.query(
      "SELECT * FROM cart_items WHERE customerID = ?",
      [customerID]
    );
    return rows;
  }

  // Thêm sản phẩm vào giỏ hàng
  static async create({ customerID, productID, product_name, product_image, quantity, unit_price }) {
    if (!customerID || !productID || !product_name || !product_image || !quantity || !unit_price) {
      throw new Error("⚠ Vui lòng điền đầy đủ thông tin!");
    }

    const [result] = await db.query(
      "INSERT INTO cart_items (customerID, productID, product_name, product_image, quantity, unit_price) VALUES (?, ?, ?, ?, ?, ?)",
      [customerID, productID, product_name, product_image, quantity, unit_price]
    );

    return result.insertId;
  }

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  static async update(cartItemID, { quantity }) {
    if (!quantity || quantity < 1) {
      throw new Error("⚠ Số lượng phải lớn hơn 0!");
    }

    const [result] = await db.query(
      "UPDATE cart_items SET quantity=? WHERE id=?",
      [quantity, cartItemID]
    );

    return result.affectedRows > 0;
  }

  // Xóa một sản phẩm khỏi giỏ hàng
  static async delete(cartItemID) {
    const [result] = await db.query(
      "DELETE FROM cart_items WHERE id=?",
      [cartItemID]
    );

    return result.affectedRows > 0;
  }

  // Xóa toàn bộ giỏ hàng của khách hàng
  static async clearCart(customerID) {
    const [result] = await db.query(
      "DELETE FROM cart_items WHERE customerID=?",
      [customerID]
    );

    return result.affectedRows > 0;
  }
}

module.exports = CartItem;
