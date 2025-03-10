const Order = require("../models/Order"); // Kiểm tra đường dẫn import Model

exports.getAllOrders = async (req, res) => {
    try {
      console.log("Đang gọi Order.getAll()");
      const orders = await Order.getAll();
      console.log("Kết quả trả về:", orders);
      res.json(orders);
    } catch (error) {
      console.error("Lỗi:", error);
      res.status(500).json({ error: "Lỗi lấy danh sách đơn hàng!", details: error.message });
    }
  };
  

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng!" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy đơn hàng!" });
  }
};

exports.createOrder = async (req, res) => {
    try {
      const { customerID, total_price, total_quantity, shipping_address, responsible_person, items } = req.body;
      
      if (!customerID || !total_price || !total_quantity || !shipping_address || !responsible_person || !items || !items.length) {
        return res.status(400).json({ error: "Thiếu thông tin đơn hàng hoặc danh sách sản phẩm!" });
      }
  
      console.log(" Nhận yêu cầu tạo đơn hàng:", req.body);
      
      const orderId = await Order.create({ customerID, total_price, total_quantity, shipping_address, responsible_person, items });
      
      console.log("Đơn hàng đã tạo, ID:", orderId);
      res.status(201).json({ message: "Đơn hàng đã được tạo!", orderId });
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      res.status(500).json({ error: "Lỗi tạo đơn hàng!", details: error.message });
    }
  };
  
  exports.updateOrder = async (req, res) => {
    try {
      const { total_price, total_quantity, shipping_address, responsible_person, items } = req.body;
      const { id } = req.params;
  
      if (!total_price || !total_quantity || !shipping_address || !responsible_person || !items || !items.length) {
        return res.status(400).json({ error: "Thiếu thông tin cần cập nhật!" });
      }
  
      console.log("Cập nhật đơn hàng ID:", id);
      
      const success = await Order.update(id, { total_price, total_quantity, shipping_address, responsible_person, items });
  
      if (!success) return res.status(404).json({ error: "Không tìm thấy đơn hàng!" });
  
      res.json({ message: "Cập nhật đơn hàng thành công!" });
    } catch (error) {
      console.error("Lỗi cập nhật đơn hàng:", error);
      res.status(500).json({ error: "Lỗi cập nhật đơn hàng!", details: error.message });
    }
  };
  exports.deleteOrder = async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Xóa đơn hàng ID:", id);
  
      const success = await Order.delete(id);
      if (!success) return res.status(404).json({ error: "Không tìm thấy đơn hàng!" });
  
      res.json({ message: "Xóa đơn hàng thành công!" });
    } catch (error) {
      console.error("Lỗi xóa đơn hàng:", error);
      res.status(500).json({ error: "Lỗi xóa đơn hàng!", details: error.message });
    }
  };
  
  exports.updateOrderStatus = async (req, res) => {
    try {
      const { status } = req.body;
      const { id } = req.params;
  
      console.log(`Cập nhật trạng thái đơn hàng ID ${id} thành "${status}"`);
  
      const success = await Order.updateStatus(id, status);
  
      if (!success) {
        return res.status(404).json({ error: "Không tìm thấy đơn hàng!" });
      }
  
      res.json({ message: "Cập nhật trạng thái đơn hàng thành công!" });
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái đơn hàng:", error);
      res.status(500).json({ error: "Lỗi cập nhật trạng thái đơn hàng!", details: error.message });
    }
  };
  