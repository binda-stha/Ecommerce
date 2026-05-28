const express = require("express");
const {
  register,
  login,
  getMe,
  adminRegister,
} = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
  validateAdminRegister,
} = require("../middleware/validation");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", validateRegister, register);

// @route   POST /api/auth/admin-register
// @desc    Register admin user
// @access  Public (but requires admin code)
router.post("/admin-register", validateAdminRegister, adminRegister);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", validateLogin, login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", protect, getMe);

module.exports = router;
