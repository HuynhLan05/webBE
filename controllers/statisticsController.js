const Statistics = require("../models/Statistics");

const getRevenue = async (req, res) => {
  try {
    const revenue = await Statistics.getRevenue();
    res.json(revenue);
  } catch (error) {
    console.error("Lỗi lấy thống kê doanh thu:", error);
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu doanh thu" });
  }
};

const getBestSellers = async (req, res) => {
  try {
    const bestSellers = await Statistics.getBestSellers();
    res.json(bestSellers);
  } catch (error) {
    console.error("Lỗi lấy sản phẩm bán chạy:", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách sản phẩm bán chạy" });
  }
};

module.exports = {
  getRevenue,
  getBestSellers,
};
