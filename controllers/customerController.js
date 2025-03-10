const Customer = require("../models/Customer");

class CustomerController {
  static async getAll(req, res) {
    try {
      const customers = await Customer.getAll();
      res.status(200).json(customers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { customerID } = req.params; // Sử dụng customerID thay vì id
      const customer = await Customer.getById(customerID);
      if (customer) {
        res.status(200).json(customer);
      } else {
        res.status(404).json({ error: "Không tìm thấy khách hàng" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { name, email, phone_number, address } = req.body;
      const customerID = await Customer.create({
        name,
        email,
        phone_number,
        address,
      });
      res.status(201).json({ message: "Đã thêm khách hàng thành công", customerID});
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { customerID } = req.params; // Sử dụng customerID thay vì id
      const { name, email, phone_number, address } = req.body;
      const success = await Customer.update(customerID, {
        name,
        email,
        phone_number,
        address,
      });
      if (success) {
        res.status(200).json({ message: "Đã cập nhật khách hàng" });
      } else {
        res.status(404).json({ error: "Không tìm thấy khách hàng" });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { customerID } = req.params; // Sử dụng customerID thay vì id
      const success = await Customer.delete(customerID);
      if (success) {
        res.status(200).json({ message: "Đã xóa khách hàng thành công" });
      } else {
        res.status(404).json({ error: "Không tìm thấy khách hàng" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CustomerController;
