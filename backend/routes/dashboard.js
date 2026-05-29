const express = require("express");
const router = express.Router();

const {
  getDashboardSummary,
  getWeeklyTrend,
  getMonthlyTrend,
  getLowStockItems,
  getRestockSuggestionsHandler,
  getAlerts,
  markAlertRead,
  markAllAlertsRead,
} = require("../controllers/dashboardControllers");

const { protect } = require("../middleware/auth");

// 🔐 Protect all dashboard routes
router.use(protect);

// ================= DASHBOARD =================
router.get("/summary", getDashboardSummary);

// ⚠️ TREND ROUTES (IMPORTANT FIX BELOW)
router.get("/weekly-trend", getWeeklyTrend);
router.get("/monthly-trend", getMonthlyTrend);

// ================= STOCK =================
router.get("/low-stock", getLowStockItems);
router.get("/restock-suggestions", getRestockSuggestionsHandler);

// ================= ALERTS =================
router.get("/alerts", getAlerts);
router.patch("/alerts/read-all", markAllAlertsRead);
router.patch("/alerts/:id/read", markAlertRead);

module.exports = router;