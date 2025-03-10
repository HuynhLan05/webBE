const db = require("../db");

class Statistics {
  static async getRevenue() {
    const [rows] = await db.query("SELECT SUM(total_price) as revenue FROM orders");
    return rows[0];
  }

  static async getBestSellers() {
    const [rows] = await db.query(
      "SELECT product_id, SUM(quantity) as total_sold FROM order_items GROUP BY product_id ORDER BY total_sold DESC LIMIT 10"
    );
    return rows;
  }
}

module.exports = Statistics;
