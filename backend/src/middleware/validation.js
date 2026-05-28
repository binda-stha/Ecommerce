const { body } = require("express-validator");

// User registration validation
const validateRegister = [
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  body("role")
    .optional()
    .isIn(["admin", "trader", "customer"])
    .withMessage("Role must be admin, trader, or customer"),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),

  body("address")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Address must not exceed 500 characters"),
];

// User login validation
const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password").notEmpty().withMessage("Password is required"),
];

// Product validation
const validateProduct = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters"),

  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Product description must be between 10 and 1000 characters"),

  body("price")
    .isFloat({ min: 0.01 })
    .withMessage("Price must be a positive number"),

  body("category").trim().notEmpty().withMessage("Category is required"),

  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  body("shopId").isUUID().withMessage("Valid shop ID is required"),
];

// Shop validation
const validateShop = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Shop name must be between 2 and 100 characters"),

  body("description")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Shop description must be between 10 and 500 characters"),

  body("address").trim().notEmpty().withMessage("Shop address is required"),

  body("phone")
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
];

// Order validation
const validateOrder = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must contain at least one item"),

  body("items.*.productId")
    .isUUID()
    .withMessage("Valid product ID is required for each item"),

  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),

  body("shippingAddress")
    .trim()
    .notEmpty()
    .withMessage("Shipping address is required"),

  body("paymentMethod")
    .isIn(["paypal", "stripe"])
    .withMessage("Payment method must be paypal or stripe"),
];

// Admin registration validation
const validateAdminRegister = [
  body("firstName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name is required")
    .isLength({ max: 50 })
    .withMessage("First name must not exceed 50 characters"),

  body("lastName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Last name is required")
    .isLength({ max: 50 })
    .withMessage("Last name must not exceed 50 characters"),

  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  body("adminCode")
    .isLength({ min: 1 })
    .withMessage("Admin registration code is required"),
];

module.exports = {
  validateRegister,
  validateAdminRegister,
  validateLogin,
  validateProduct,
  validateShop,
  validateOrder,
};
