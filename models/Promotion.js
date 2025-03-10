const db = require("../db"); // Đảm bảo import db

class Promotion {
    static async create(product_name, name, discount, start_date, end_date) {
        if (!product_name || !name || !discount || !start_date || !end_date) {
            throw new Error("⚠ Thiếu dữ liệu đầu vào!");
        }
        const [result] = await db.execute(
            "INSERT INTO promotions (product_name, name, discount, start_date, end_date) VALUES (?, ?, ?, ?, ?)",
            [product_name, name, discount, start_date, end_date]
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await db.execute("SELECT * FROM promotions");
        return rows;
    }

    static async update(id, product_name, name, discount, start_date, end_date) {
        const [result] = await db.execute(
            "UPDATE promotions SET product_name = ?, name = ?, discount = ?, start_date = ?, end_date = ? WHERE id = ?",
            [product_name, name, discount, start_date, end_date, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.execute("DELETE FROM promotions WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Promotion;
