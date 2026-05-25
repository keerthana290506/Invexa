const User = require('../models/User');
const { generateToken } = require('../utils/helpers');
const { sendWelcomeEmail } = require('../utils/emailService');
 
// @desc    Register user
// @route   POST /api/auth/register
// @access  Admin only
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
 
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }
 
    const user = await User.create({ name, email, password, role: role || 'staff' });
 
    // Send welcome email (non-blocking)
    sendWelcomeEmail(user).catch(console.error);
 
    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};
 
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
 
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }
 
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
 
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });
    }
 
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });
 
    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};
 
// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Protected
const getMe = async (req, res) => {
  res.json({
    success: true,
    data: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt,
    },
  });
};
 
// @desc    Get all users
// @route   GET /api/auth/users
// @access  Admin only
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};
 
// @desc    Update user
// @route   PUT /api/auth/users/:id
// @access  Admin only
const updateUser = async (req, res, next) => {
  try {
    const { name, role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, isActive },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User updated.', data: user });
  } catch (error) {
    next(error);
  }
};
 
// @desc    Change own password
// @route   PUT /api/auth/change-password
// @access  Protected
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
 
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
 
    user.password = newPassword;
    await user.save();
 
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};
 
module.exports = { register, login, getMe, getUsers, updateUser, changePassword };