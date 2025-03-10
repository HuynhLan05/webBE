const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

router.get("/", customerController.getAll);
router.get("/:customerID", customerController.getById);
router.post("/", customerController.create);
router.put("/:customerID", customerController.update);
router.delete("/:customerID", customerController.delete);

module.exports = router;