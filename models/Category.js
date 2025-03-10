const db = require("../db");

class Category {
  static async getAll() {
    const [rows] = await db.query("SELECT * FROM categories");
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [id]);
    return rows[0] || null; // Trả về null nếu không tìm thấy
  }

  static async create(name) {
    const result = await db.query("INSERT INTO categories (name) VALUES (?)", [name]);
    return result.insertId;
  }

  static async update(id, name) {
    await db.query("UPDATE categories SET name=? WHERE id=?", [name, id]);
    return true;
  }

  static async delete(id) {
    await db.query("DELETE FROM categories WHERE id=?", [id]);
    return true;
  }
}

module.exports = Category;
