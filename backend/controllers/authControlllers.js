const User = require("../models/User");
const { generateToken } = require("../utils/helpers");
const { sendWelcomeEmail } = require("../utils/emailService");

/* ================= REGISTER ================= */
// @route POST /api/auth/register
// @access Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "staff",
    });

    // Send email (optional)
    try {
      await sendWelcomeEmail(user);
    } catch (err) {
      console.log("Email skipped");
    }

    // Generate token
    const token = generateToken(user._id);

    // IMPORTANT RESPONSE FORMAT
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= LOGIN ================= */
// @route POST /api/auth/login
// @access Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user
    const user = await User.findOne({ email }).select("+password");

    // Check user/password
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    user.lastLogin = Date.now();

    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    // IMPORTANT RESPONSE FORMAT
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= GET ME ================= */
// @route GET /api/auth/me
// @access Protected
const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    lastLogin: req.user.lastLogin,
    createdAt: req.user.createdAt,
  });
};

/* ================= GET USERS ================= */
// @route GET /api/auth/users
// @access Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({
      createdAt: -1,
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

/* ================= UPDATE USER ================= */
// @route PUT /api/auth/users/:id
// @access Admin
const updateUser = async (req, res, next) => {
  try {
    const { name, role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        role,
        isActive,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

/* ================= CHANGE PASSWORD ================= */
// @route PUT /api/auth/change-password
// @access Protected
const changePassword = async (req, res, next) => {
  try {
    const currentPassword =
      req.body.currentPassword || req.body.oldPassword;

    const { newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password required",
      });
    }

    const user = await User.findById(req.user._id).select(
      "+password"
    );

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password incorrect",
      });
    }

    user.password = newPassword;

    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  getUsers,
  updateUser,
  changePassword,
};