const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  exportProductsCSV,
  getCategories,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');
 
// All routes require authentication
router.use(protect);
 
router.get('/export/csv', adminOnly, exportProductsCSV);
router.get('/categories', getCategories);
 
router.route('/')
  .get(getProducts)
  .post(adminOnly, createProduct);
 
router.route('/:id')
  .get(getProduct)
  .put(adminOnly, updateProduct)
  .delete(adminOnly, deleteProduct);
 
module.exports = router;