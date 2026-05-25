const Alert = require('../models/Alert');
const Sale = require('../models/Sale');
const { sendLowStockAlert } = require('./emailService');
 
// Check stock and create alerts if needed
const checkAndCreateAlert = async (product) => {
  if (product.stockQuantity > product.reorderLevel) {
    // If stock is back to normal, resolve existing alerts
    await Alert.updateMany(
      { productId: product._id, isResolved: false },
      { isResolved: true }
    );
    // Reset alertSent flag on product
    product.alertSent = false;
    await product.save();
    return null;
  }
 
  // Calculate predicted demand using 7-day Simple Moving Average
  const predictedDemand = await getPredictedDemand(product._id);
 
  const alertType =
    product.stockQuantity === 0 ? 'out_of_stock' : 'low_stock';
 
  let message =
    product.stockQuantity === 0
      ? `${product.name} is OUT OF STOCK. Immediate restock required!`
      : `${product.name} stock is LOW (${product.stockQuantity} ${product.unit} remaining, reorder level: ${product.reorderLevel} ${product.unit}).`;
 
  if (predictedDemand > 0) {
    message += ` Predicted demand for next 7 days: ${predictedDemand} units.`;
    if (product.stockQuantity < predictedDemand) {
      message += ` Current stock will NOT meet predicted demand.`;
    }
  }
 
  // Check if there's already an unresolved alert for this product
  const existingAlert = await Alert.findOne({
    productId: product._id,
    isResolved: false,
    alertType,
  });
 
  if (!existingAlert) {
    const alert = await Alert.create({
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      alertType,
      currentStock: product.stockQuantity,
      reorderLevel: product.reorderLevel,
      predictedDemand,
      message,
    });
 
    // Send email if not already sent
    if (!product.alertSent) {
      const emailSent = await sendLowStockAlert(product);
      if (emailSent) {
        alert.emailSent = true;
        await alert.save();
        product.alertSent = true;
        await product.save();
      }
    }
 
    return alert;
  } else {
    // Update existing alert with latest stock info
    existingAlert.currentStock = product.stockQuantity;
    existingAlert.predictedDemand = predictedDemand;
    existingAlert.message = message;
    await existingAlert.save();
    return existingAlert;
  }
};
 
// Simple Moving Average: last 7 days sales for a product
const getPredictedDemand = async (productId) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
 
    const salesData = await Sale.aggregate([
      {
        $match: {
          date: { $gte: sevenDaysAgo },
          status: 'completed',
        },
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.productId': productId,
        },
      },
      {
        $group: {
          _id: null,
          totalSold: { $sum: '$items.quantitySold' },
        },
      },
    ]);
 
    if (!salesData.length) return 0;
 
    const totalSalesLast7Days = salesData[0].totalSold;
    const averageDailySales = totalSalesLast7Days / 7;
    const predictedDemand = Math.ceil(averageDailySales * 7);
 
    return predictedDemand;
  } catch (error) {
    console.error('Error calculating predicted demand:', error);
    return 0;
  }
};
 
// Get restock suggestions for all products
const getRestockSuggestions = async () => {
  const Product = require('../models/Product');
  const products = await Product.find({ isActive: true });
 
  const suggestions = [];
 
  for (const product of products) {
    const predictedDemand = await getPredictedDemand(product._id);
 
    if (predictedDemand > 0 && product.stockQuantity < predictedDemand) {
      const shortfall = predictedDemand - product.stockQuantity;
      suggestions.push({
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        category: product.category,
        currentStock: product.stockQuantity,
        predictedDemand,
        shortfall,
        reorderLevel: product.reorderLevel,
        isLowStock: product.stockQuantity <= product.reorderLevel,
        message: `Restock ${shortfall} ${product.unit} to meet predicted demand of ${predictedDemand} ${product.unit} for next 7 days.`,
        priority:
          product.stockQuantity === 0
            ? 'critical'
            : product.stockQuantity <= product.reorderLevel
            ? 'high'
            : 'medium',
      });
    }
  }
 
  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2 };
  suggestions.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
 
  return suggestions;
};
 
module.exports = { checkAndCreateAlert, getPredictedDemand, getRestockSuggestions };