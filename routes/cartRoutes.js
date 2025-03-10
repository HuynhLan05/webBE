const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

router.get("/", cartController.getAllCartItems);
router.get("/:customerID", cartController.getCartByCustomer);
router.post("/", cartController.addItemToCart);
router.put("/:cartItemID", cartController.updateCartItem);
router.delete("/:cartItemID", cartController.removeItemFromCart);
router.delete("/clear/:customerID", cartController.clearCart);

module.exports = router;
