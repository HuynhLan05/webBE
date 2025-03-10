const express = require("express");
const router = express.Router();
const statisticsController = require("../controllers/statisticsController");

router.get("/revenue", statisticsController.getRevenue);
router.get("/best-sellers", statisticsController.getBestSellers);

module.exports = router;
