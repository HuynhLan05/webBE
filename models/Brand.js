const db = require("../db");

class Brand {
  static async getAll() {
    const [rows] = await db.query("SELECT * FROM brands ORDER BY created_at DESC");
    return rows;
  }

  static async getById(brandID) {
    const [rows] = await db.query("SELECT * FROM brands WHERE brandID = ?", [brandID]);
    return rows[0] || null;
  }

  static async add(name, description) {
    if (!name) {
      throw new Error("Lỗi: Tên thương hiệu không được để trống!");
    }

    const [result] = await db.query(
      "INSERT INTO brands (name, description) VALUES (?, ?)",
      [name, description || null]
    );

    return result.insertId;
  }

  static async update(brandID, name, description) {
    const [result] = await db.query(
      "UPDATE brands SET name = ?, description = ? WHERE brandID = ?",
      [name, description, brandID]
    );
    return result.affectedRows > 0;
  }

  static async delete(brandID) {
    const [result] = await db.query("DELETE FROM brands WHERE brandID = ?", [brandID]);
    return result.affectedRows > 0;
  }
}

module.exports = Brand;
