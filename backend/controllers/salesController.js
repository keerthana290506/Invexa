const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { paginationMeta, convertToCSV } = require('../utils/helpers');
const { checkAndCreateAlert } = require('../utils/alertUtils');
 
// @desc    Record a sale (auto-reduces stock)
// @route   POST /api/sales
// @access  Protected
const createSale = async (req, res, next) => {
  try {
    const { items, customerName, customerEmail, paymentMethod, notes, date } = req.body;
 
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required.' });
    }
 
    // Validate all products and check stock
    const processedItems = [];
    let totalAmount = 0;
 
    for (const item of items) {
      const product = await Product.findById(item.productId);
 
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }
 
      if (!product.isActive) {
        return res.status(400).json({ success: false, message: `Product is inactive: ${product.name}` });
      }
 
      if (product.stockQuantity < item.quantitySold) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity} ${product.unit}, requested: ${item.quantitySold}.`,
        });
      }
 
      const unitPrice = item.unitPrice || product.price;
      const itemTotal = unitPrice * item.quantitySold;
 
      processedItems.push({
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        quantitySold: item.quantitySold,
        unitPrice,
        totalPrice: itemTotal,
      });
 
      totalAmount += itemTotal;
    }
 
    // Create the sale record
    const sale = await Sale.create({
      items: processedItems,
      totalAmount,
      customerName: customerName || 'Walk-in Customer',
      customerEmail,
      paymentMethod: paymentMethod || 'cash',
      notes,
      date: date ? new Date(date) : new Date(),
      status: 'completed',
      createdBy: req.user._id,
    });
 
    // Reduce stock for each product and check alerts
    for (const item of processedItems) {
      const product = await Product.findById(item.productId);
      product.stockQuantity -= item.quantitySold;
      await product.save();
      await checkAndCreateAlert(product);
    }
 
    const populatedSale = await Sale.findById(sale._id).populate('createdBy', 'name email');
 
    res.status(201).json({
      success: true,
      message: 'Sale recorded successfully.',
      data: populatedSale,
    });
  } catch (error) {
    next(error);
  }
};
 
// @desc    Get all sales (with filters & pagination)
// @route   GET /api/sales
// @access  Protected
const getSales = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      status,
      paymentMethod,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;
 
    let query = {};
 
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
 
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }
 
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { 'items.productName': { $regex: search, $options: 'i' } },
      ];
    }
 
    const total = await Sale.countDocuments(query);
 
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
 
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sales = await Sale.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');
 
    res.json({
      success: true,
      pagination: paginationMeta(total, page, parseInt(limit)),
      data: sales,
    });
  } catch (error) {
    next(error);
  }
};
 
// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Protected
const getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('createdBy', 'name email');
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found.' });
    res.json({ success: true, data: sale });
  } catch (error) {
    next(error);
  }
};
 
// @desc    Cancel / update sale status
// @route   PUT /api/sales/:id/status
// @access  Admin only
const updateSaleStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['completed', 'pending', 'cancelled', 'refunded'];
 
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
 
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found.' });
 
    const previousStatus = sale.status;
    sale.status = status;
    await sale.save();
 
    // If cancelled or refunded → restore stock
    if (['cancelled', 'refunded'].includes(status) && !['cancelled', 'refunded'].includes(previousStatus)) {
      for (const item of sale.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stockQuantity: item.quantitySold },
        });
      }
    }
 
    res.json({ success: true, message: `Sale status updated to ${status}.`, data: sale });
  } catch (error) {
    next(error);
  }
};
 
// @desc    Export sales to CSV
// @route   GET /api/sales/export/csv
// @access  Admin
const exportSalesCSV = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
 
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
 
    const sales = await Sale.find(query).lean();
 
    // Flatten for CSV
    const rows = [];
    for (const sale of sales) {
      for (const item of sale.items) {
        rows.push({
          invoiceNumber: sale.invoiceNumber,
          date: new Date(sale.date).toLocaleDateString(),
          customerName: sale.customerName,
          productName: item.productName,
          sku: item.sku,
          quantitySold: item.quantitySold,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          paymentMethod: sale.paymentMethod,
          status: sale.status,
        });
      }
    }
 
    const fields = ['invoiceNumber', 'date', 'customerName', 'productName', 'sku', 'quantitySold', 'unitPrice', 'totalPrice', 'paymentMethod', 'status'];
    const csv = convertToCSV(rows, fields);
 
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="sales_${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
 
module.exports = { createSale, getSales, getSale, updateSaleStatus, exportSalesCSV };
 