const Product = require('../models/Product');
const { checkAndCreateAlert } = require('../utils/alertUtils');
 
// @desc    Update stock quantity (increase or decrease)
// @route   PATCH /api/stock/update
// @access  Protected (admin can increase/decrease, staff can only do small adjustments)
const updateStock = async (req, res, next) => {
  try {
    const { productId, type, quantity, reason } = req.body;
 
    if (!productId || !type || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'productId, type (increase/decrease), and quantity are required.',
      });
    }
 
    if (!['increase', 'decrease', 'set'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be increase, decrease, or set.',
      });
    }
 
    if (quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than 0.' });
    }
 
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (!product.isActive) return res.status(400).json({ success: false, message: 'Product is inactive.' });
 
    const previousStock = product.stockQuantity;
 
    if (type === 'increase') {
      product.stockQuantity += parseInt(quantity);
    } else if (type === 'decrease') {
      if (product.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${product.stockQuantity} ${product.unit}.`,
        });
      }
      product.stockQuantity -= parseInt(quantity);
    } else if (type === 'set') {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only admin can set stock directly.' });
      }
      product.stockQuantity = parseInt(quantity);
    }
 
    await product.save();
 
    // Check and create alerts
    await checkAndCreateAlert(product);
 
    res.json({
      success: true,
      message: `Stock ${type === 'set' ? 'set' : type + 'd'} successfully.`,
      data: {
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        previousStock,
        newStock: product.stockQuantity,
        change: type === 'increase' ? `+${quantity}` : type === 'decrease' ? `-${quantity}` : `=${quantity}`,
        isLowStock: product.isLowStock,
        reason: reason || 'Manual adjustment',
      },
    });
  } catch (error) {
    next(error);
  }
};
 
// @desc    Bulk stock update
// @route   PATCH /api/stock/bulk-update
// @access  Admin only
const bulkUpdateStock = async (req, res, next) => {
  try {
    const { updates } = req.body; // [{ productId, type, quantity }]
 
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: 'updates array is required.' });
    }
 
    const results = [];
    const errors = [];
 
    for (const update of updates) {
      try {
        const { productId, type, quantity } = update;
        const product = await Product.findById(productId);
 
        if (!product) {
          errors.push({ productId, error: 'Product not found' });
          continue;
        }
 
        const previousStock = product.stockQuantity;
 
        if (type === 'increase') {
          product.stockQuantity += parseInt(quantity);
        } else if (type === 'decrease') {
          if (product.stockQuantity < quantity) {
            errors.push({ productId, error: `Insufficient stock (available: ${product.stockQuantity})` });
            continue;
          }
          product.stockQuantity -= parseInt(quantity);
        } else if (type === 'set') {
          product.stockQuantity = parseInt(quantity);
        }
 
        await product.save();
        await checkAndCreateAlert(product);
 
        results.push({
          productId,
          productName: product.name,
          previousStock,
          newStock: product.stockQuantity,
        });
      } catch (err) {
        errors.push({ productId: update.productId, error: err.message });
      }
    }
 
    res.json({
      success: true,
      message: `Processed ${results.length} updates, ${errors.length} errors.`,
      data: { updated: results, errors },
    });
  } catch (error) {
    next(error);
  }
};
 
// @desc    Get stock history (from sales)
// @route   GET /api/stock/history/:productId
// @access  Protected
const getStockHistory = async (req, res, next) => {
  try {
    const Sale = require('../models/Sale');
    const { page = 1, limit = 20 } = req.query;
 
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
 
    const skip = (parseInt(page) - 1) * parseInt(limit);
 
    const sales = await Sale.find({
      'items.productId': req.params.productId,
      status: 'completed',
    })
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');
 
    const history = sales.map((sale) => {
      const item = sale.items.find(
        (i) => i.productId.toString() === req.params.productId
      );
      return {
        date: sale.date,
        invoiceNumber: sale.invoiceNumber,
        type: 'sale',
        quantity: -item.quantitySold,
        unitPrice: item.unitPrice,
        by: sale.createdBy?.name || 'Unknown',
      };
    });
 
    res.json({
      success: true,
      productName: product.name,
      currentStock: product.stockQuantity,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
 
module.exports = { updateStock, bulkUpdateStock, getStockHistory };
