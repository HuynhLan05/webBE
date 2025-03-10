const db = require("../db");

class Customer {
  static async getAll() {
    const [rows] = await db.query("SELECT * FROM customers");
    return rows;
  }

  static async getById(customerID) {
    const [rows] = await db.query(
      "SELECT * FROM customers WHERE customerID = ?",
      [customerID]
    );
    return rows[0] || null; // Nếu không tìm thấy, trả về null
  }

  static async create({ name, email, phone_number, address }) {
    if (!name || !email || !phone_number || !address) {
      throw new Error(
        " Lỗi: Các trường name, email, phone, address không được để trống!"
      );
    }

    const result = await db.query(
      "INSERT INTO customers (name, email, phone_number, address) VALUES (?, ?, ?, ?)",
      [name, email, phone_number, address]
    );
    return result.insertId;
  }

  static async update(customerID, { name, email, phone_number, address }) {
    if (!name || !email || !phone_number || !address) {
      throw new Error("Lỗi: Dữ liệu cập nhật không được để trống!");
    }

    const [result] = await db.query(
      "UPDATE customers SET name=?, email=?, phone_number=?, address=? WHERE customerID=?",
      [name, email, phone_number, address, customerID]
    );

    return result.affectedRows > 0; // Kiểm tra có update thành công không
  }

  static async delete(customerID) {
    const [result] = await db.query(
      "DELETE FROM customers WHERE customerID=?",
      [customerID]
    );
    return result.affectedRows > 0; // Kiểm tra có xóa thành công không
  }
}

module.exports = Customer;
