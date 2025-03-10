require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("./db");
const path = require("path");


const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import Routes
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const promotionRoutes = require("./routes/promotionRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const orderRoutes = require("./routes/orderRoutes"); // ✅ Đảm bảo đường dẫn đúng
const statisticsRoutes = require("./routes/statisticsRoutes");
const customerRoutes = require("./routes/customerRoutes");
const brandRoutes = require("./routes/brandRoutes");
const decentralizationRoutes = require("./routes/decentralizationRoutes");
const cartRoutes = require("./routes/cartRoutes");
 
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/decentralization", decentralizationRoutes);


// 🛠 Kiểm tra kết nối MySQL
db.execute("SELECT 1")
  .then(() => console.log("Kết nối MySQL thành công"))
  .catch((err) => console.error(" Lỗi kết nối MySQL:", err));

/** ==========================
 *  🔹 API: Đăng ký người dùng
 *  ========================== */
app.post("/register", async (req, res) => {
  try {
    const { name, email, phone_number, password, role_id } = req.body;
    if (!name || !email || !phone_number || !password || !role_id) {
      return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin!" });
    }

    // Kiểm tra email đã tồn tại chưa
    const [existingUser] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email đã tồn tại!" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Mật khẩu phải có ít nhất 6 ký tự!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (name, email, phone_number, password, role_id) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone_number, hashedPassword, role_id]
    );

    res.status(201).json({ message: "Đăng ký thành công!", userId: result.insertId });
  } catch (err) {
    console.error("Lỗi đăng ký:", err);
    res.status(500).json({ error: "Lỗi đăng ký!", details: err.message });
  }
});

/** ==========================
 *  🔹 API: Đăng nhập (BẰNG NAME)
 *  ========================== */
app.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ error: "Vui lòng nhập tên và mật khẩu!" });
    }

    console.log("Dữ liệu nhận được:", { name, password });

    // Tìm user theo name
    const [users] = await db.query("SELECT * FROM users WHERE name = ?", [name]);

    if (users.length === 0) {
      console.log("Không tìm thấy user trong database!");
      return res.status(401).json({ error: "Tên hoặc mật khẩu không đúng!" });
    }

    const user = users[0];
    console.log("User trong database:", user);

    if (!user.password) {
      console.log("Lỗi: Không có trường password!");
      return res.status(500).json({ error: "Lỗi dữ liệu tài khoản!" });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Kết quả bcrypt:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Tên hoặc mật khẩu không đúng!" });
    }

    // Tạo token
    const token = jwt.sign(
      { userId: user.id, roleId: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Trả về thông tin user + token
    res.json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        role_id: user.role_id
      }
    });

  } catch (err) {
    console.error("🚨 Lỗi đăng nhập:", err);
    res.status(500).json({ error: "Lỗi đăng nhập!", details: err.message });
  }
});



/** ==========================
 *  🔹 API: Lấy danh sách người dùng
 *  ========================== */
app.get("/users", async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, name, email, phone_number, role_id, created_at FROM users");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy danh sách người dùng!", details: err.message });
  }
});

/** ==========================
 *  🔹 API: Cập nhật vai trò người dùng
 *  ========================== */
app.put("/users/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id } = req.body;

    const [result] = await db.query("UPDATE users SET role_id = ? WHERE id = ?", [role_id, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Người dùng không tồn tại!" });
    }

    res.json({ message: "Cập nhật vai trò thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi cập nhật vai trò!", details: err.message });
  }
});

/** ==========================
 *  🔹 Middleware: Xác thực người dùng
 *  ========================== */
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Không có token!" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token không hợp lệ!" });
    req.user = decoded;
    next();
  });
};

/** ==========================
 *  🔹 API: Xóa người dùng
 *  ========================== */
app.delete("/users/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.roleId !== 1) {
      return res.status(403).json({ error: "Bạn không có quyền xóa người dùng!" });
    }

    const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Người dùng không tồn tại!" });
    }

    res.json({ message: "Xóa người dùng thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi xóa người dùng!", details: err.message });
  }
});

app.put("/api/user/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, password } = req.body;

  try {
    // Kiểm tra xem user có tồn tại không
    const [existingUser] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({ error: "Người dùng không tồn tại!" });
    }

    let updateFields = { name, email, phone_number: phone }; // Đổi "phone" thành "phone_number"

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }

    const [result] = await db.query("UPDATE users SET ? WHERE id = ?", [updateFields, id]);

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Không thể cập nhật thông tin!" });
    }

    res.json({ message: "Cập nhật thành công!", updatedUser: updateFields });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin:", error);
    res.status(500).json({ error: "Có lỗi xảy ra!", details: error.message });
  }
});

// Khởi chạy server
app.listen(port, () => {
  console.log(` Server đang chạy tại http://localhost:${port}`);
});
