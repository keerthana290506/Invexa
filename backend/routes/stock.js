const express = require('express');
const router = express.Router();
const {
  updateStock,
  bulkUpdateStock,
  getStockHistory,
} = require('../controllers/stockController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');
 
router.use(protect);
 
router.patch('/update', updateStock);
router.patch('/bulk-update', adminOnly, bulkUpdateStock);
router.get('/history/:productId', getStockHistory);
 
module.exports = router;