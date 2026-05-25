const express = require('express');
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
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
 
router.use(protect);
 
router.get('/summary', getDashboardSummary);
router.get('/weekly-trend', getWeeklyTrend);
router.get('/monthly-trend', getMonthlyTrend);
router.get('/low-stock', getLowStockItems);
router.get('/restock-suggestions', getRestockSuggestionsHandler);
 
// Alerts
router.get('/alerts', getAlerts);
router.patch('/alerts/read-all', markAllAlertsRead);
router.patch('/alerts/:id/read', markAlertRead);
 
module.exports = router;