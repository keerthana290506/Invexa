const Alert = require("../models/Alert");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendLowStockAlert } = require("./emailService");

/**
 * Check stock and create alerts if needed
 */
const checkAndCreateAlert = async (product) => {
  try {
    // ✅ CASE 1: Stock is OK → resolve alerts
    if (product.stockQuantity > product.reorderLevel) {
      await Alert.updateMany(
        { productId: product._id, isResolved: false },
        { isResolved: true }
      );

      product.alertSent = false;
      await product.save();

      return null;
    }

    // ✅ CASE 2: Calculate demand
    const predictedDemand = await getPredictedDemand(product._id);

    const alertType =
      product.stockQuantity === 0 ? "out_of_stock" : "low_stock";

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

    // ✅ check existing alert
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

      // ✅ EMAIL to all admins
      if (!product.alertSent) {
        const admins = await User.find({ role: "admin" });

        let successCount = 0;

        await Promise.all(
          admins.map(async (admin) => {
            const emailSent = await sendLowStockAlert({
              ...product.toObject(),
              email: admin.email,
            });

            if (emailSent) successCount++;
          })
        );

        if (successCount > 0) {
          alert.emailSent = true;
          await alert.save();

          product.alertSent = true;
          await product.save();
        }
      }

      return alert;
    }

    // ✅ update existing alert
    existingAlert.currentStock = product.stockQuantity;
    existingAlert.predictedDemand = predictedDemand;
    existingAlert.message = message;

    await existingAlert.save();

    return existingAlert;
  } catch (error) {
    console.error("Alert Error:", error.message);
    return null;
  }
};

/**
 * Simple Moving Average demand prediction
 */
const getPredictedDemand = async (productId) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesData = await Sale.aggregate([
      {
        $match: {
          date: { $gte: sevenDaysAgo },
          status: "completed",
        },
      },
      { $unwind: "$items" },
      {
        $match: {
          "items.productId": productId,
        },
      },
      {
        $group: {
          _id: null,
          totalSold: { $sum: "$items.quantitySold" },
        },
      },
    ]);

    if (!salesData.length) return 0;

    const totalSalesLast7Days = salesData[0].totalSold;
    return Math.ceil(totalSalesLast7Days);
  } catch (error) {
    console.error("Error calculating predicted demand:", error);
    return 0;
  }
};

module.exports = {
  checkAndCreateAlert,
  getPredictedDemand,
};