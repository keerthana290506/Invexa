const Product = require('../models/Product');
const Alert = require('../models/Alert');
const { paginationMeta, convertToCSV } = require('../utils/helpers');
const { checkAndCreateAlert } = require('../utils/alertUtils');

// @desc    Create product
// @route   POST /api/products
// @access  Admin
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    // Check low stock immediately after creation
    if (product.stockQuantity <= product.reorderLevel) {
      await checkAndCreateAlert(product);
    }

    res.status(201).json({ success: true, message: 'Product created successfully.', data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products (with search, filter, pagination)
// @route   GET /api/products
// @access  Protected
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      lowStock,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isActive,
    } = req.query;

    // Build query
    let query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    } else {
      query.isActive = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;

    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stockQuantity', '$reorderLevel'] };
    }

    const total = await Product.countDocuments(query);

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      pagination: paginationMeta(total, page, parseInt(limit)),
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Protected
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    // Re-check alerts after update
    await checkAndCreateAlert(product);

    res.json({ success: true, message: 'Product updated successfully.', data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    // Resolve alerts for this product
    await Alert.updateMany({ productId: req.params.id }, { isResolved: true });

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Export products to CSV
// @route   GET /api/products/export/csv
// @access  Admin
const exportProductsCSV = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true }).lean();

    const fields = ['name', 'sku', 'category', 'price', 'costPrice', 'stockQuantity', 'reorderLevel', 'unit', 'supplier'];
    const csv = convertToCSV(products, fields);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="products_${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Get product categories list
// @route   GET /api/products/categories
// @access  Protected
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  exportProductsCSV,
  getCategories,
};