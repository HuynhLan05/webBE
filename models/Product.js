const db = require("../db");

class Product {
  static async getAll() {
    const [rows] = await db.query("SELECT * FROM products ORDER BY created_at DESC");
    return rows;
  }

  static async getById(productID) {
    const [rows] = await db.query("SELECT * FROM products WHERE productID = ?", [productID]);
    return rows[0] || null;
  }

  static async create({ thumbnail, name, category, brand, price, stock, state, creator }) {
    if (!name || !category || !price || stock === undefined || !state) {
      throw new Error("Lỗi: Thiếu thông tin sản phẩm!");
    }

    const [result] = await db.query(
      "INSERT INTO products (thumbnail, name, category, brand, price, stock, state, creator) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [thumbnail || null, name, category, brand, price, stock, state, creator]
    );

    const productID = result.insertId;

    //  Sau khi thêm sản phẩm, thêm luôn vào kho
    await db.query(
      "INSERT INTO inventory (productID, product_name, stock_level, sold_quantity) VALUES (?, ?, ?, ?)",
      [productID, name, stock, 0]
    );

    return productID;
}


  static async update(productID, { thumbnail, name, category, brand, price, stock, state, creator }) {
    const [result] = await db.query(
      "UPDATE products SET thumbnail = ?, name = ?, category = ?, brand = ?, price = ?, stock = ?, state = ?, creator = ? WHERE productID = ?",
      [thumbnail, name, category, brand, price, stock, state, creator, productID]
    );

    return result.affectedRows > 0;
  }

  static async delete(productID) {
    const [result] = await db.query("DELETE FROM products WHERE productID = ?", [productID]);
    return result.affectedRows > 0;
  }
}

module.exports = Product;
