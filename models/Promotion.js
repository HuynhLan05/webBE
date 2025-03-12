const db = require("../db"); // Đảm bảo import db


class Promotion {
    static async getAll() {
        const [rows] = await db.execute(
            `SELECT pr.*, p.price AS original_price, 
            (p.price * (1 - pr.discount / 100)) AS final_price 
            FROM promotions pr 
            JOIN products p ON pr.productID = p.productID`
        );
        return rows;
    }

    static async create(productID, name, discount, start_date, end_date) {
        const [product] = await db.execute("SELECT price FROM products WHERE productID = ?", [productID]);
        if (product.length === 0) throw new Error("Sản phẩm không tồn tại!");

        const originalPrice = product[0].price;
        const finalPrice = originalPrice * (1 - discount / 100);

        await db.execute("INSERT INTO promotions (productID, name, discount, start_date, end_date) VALUES (?, ?, ?, ?, ?)", 
            [productID, name, discount, start_date, end_date]
        );
        await db.execute("UPDATE products SET price = ? WHERE productID = ?", [finalPrice, productID]);
    }

    static async update(id, productID, name, discount, start_date, end_date) {
        const [promo] = await db.execute("SELECT * FROM promotions WHERE id = ?", [id]);
        if (promo.length === 0) return false;

        const [product] = await db.execute("SELECT price FROM products WHERE productID = ?", [productID]);
        if (product.length === 0) throw new Error("Sản phẩm không tồn tại!");

        const originalPrice = product[0].price / (1 - promo[0].discount / 100);  // Khôi phục giá gốc
        const finalPrice = originalPrice * (1 - discount / 100); 

        await db.execute("UPDATE promotions SET productID = ?, name = ?, discount = ?, start_date = ?, end_date = ? WHERE id = ?", 
            [productID, name, discount, start_date, end_date, id]
        );
        await db.execute("UPDATE products SET price = ? WHERE productID = ?", [finalPrice, productID]);

        return true;
    }

    static async delete(id) {
        const [promo] = await db.execute("SELECT * FROM promotions WHERE id = ?", [id]);
        if (promo.length === 0) return false;

        const productID = promo[0].productID;
        const discount = promo[0].discount;

        const [product] = await db.execute("SELECT price FROM products WHERE productID = ?", [productID]);
        if (product.length === 0) throw new Error("Sản phẩm không tồn tại!");

        const restoredPrice = product[0].price / (1 - discount / 100);  // Khôi phục giá gốc

        await db.execute("DELETE FROM promotions WHERE id = ?", [id]);
        await db.execute("UPDATE products SET price = ? WHERE productID = ?", [restoredPrice, productID]);

        return true;
    }
}

module.exports = Promotion;
