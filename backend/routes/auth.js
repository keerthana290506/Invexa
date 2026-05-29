const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getUsers,
  updateUser,
  changePassword,
} = require('../controllers/authControlllers');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');
 
// Public
router.post('/login', login);
 
// Protected
router.get('/me',protect,  getMe);
router.put('/change-password', protect, changePassword);
 
// Admin only
router.post('/register', register);
router.get('/users', protect, adminOnly, getUsers);
router.put('/users/:id', protect, adminOnly, updateUser);
 
module.exports = router;
 