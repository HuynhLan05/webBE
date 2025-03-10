const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");

router.get("/", inventoryController.getAllInventory);
router.get("/:id", inventoryController.getInventoryById);
router.post("/", inventoryController.addInventory);
router.put("/:id", inventoryController.updateInventory);
router.delete("/:id", inventoryController.deleteInventory);
router.get("/low-stock", inventoryController.getLowStockItems);


module.exports = router;
