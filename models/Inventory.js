const db = require("../db");

class Inventory {
  // Lấy tất cả sản phẩm trong kho
  static async getAll() {
    const [rows] = await db.query("SELECT * FROM inventory");
    return rows;
  }

  // Lấy thông tin sản phẩm theo ID
  static async getById(id) {
    const [rows] = await db.query("SELECT * FROM inventory WHERE id = ?", [id]);
    return rows[0] || null;
  }

  // Thêm sản phẩm vào kho
  static async add(productID, product_name, stock_level, restock_date) {
    if (!productID || !product_name || stock_level === undefined) {
      throw new Error("Lỗi: productID, product_name và stock_level không được để trống!");
    }

    // Kiểm tra sản phẩm có tồn tại trong bảng products không
    const [productCheck] = await db.query("SELECT * FROM products WHERE productID = ?", [productID]);
    if (productCheck.length === 0) {
      throw new Error("Lỗi: productID không tồn tại trong bảng products!");
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Thêm sản phẩm vào kho
      const [result] = await connection.query(
        "INSERT INTO inventory (productID, product_name, stock_level, sold_quantity, restock_date) VALUES (?, ?, ?, ?, ?)",
        [productID, product_name, stock_level, 0, restock_date || null]
      );

      // Cập nhật số lượng tồn kho trong bảng products
      await connection.query(
        "UPDATE products SET stock_quantity = stock_quantity + ? WHERE productID = ?",
        [stock_level, productID]
      );

      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }


  // Cập nhật số lượng tồn kho & số lượng đã bán
  static async update(id, added_quantity, restock_date) {
    if (added_quantity <= 0) {
        throw new Error("Lỗi: Số lượng nhập thêm phải lớn hơn 0!");
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Lấy thông tin sản phẩm trong kho
        const [inventoryCheck] = await connection.query(
            "SELECT productID, stock_level FROM inventory WHERE id = ?", 
            [id]
        );

        if (inventoryCheck.length === 0) {
            throw new Error(`Lỗi: Không tìm thấy sản phẩm ID ${id} trong kho!`);
        }

        const productID = inventoryCheck[0].productID;
        const newStockLevel = inventoryCheck[0].stock_level + added_quantity;

        // Cập nhật số lượng tồn kho trong `inventory`
        await connection.query(
            "UPDATE inventory SET stock_level = ?, added_quantity = ?, restock_date = ? WHERE id = ?",
            [newStockLevel, added_quantity, restock_date, id]
        );

        // Cập nhật số lượng tồn kho trong `products`
        await connection.query(
            "UPDATE products SET stock = stock + ? WHERE productID = ?",
            [added_quantity, productID]
        );

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}



  // Xóa sản phẩm khỏi kho
  static async delete(id) {
    const [result] = await db.query("DELETE FROM inventory WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  // Lấy sản phẩm sắp hết hàng (còn dưới 5 sản phẩm)
  static async getLowStock() {
    const [rows] = await db.query("SELECT * FROM inventory WHERE stock_level < 5");
    return rows;
  }

  // Cập nhật kho khi bán hàng (giảm stock_level, tăng sold_quantity)
  static async sellProduct(productID, quantity) {
    if (quantity <= 0) {
      throw new Error("Lỗi: Số lượng bán phải lớn hơn 0!");
    }
  
    const [inventoryCheck] = await db.query(
      "SELECT stock_level, sold_quantity FROM inventory WHERE productID = ?", 
      [productID]
    );
  
    if (inventoryCheck.length === 0) {
      throw new Error(`Lỗi: Sản phẩm ID ${productID} không tồn tại trong kho!`);
    }
  
    const stock_level = inventoryCheck[0].stock_level;
    if (stock_level < quantity) {
      throw new Error(`Lỗi: Sản phẩm ID ${productID} không đủ hàng tồn kho!`);
    }
  
    // Cập nhật số lượng tồn kho và số lượng đã bán
    await db.query(
      "UPDATE inventory SET stock_level = stock_level - ?, sold_quantity = sold_quantity + ? WHERE productID = ?",
      [quantity, quantity, productID]
    );
  
    return true;
  }
}  

module.exports = Inventory;
