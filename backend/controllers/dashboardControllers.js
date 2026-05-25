const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Alert = require('../models/Alert');
const { getRestockSuggestions } = require('../utils/alertUtils');
 
// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Protected
const getDashboardSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
 
    // --- Product Stats ---
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$stockQuantity', '$reorderLevel'] },
    });
    const outOfStockProducts = await Product.countDocuments({
      isActive: true,
      stockQuantity: 0,
    });
 
    // Total inventory value
    const inventoryValue = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$stockQuantity', '$price'] } },
          totalCostValue: { $sum: { $multiply: ['$stockQuantity', '$costPrice'] } },
        },
      },
    ]);
 
    // --- Sales This Month ---
    const salesThisMonth = await Sale.aggregate([
      { $match: { date: { $gte: startOfMonth }, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          totalItemsSold: { $sum: { $sum: '$items.quantitySold' } },
        },
      },
    ]);
 
    // --- Sales Last Month ---
    const salesLastMonth = await Sale.aggregate([
      {
        $match: {
          date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);
 
    const thisMonthRevenue = salesThisMonth[0]?.totalRevenue || 0;
    const lastMonthRevenue = salesLastMonth[0]?.totalRevenue || 0;
    const revenueGrowth =
      lastMonthRevenue === 0
        ? 100
        : (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(2);
 
    // --- Unread Alerts ---
    const unreadAlerts = await Alert.countDocuments({ isRead: false, isResolved: false });
 
    // --- Top 5 Selling Products (this month) ---
    const topProducts = await Sale.aggregate([
      { $match: { date: { $gte: startOfMonth }, status: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          sku: { $first: '$items.sku' },
          totalQuantitySold: { $sum: '$items.quantitySold' },
          totalRevenue: { $sum: '$items.totalPrice' },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 5 },
    ]);
 
    // --- Category Distribution ---
    const categoryDistribution = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stockQuantity' },
          totalValue: { $sum: { $multiply: ['$stockQuantity', '$price'] } },
        },
      },
      { $sort: { totalValue: -1 } },
    ]);
 
    res.json({
      success: true,
      data: {
        products: {
          total: totalProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
          inventoryValue: inventoryValue[0]?.totalValue || 0,
          inventoryCostValue: inventoryValue[0]?.totalCostValue || 0,
        },
        sales: {
          thisMonth: {
            revenue: thisMonthRevenue,
            orders: salesThisMonth[0]?.totalOrders || 0,
            itemsSold: salesThisMonth[0]?.totalItemsSold || 0,
          },
          lastMonth: {
            revenue: lastMonthRevenue,
            orders: salesLastMonth[0]?.totalOrders || 0,
          },
          revenueGrowth: parseFloat(revenueGrowth),
        },
        alerts: { unread: unreadAlerts },
        topProducts,
        categoryDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};
 
// @desc    Get weekly sales trend (last 7 days)
// @route   GET /api/dashboard/weekly-trend
// @access  Protected
const getWeeklyTrend = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
 
    const trend = await Sale.aggregate([
      {
        $match: {
          date: { $gte: sevenDaysAgo },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          itemsSold: { $sum: { $sum: '$items.quantitySold' } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);
 
    // Fill in missing days with 0
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      };
 
      const found = trend.find(
        (t) =>
          t._id.year === dayKey.year &&
          t._id.month === dayKey.month &&
          t._id.day === dayKey.day
      );
 
      result.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: found?.revenue || 0,
        orders: found?.orders || 0,
        itemsSold: found?.itemsSold || 0,
      });
    }
 
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
 
// @desc    Get monthly sales trend (last 12 months)
// @route   GET /api/dashboard/monthly-trend
// @access  Protected
const getMonthlyTrend = async (req, res, next) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);
 
    const trend = await Sale.aggregate([
      { $match: { date: { $gte: twelveMonthsAgo }, status: 'completed' } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
 
    // Fill missing months
    const result = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
 
      const found = trend.find((t) => t._id.year === year && t._id.month === month);
 
      result.push({
        year,
        month,
        monthName: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: found?.revenue || 0,
        orders: found?.orders || 0,
      });
    }
 
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
 
// @desc    Get low stock items list
// @route   GET /api/dashboard/low-stock
// @access  Protected
const getLowStockItems = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
 
    const lowStockItems = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stockQuantity', '$reorderLevel'] },
    })
      .sort({ stockQuantity: 1 })
      .limit(parseInt(limit));
 
    res.json({ success: true, count: lowStockItems.length, data: lowStockItems });
  } catch (error) {
    next(error);
  }
};
 
// @desc    Get AI-assisted restock suggestions
// @route   GET /api/dashboard/restock-suggestions
// @access  Protected
const getRestockSuggestionsHandler = async (req, res, next) => {
  try {
    const suggestions = await getRestockSuggestions();
    res.json({
      success: true,
      count: suggestions.length,
      label: 'AI-assisted restock suggestion (rule-based model)',
      description: 'Based on 7-day Simple Moving Average of sales data.',
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};
 
// @desc    Get alerts
// @route   GET /api/dashboard/alerts
// @access  Protected
const getAlerts = async (req, res, next) => {
  try {
    const { isRead, isResolved, limit = 20 } = req.query;
 
    let query = {};
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (isResolved !== undefined) query.isResolved = isResolved === 'true';
    else query.isResolved = false;
 
    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('productId', 'name sku stockQuantity reorderLevel');
 
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    next(error);
  }
};
 
// @desc    Mark alert as read
// @route   PATCH /api/dashboard/alerts/:id/read
// @access  Protected
const markAlertRead = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found.' });
    res.json({ success: true, message: 'Alert marked as read.', data: alert });
  } catch (error) {
    next(error);
  }
};
 
// @desc    Mark all alerts as read
// @route   PATCH /api/dashboard/alerts/read-all
// @access  Protected
const markAllAlertsRead = async (req, res, next) => {
  try {
    await Alert.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All alerts marked as read.' });
  } catch (error) {
    next(error);
  }
};
 
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
 