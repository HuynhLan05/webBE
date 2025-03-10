const CartItem = require("../models/CartItem");

// Lấy tất cả sản phẩm trong giỏ hàng
exports.getAllCartItems = async (req, res) => {
  try {
    const items = await CartItem.getAll();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy giỏ hàng!", details: error.message });
  }
};

// Lấy giỏ hàng theo customerID
exports.getCartByCustomer = async (req, res) => {
  try {
    const { customerID } = req.params;
    const items = await CartItem.getByCustomer(customerID);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy giỏ hàng!", details: error.message });
  }
};

// Thêm sản phẩm vào giỏ hàng
exports.addItemToCart = async (req, res) => {
  try {
    const newItemID = await CartItem.create(req.body);
    res.status(201).json({ message: "Thêm vào giỏ hàng thành công!", cartItemID: newItemID });
  } catch (error) {
    res.status(400).json({ error: "Lỗi thêm vào giỏ hàng!", details: error.message });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
exports.updateCartItem = async (req, res) => {
  try {
    const { cartItemID } = req.params;
    const updated = await CartItem.update(cartItemID, req.body);

    if (updated) {
      res.json({ message: "Cập nhật số lượng thành công!" });
    } else {
      res.status(404).json({ error: "Không tìm thấy sản phẩm!" });
    }
  } catch (error) {
    res.status(400).json({ error: "Lỗi cập nhật giỏ hàng!", details: error.message });
  }
};

// Xóa một sản phẩm khỏi giỏ hàng
exports.removeItemFromCart = async (req, res) => {
  try {
    const { cartItemID } = req.params;
    const deleted = await CartItem.delete(cartItemID);

    if (deleted) {
      res.json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công!" });
    } else {
      res.status(404).json({ error: "Không tìm thấy sản phẩm!" });
    }
  } catch (error) {
    res.status(400).json({ error: "Lỗi xóa sản phẩm!", details: error.message });
  }
};

// Xóa toàn bộ giỏ hàng của khách hàng
exports.clearCart = async (req, res) => {
  try {
    const { customerID } = req.params;
    const cleared = await CartItem.clearCart(customerID);

    if (cleared) {
      res.json({ message: "Giỏ hàng đã được làm trống!" });
    } else {
      res.status(404).json({ error: "Không tìm thấy giỏ hàng!" });
    }
  } catch (error) {
    res.status(400).json({ error: "Lỗi làm trống giỏ hàng!", details: error.message });
  }
};
