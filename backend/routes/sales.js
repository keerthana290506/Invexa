const express = require('express');
const router = express.Router();
const {
  createSale,
  getSales,
  getSale,
  updateSaleStatus,
  exportSalesCSV,
} = require('../controllers/salesController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');
 
router.use(protect);
 
router.get('/export/csv', adminOnly, exportSalesCSV);
 
router.route('/')
  .get(getSales)
  .post(createSale);
 
router.get('/:id', getSale);
router.put('/:id/status', adminOnly, updateSaleStatus);
 
module.exports = router;
 