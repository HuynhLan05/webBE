const express = require("express");
const router = express.Router();
const db = require("../db");

// API: Lấy danh sách phân quyền
router.get("/", async (req, res) => {
    try {
      const [users] = await db.query(`
        SELECT u.id, u.name, u.email, u.phone_number AS phone, 
               r.name AS role, 'Đã duyệt' AS status, 
               u.last_login
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.role_id = 1  -- Lấy tài khoản có vai trò Quản trị viên
      `);
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: "Lỗi lấy danh sách phân quyền!", details: err.message });
    }
  });
  
  // API: Cập nhật thời gian đăng nhập khi user đăng nhập thành công
  router.put("/update-login/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const currentTime = new Date();
  
      const [result] = await db.query(
        "UPDATE users SET last_login = ? WHERE id = ?",
        [currentTime, id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Không tìm thấy người dùng!" });
      }
  
      res.json({ message: "Cập nhật thời gian đăng nhập thành công!", lastLogin: currentTime });
    } catch (err) {
      res.status(500).json({ error: "Lỗi cập nhật thời gian đăng nhập!", details: err.message });
    }
  });

// Thêm người dùng phân quyền
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, role, status } = req.body;
    if (!name || !email || !phone || !role) {
      return res.status(400).json({ error: "Vui lòng nhập đủ thông tin!" });
    }

    await db.query(
      "INSERT INTO decentralization (name, email, phone, role, status) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, role, status || "Chờ duyệt"]
    );

    res.json({ message: "Thêm người dùng thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi thêm người dùng!", details: err.message });
  }
});

// Cập nhật người dùng phân quyền
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, status } = req.body;

    await db.query(
      "UPDATE decentralization SET name=?, email=?, phone=?, role=?, status=? WHERE id=?",
      [name, email, phone, role, status, id]
    );

    res.json({ message: "Cập nhật thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi cập nhật!", details: err.message });
  }
});

// Xóa người dùng phân quyền
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM decentralization WHERE id=?", [id]);

    res.json({ message: "Xóa người dùng thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi xóa người dùng!", details: err.message });
  }
});

module.exports = router;
