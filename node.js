const bcrypt = require("bcryptjs");

async function hashNewPassword() {
  const newPassword = "123456"; // Nhập mật khẩu mới
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  console.log("🔑 Mật khẩu đã mã hóa:", hashedPassword);
}

hashNewPassword();