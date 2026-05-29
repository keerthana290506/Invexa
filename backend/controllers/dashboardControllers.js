const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Alert = require("../models/Alert");

/* ==============================
   1. DASHBOARD SUMMARY
============================== */
const getDashboardSummary = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const lowStock = await Product.countDocuments({
      stockQuantity: { $lte: 5 },
    });

    const sales = await Sale.find();

    const totalRevenue = sales.reduce(
      (sum, s) => sum + (s.totalAmount || 0),
      0
    );

    const totalOrders = sales.length;

    res.json({
      success: true,
      data: {
        products: {
          total: totalProducts,
          lowStock,
        },
        sales: {
          thisMonth: {
            revenue: totalRevenue,
            orders: totalOrders,
          },
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ==============================
   2. WEEKLY TREND (GRAPH)
============================== */
const getWeeklyTrend = async (req, res, next) => {
  try {
    const sales = await Sale.find();

    const grouped = {};

    sales.forEach((sale) => {
      const date = new Date(sale.createdAt)
        .toISOString()
        .split("T")[0];

      grouped[date] =
        (grouped[date] || 0) + (sale.totalAmount || 0);
    });

    const result = Object.keys(grouped).map((date) => ({
      date,
      revenue: grouped[date],
    }));

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/* ==============================
   3. MONTHLY TREND (GRAPH)
============================== */
const getMonthlyTrend = async (req, res, next) => {
  try {
    const sales = await Sale.find();

    const grouped = {};

    sales.forEach((sale) => {
      const month = new Date(sale.createdAt).toLocaleString(
        "default",
        { month: "short" }
      );

      grouped[month] =
        (grouped[month] || 0) + (sale.totalAmount || 0);
    });

    const result = Object.keys(grouped).map((month) => ({
      month,
      revenue: grouped[month],
    }));

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/* ==============================
   4. LOW STOCK ITEMS
============================== */
const getLowStockItems = async (req, res, next) => {
  try {
    const products = await Product.find({
      stockQuantity: { $lte: 5 },
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

/* ==============================
   5. RESTOCK SUGGESTIONS
============================== */
const getRestockSuggestionsHandler = async (req, res, next) => {
  try {
    const products = await Product.find({
      stockQuantity: { $lte: 5 },
    });

    const suggestions = products.map((p) => ({
      productId: p._id,
      name: p.name,
      currentStock: p.stockQuantity,
      suggestedQty: p.reorderLevel + 10,
    }));

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (err) {
    next(err);
  }
};

/* ==============================
   6. ALERTS
============================== */
const getAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: alerts,
    });
  } catch (err) {
    next(err);
  }
};

/* ==============================
   7. MARK SINGLE ALERT READ
============================== */
const markAlertRead = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    res.json({
      success: true,
      data: alert,
    });
  } catch (err) {
    next(err);
  }
};

/* ==============================
   8. MARK ALL ALERTS READ
============================== */
const markAllAlertsRead = async (req, res, next) => {
  try {
    await Alert.updateMany({}, { isRead: true });

    res.json({
      success: true,
      message: "All alerts marked as read",
    });
  } catch (err) {
    next(err);
  }
};

/* ==============================
   EXPORT ALL
============================== */
module.exports = {
  getDashboardSummary,
  getWeeklyTrend,
  getMonthlyTrend,
  getLowStockItems,
  getRestockSuggestionsHandler,
  getAlerts,
  markAlertRead,
  markAllAlertsRead,
};