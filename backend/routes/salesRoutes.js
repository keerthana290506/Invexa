const express = require("express");
const router = express.Router();

const {
  createSale,
  getSales,
  getSale,
  updateSaleStatus,
  exportSalesCSV,
} = require("../controllers/salesController");
router.post("/", createSale);
router.get("/", getSales);
router.get("/:id", getSale);
router.put("/:id/status", updateSaleStatus);
router.get("/export/csv", exportSalesCSV);

module.exports = router;