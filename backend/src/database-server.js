require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { Sequelize, DataTypes } = require("sequelize");
const paypal = require("paypal-rest-sdk");

console.log("🚀 Starting Binda Trade - Full Implementation Server...");

// PayPal Configuration
paypal.configure({
  mode: process.env.PAYPAL_MODE || "sandbox",
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

const app = express();
// Environment configuration
const NODE_ENV = process.env.NODE_ENV || "development";
const SERVER_PORT = process.env.PORT || 5001;

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "binda-trade-nepal-secret-key";

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

// Database Setup - Try PostgreSQL, fallback to SQLite
let sequelize;

async function initializeDatabase() {
  try {
    // Try PostgreSQL first
    console.log("🔌 Attempting PostgreSQL connection...");
    sequelize = new Sequelize(
      process.env.DATABASE_URL ||
        `postgres://${process.env.DB_USER || "postgres"}:${
          process.env.DB_PASSWORD || "password"
        }@${process.env.DB_HOST || "localhost"}:${
          process.env.DB_PORT || 5432
        }/${process.env.DB_NAME || "ecommerce_db"}`,
      {
        dialect: "postgres",
        logging: false,
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
      }
    );

    // Test the connection
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connection established successfully.");
    return sequelize;
  } catch (error) {
    console.warn("⚠️ PostgreSQL connection failed:", error.message);
    console.log("🔄 Falling back to SQLite...");

    // Fallback to SQLite
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: "./database.sqlite",
      logging: false,
    });

    try {
      await sequelize.authenticate();
      console.log("✅ SQLite connection established successfully.");
      return sequelize;
    } catch (sqliteError) {
      console.error("❌ SQLite connection also failed:", sqliteError);
      throw sqliteError;
    }
  }
}

// Models will be defined after database initialization
let User, Trader, Shop, Product, Order, OrderItem, Points, Violation;

function defineModels(sequelize) {
  // Models
  User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "trader", "customer"),
      allowNull: false,
      defaultValue: "customer",
    },
    status: {
      type: DataTypes.ENUM(
        "active",
        "inactive",
        "pending",
        "approved",
        "disabled"
      ),
      defaultValue: "active",
    },
    violations: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    joinDate: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  });

  const Trader = sequelize.define("Trader", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    businessAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    businessPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verificationStatus: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  });

  const Shop = sequelize.define("Shop", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    traderId: {
      type: DataTypes.INTEGER,
      references: {
        model: Trader,
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "disabled"),
      defaultValue: "active",
    },
    isViolated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  const Product = sequelize.define("Product", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shopId: {
      type: DataTypes.INTEGER,
      references: {
        model: Shop,
        key: "id",
      },
    },
    traderId: {
      type: DataTypes.INTEGER,
      references: {
        model: Trader,
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    originalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    discount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0.0,
    },
    reviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    inStock: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isViolated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  const Order = sequelize.define("Order", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customerId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    promoCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
      ),
      defaultValue: "pending",
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      defaultValue: "pending",
    },
    paymentMethod: {
      type: DataTypes.STRING,
      defaultValue: "paypal",
    },
    paymentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  const OrderItem = sequelize.define("OrderItem", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      references: {
        model: Order,
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: "id",
      },
    },
    traderId: {
      type: DataTypes.INTEGER,
      references: {
        model: Trader,
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered"
      ),
      defaultValue: "pending",
    },
  });

  const Points = sequelize.define("Points", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    orderId: {
      type: DataTypes.INTEGER,
      references: {
        model: Order,
        key: "id",
      },
      allowNull: true,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("earned", "redeemed"),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  const Violation = sequelize.define("Violation", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    traderId: {
      type: DataTypes.INTEGER,
      references: {
        model: Trader,
        key: "id",
      },
      allowNull: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: "id",
      },
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("product", "trader", "shop"),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "resolved"),
      defaultValue: "active",
    },
    reportedBy: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
  });

  // Review Model
  const Review = sequelize.define("Review", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    helpfulVotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "approved",
    },
  });

  // Associations
  User.hasOne(Trader, { foreignKey: "userId" });
  Trader.belongsTo(User, { foreignKey: "userId" });

  Trader.hasMany(Shop, { foreignKey: "traderId" });
  Shop.belongsTo(Trader, { foreignKey: "traderId" });

  Shop.hasMany(Product, { foreignKey: "shopId" });
  Product.belongsTo(Shop, { foreignKey: "shopId" });

  Trader.hasMany(Product, { foreignKey: "traderId" });
  Product.belongsTo(Trader, { foreignKey: "traderId" });

  User.hasMany(Order, { foreignKey: "customerId" });
  Order.belongsTo(User, { foreignKey: "customerId" });

  Order.hasMany(OrderItem, { foreignKey: "orderId" });
  OrderItem.belongsTo(Order, { foreignKey: "orderId" });

  Product.hasMany(OrderItem, { foreignKey: "productId" });
  OrderItem.belongsTo(Product, { foreignKey: "productId" });

  Trader.hasMany(OrderItem, { foreignKey: "traderId" });
  OrderItem.belongsTo(Trader, { foreignKey: "traderId" });

  User.hasMany(Points, { foreignKey: "userId" });
  Points.belongsTo(User, { foreignKey: "userId" });

  Order.hasMany(Points, { foreignKey: "orderId" });
  Points.belongsTo(Order, { foreignKey: "orderId" });

  Trader.hasMany(Violation, { foreignKey: "traderId" });
  Violation.belongsTo(Trader, { foreignKey: "traderId" });

  Product.hasMany(Violation, { foreignKey: "productId" });
  Violation.belongsTo(Product, { foreignKey: "productId" });

  // Review associations
  User.hasMany(Review, { foreignKey: "userId", as: "userReviews" });
  Review.belongsTo(User, { foreignKey: "userId", as: "reviewer" });

  Product.hasMany(Review, { foreignKey: "productId", as: "productReviews" });
  Review.belongsTo(Product, { foreignKey: "productId" });

  return {
    User,
    Trader,
    Shop,
    Product,
    Order,
    OrderItem,
    Points,
    Violation,
    Review,
  };
}

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }
    next();
  };
};

// Enhanced Validation middleware
const validateRegistration = [
  // Email validation
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .custom(async (email) => {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error("Email already exists");
      }
      return true;
    }),

  // Password validation with comprehensive rules
  body("password")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
    ),

  // Name validation with comprehensive rules
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(
      "Name can only contain letters, spaces, apostrophes, and hyphens"
    )
    .custom((value) => {
      // Check for consecutive spaces
      if (/\s{2,}/.test(value)) {
        throw new Error("Name cannot contain consecutive spaces");
      }
      // Check for leading/trailing spaces (should be trimmed already)
      if (value !== value.trim()) {
        throw new Error("Name cannot have leading or trailing spaces");
      }
      // Check for profanity (basic list)
      const profanityList = ["badword1", "badword2"]; // Add more as needed
      const lowerName = value.toLowerCase();
      for (const word of profanityList) {
        if (lowerName.includes(word)) {
          throw new Error("Name contains inappropriate content");
        }
      }
      return true;
    }),

  // Username validation (if provided)
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage(
      "Username can only contain letters, numbers, underscores, dots, and hyphens"
    )
    .custom(async (username) => {
      if (username) {
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
          throw new Error("Username already exists");
        }
      }
      return true;
    }),
];

const validateLogin = [
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 1 })
    .withMessage("Password cannot be empty"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
];

// Password change validation
const validatePasswordChange = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8, max: 128 })
    .withMessage("New password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match new password");
    }
    return true;
  }),
];

// Profile update validation
const validateProfileUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(
      "Name can only contain letters, spaces, apostrophes, and hyphens"
    ),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
];

// Error handling middleware for validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

// Health check
// Root route - Welcome message
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "🛒 Binda Trade E-commerce API",
    description: "Multi-vendor PERN stack e-commerce platform",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "2.0.0",
    endpoints: {
      health: "/api/health",
      products: "/api/products",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
      },
      orders: "/api/orders",
      dashboard: {
        trader: "/api/trader/dashboard",
        admin: "/api/admin/dashboard",
      },
      user: "/api/user/points",
    },
    features: [
      "PostgreSQL Database",
      "JWT Authentication",
      "Multi-vendor Support",
      "Order Management",
      "PayPal Integration",
      "Points System",
      "Violation Tracking",
    ],
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Binda Trade API - Full Implementation",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "2.0.0",
    features: [
      "PostgreSQL Database",
      "JWT Authentication",
      "Multi-vendor Support",
      "Order Management",
      "PayPal Integration",
      "Points System",
      "Violation Tracking",
    ],
  });
});

// Authentication Routes
// Test registration endpoint
app.post("/api/test/register", async (req, res) => {
  try {
    console.log("🧪 Test registration request body:", req.body);

    // Check if required fields are present
    const requiredFields = ["email", "password", "name"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields,
        receivedFields: Object.keys(req.body),
      });
    }

    res.json({
      success: true,
      message: "Test endpoint working",
      receivedData: {
        ...req.body,
        password: "[HIDDEN]",
      },
    });
  } catch (error) {
    console.error("Test registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.post(
  "/api/auth/register",
  validateRegistration,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password, name, role = "customer", username } = req.body;

      // Hash password with enhanced security
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        role,
        username: role === "trader" ? username : null,
        status: role === "trader" ? "pending" : "active",
      });

      // Create trader profile if role is trader
      if (role === "trader") {
        await Trader.create({
          userId: user.id,
          verificationStatus: "pending",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        success: true,
        message:
          role === "trader"
            ? "Trader registered successfully. Pending admin approval."
            : "User registered successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }
  }
);

app.post(
  "/api/auth/login",
  validateLogin,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, username, password } = req.body;

      // Find user by email or username
      const user = await User.findOne({
        where: email ? { email } : { username },
        include: [
          {
            model: Trader,
            required: false,
          },
        ],
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check password with enhanced security logging
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        // Log failed login attempt (in production, implement rate limiting)
        console.log(`Failed login attempt for user: ${email || username}`);
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check if user is active
      if (user.status === "disabled") {
        return res.status(403).json({
          success: false,
          message: "Account has been disabled",
        });
      }

      if (user.role === "trader" && user.status === "pending") {
        return res.status(403).json({
          success: false,
          message: "Trader account pending approval",
        });
      }

      // Get user points if customer
      let totalPoints = 0;
      if (user.role === "customer") {
        const points = await Points.sum("points", {
          where: {
            userId: user.id,
            type: "earned",
          },
        });
        const redeemedPoints = await Points.sum("points", {
          where: {
            userId: user.id,
            type: "redeemed",
          },
        });
        totalPoints = (points || 0) - (redeemedPoints || 0);
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          violations: user.violations,
          points: totalPoints,
          joinDate: user.joinDate,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
        error: error.message,
      });
    }
  }
);

// Products Routes
app.get("/api/products", async (req, res) => {
  try {
    let {
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = "name",
      sortOrder = "asc",
      page = 1,
      limit = 12,
    } = req.query;

    const whereClause = {
      isActive: true,
      isViolated: false,
    };

    // Apply filters
    if (search) {
      whereClause[Sequelize.Op.or] = [
        { name: { [Sequelize.Op.iLike]: `%${search}%` } },
        { description: { [Sequelize.Op.iLike]: `%${search}%` } },
        { category: { [Sequelize.Op.iLike]: `%${search}%` } },
      ];
    }

    if (category && category !== "all") {
      whereClause.category = { [Sequelize.Op.iLike]: category };
    }

    if (minPrice) {
      whereClause.price = { [Sequelize.Op.gte]: parseFloat(minPrice) };
    }

    if (maxPrice) {
      whereClause.price = {
        ...whereClause.price,
        [Sequelize.Op.lte]: parseFloat(maxPrice),
      };
    }

    // Sorting
    const orderClause = [[sortBy, sortOrder.toUpperCase()]];

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Shop,
          attributes: ["name", "category"],
        },
        {
          model: Trader,
          include: [
            {
              model: User,
              attributes: ["name"],
            },
          ],
        },
      ],
      order: orderClause,
      offset,
      limit: limitNum,
    });

    res.json({
      success: true,
      data: {
        products: products.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          originalPrice: product.originalPrice
            ? parseFloat(product.originalPrice)
            : null,
          discount: product.discount,
          category: product.category,
          stock: product.stock,
          image: product.image,
          rating: parseFloat(product.rating),
          reviews: product.reviews,
          views: product.views,
          inStock: product.inStock && product.stock > 0,
          shop: product.Shop?.name || "Unknown Shop",
          trader: product.Trader?.User?.name || "Unknown Trader",
          points: Math.floor(parseFloat(product.price) / 100),
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limitNum),
          totalProducts: count,
          hasNext: offset + limitNum < count,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
});

// Get single product
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Shop,
          attributes: ["name", "category"],
        },
        {
          model: Trader,
          include: [
            {
              model: User,
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Increment view count
    await product.increment("views");

    res.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        originalPrice: product.originalPrice
          ? parseFloat(product.originalPrice)
          : null,
        discount: product.discount,
        category: product.category,
        stock: product.stock,
        image: product.image,
        rating: parseFloat(product.rating),
        reviews: product.reviews,
        views: product.views,
        inStock: product.inStock && product.stock > 0,
        shop: product.Shop?.name || "Unknown Shop",
        trader: product.Trader?.User?.name || "Unknown Trader",
      },
    });
  } catch (error) {
    console.error("Product fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
});

// Categories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Product.findAll({
      attributes: [
        "category",
        [Sequelize.fn("COUNT", Sequelize.col("category")), "count"],
      ],
      where: {
        isActive: true,
        isViolated: false,
      },
      group: ["category"],
      raw: true,
    });

    res.json({
      success: true,
      data: categories.map((cat, index) => ({
        id: index + 1,
        name: cat.category,
        count: parseInt(cat.count),
      })),
    });
  } catch (error) {
    console.error("Categories fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
});

// Trader Routes (Protected)
app.get(
  "/api/trader/dashboard",
  authenticateToken,
  authorizeRole(["trader"]),
  async (req, res) => {
    try {
      const trader = await Trader.findOne({
        where: { userId: req.user.userId },
        include: [
          {
            model: Shop,
            include: [
              {
                model: Product,
              },
            ],
          },
          {
            model: User,
            attributes: ["name", "email", "status", "violations"],
          },
        ],
      });

      if (!trader) {
        return res.status(404).json({
          success: false,
          message: "Trader not found",
        });
      }

      const totalProducts = await Product.count({
        where: { traderId: trader.id, isActive: true },
      });

      const totalOrders = await OrderItem.count({
        where: { traderId: trader.id },
      });

      res.json({
        success: true,
        data: {
          trader: {
            id: trader.id,
            name: trader.User.name,
            email: trader.User.email,
            status: trader.User.status,
            violations: trader.User.violations,
            businessName: trader.businessName,
            verificationStatus: trader.verificationStatus,
          },
          stats: {
            totalShops: trader.Shops.length,
            totalProducts,
            totalOrders,
            maxShops: 2,
            maxProductsPerShop: 5,
          },
          shops: trader.Shops.map((shop) => ({
            id: shop.id,
            name: shop.name,
            category: shop.category,
            status: shop.status,
            productCount: shop.Products.length,
          })),
        },
      });
    } catch (error) {
      console.error("Trader dashboard error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching trader dashboard",
        error: error.message,
      });
    }
  }
);

// Create Shop (max 2 per trader)
app.post(
  "/api/trader/shops",
  authenticateToken,
  authorizeRole(["trader"]),
  async (req, res) => {
    try {
      const trader = await Trader.findOne({
        where: { userId: req.user.userId },
      });

      if (!trader) {
        return res.status(404).json({
          success: false,
          message: "Trader not found",
        });
      }

      // Check shop limit
      const shopCount = await Shop.count({
        where: { traderId: trader.id },
      });

      if (shopCount >= 2) {
        return res.status(400).json({
          success: false,
          message: "Maximum 2 shops allowed per trader",
        });
      }

      const { name, category, description } = req.body;

      const shop = await Shop.create({
        traderId: trader.id,
        name,
        category,
        description,
      });

      res.status(201).json({
        success: true,
        message: "Shop created successfully",
        data: shop,
      });
    } catch (error) {
      console.error("Shop creation error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating shop",
        error: error.message,
      });
    }
  }
);

// Create Product (max 5 per shop)
app.post(
  "/api/trader/products",
  authenticateToken,
  authorizeRole(["trader"]),
  async (req, res) => {
    try {
      const trader = await Trader.findOne({
        where: { userId: req.user.userId },
      });

      if (!trader) {
        return res.status(404).json({
          success: false,
          message: "Trader not found",
        });
      }

      const {
        shopId,
        name,
        description,
        price,
        originalPrice,
        category,
        stock,
        image,
      } = req.body;

      // Verify shop belongs to trader
      const shop = await Shop.findOne({
        where: { id: shopId, traderId: trader.id },
      });

      if (!shop) {
        return res.status(404).json({
          success: false,
          message: "Shop not found or doesn't belong to trader",
        });
      }

      // Check product limit per shop
      const productCount = await Product.count({
        where: { shopId },
      });

      if (productCount >= 5) {
        return res.status(400).json({
          success: false,
          message: "Maximum 5 products allowed per shop",
        });
      }

      const discount = originalPrice
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

      const product = await Product.create({
        shopId,
        traderId: trader.id,
        name,
        description,
        price,
        originalPrice,
        discount,
        category,
        stock,
        image:
          image ||
          `https://via.placeholder.com/300x300/1a75ff/ffffff?text=${encodeURIComponent(
            name
          )}`,
        inStock: stock > 0,
      });

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      console.error("Product creation error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating product",
        error: error.message,
      });
    }
  }
);

// Order Routes
app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const {
      items,
      subtotal,
      discount = 0,
      total,
      totalAmount,
      promoCode,
    } = req.body;

    // Calculate totals if not provided (for backwards compatibility)
    let orderSubtotal = subtotal;
    let orderTotal = total;

    if (!orderSubtotal || !orderTotal) {
      // Calculate from totalAmount or items
      if (totalAmount) {
        orderSubtotal = totalAmount;
        orderTotal = totalAmount;
      } else {
        // Calculate from items
        orderSubtotal = 0;
        for (const item of items) {
          const product = await Product.findByPk(item.productId);
          if (product) {
            orderSubtotal += product.price * item.quantity;
          }
        }
        orderTotal = orderSubtotal - discount;
      }
    }

    // Create order
    const order = await Order.create({
      customerId: req.user.userId,
      subtotal: orderSubtotal,
      discount,
      total: orderTotal,
      promoCode,
      status: "pending",
      paymentStatus: "pending",
    });

    // Create order items and group by trader
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findByPk(item.productId, {
        include: [{ model: Trader }],
      });

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const orderItem = await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        traderId: product.traderId,
        quantity: item.quantity,
        price: product.price,
        total: product.price * item.quantity,
      });

      orderItems.push(orderItem);

      // Update product stock
      await product.decrement("stock", { by: item.quantity });
    }

    // Award points (1 point per ₹100 spent)
    const pointsEarned = Math.floor(orderTotal / 100);
    if (pointsEarned > 0) {
      await Points.create({
        userId: req.user.userId,
        orderId: order.id,
        points: pointsEarned,
        type: "earned",
        description: `Points earned from order #${order.id}`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: {
        orderId: order.id,
        total,
        pointsEarned,
        itemCount: orderItems.length,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
});

// Get user orders
app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { customerId: req.user.userId },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ["name", "image"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: orders.map((order) => ({
        id: order.id,
        total: parseFloat(order.total),
        status: order.status,
        paymentStatus: order.paymentStatus,
        date: order.createdAt,
        itemCount: order.OrderItems.length,
        items: order.OrderItems.map((item) => ({
          productName: item.Product.name,
          quantity: item.quantity,
          price: parseFloat(item.price),
          total: parseFloat(item.total),
        })),
      })),
    });
  } catch (error) {
    console.error("Orders fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
});

// Admin Routes
app.get(
  "/api/admin/dashboard",
  authenticateToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const totalTraders = await Trader.count();
      const totalProducts = await Product.count({ where: { isActive: true } });
      const totalOrders = await Order.count();
      const totalViolations = await Violation.count({
        where: { status: "active" },
      });
      const pendingTraders = await Trader.count({
        where: { verificationStatus: "pending" },
      });

      const recentOrders = await Order.findAll({
        limit: 10,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });

      res.json({
        success: true,
        data: {
          stats: {
            totalTraders,
            totalProducts,
            totalOrders,
            totalViolations,
            pendingTraders,
          },
          recentOrders: recentOrders.map((order) => ({
            id: order.id,
            customerName: order.User.name,
            total: parseFloat(order.total),
            status: order.status,
            date: order.createdAt,
          })),
        },
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching admin dashboard",
        error: error.message,
      });
    }
  }
);

// Approve trader
app.patch(
  "/api/admin/traders/:id/approve",
  authenticateToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const trader = await Trader.findByPk(req.params.id);
      if (!trader) {
        return res.status(404).json({
          success: false,
          message: "Trader not found",
        });
      }

      await trader.update({ verificationStatus: "approved" });
      await User.update(
        { status: "approved" },
        { where: { id: trader.userId } }
      );

      res.json({
        success: true,
        message: "Trader approved successfully",
      });
    } catch (error) {
      console.error("Trader approval error:", error);
      res.status(500).json({
        success: false,
        message: "Error approving trader",
        error: error.message,
      });
    }
  }
);

// Add violation
app.post(
  "/api/admin/violations",
  authenticateToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const { traderId, productId, type, reason, description } = req.body;

      const violation = await Violation.create({
        traderId,
        productId,
        type,
        reason,
        description,
        reportedBy: req.user.userId,
      });

      // Increment violation count for trader
      if (traderId) {
        await User.increment("violations", {
          where: { id: traderId },
        });
      }

      // Disable product if violation
      if (productId) {
        await Product.update(
          { isViolated: true, isActive: false },
          { where: { id: productId } }
        );
      }

      res.status(201).json({
        success: true,
        message: "Violation added successfully",
        data: violation,
      });
    } catch (error) {
      console.error("Violation creation error:", error);
      res.status(500).json({
        success: false,
        message: "Error adding violation",
        error: error.message,
      });
    }
  }
);

// PayPal Integration - Payment creation handled by frontend SDK

app.post("/api/payments/execute", authenticateToken, async (req, res) => {
  try {
    const { paymentId, orderId, payerId } = req.body;

    // Execute the payment with PayPal
    const executeObject = {
      payer_id: payerId,
    };

    paypal.payment.execute(paymentId, executeObject, async (error, payment) => {
      if (error) {
        console.error("PayPal payment execution error:", error);
        return res.status(500).json({
          success: false,
          message: "Error executing PayPal payment",
          error: error.message,
        });
      }

      if (payment.state === "approved") {
        try {
          // Update order payment status in database
          await Order.update(
            {
              paymentStatus: "paid",
              paymentId,
              status: "confirmed",
            },
            { where: { id: orderId, customerId: req.user.userId } }
          );

          // Award points to customer (1 point per ₹100 spent)
          const order = await Order.findOne({
            where: { id: orderId, customerId: req.user.userId },
          });

          if (order) {
            const pointsToAward = Math.floor(order.total / 100);
            if (pointsToAward > 0) {
              await Points.create({
                userId: req.user.userId,
                points: pointsToAward,
                source: "purchase",
                description: `Points earned from Order #${orderId}`,
              });
            }
          }

          res.json({
            success: true,
            message: "Payment executed successfully",
            data: {
              paymentId,
              orderId,
              status: "completed",
              transactionId:
                payment.transactions[0].related_resources[0].sale.id,
            },
          });
        } catch (dbError) {
          console.error("Database update error:", dbError);
          res.status(500).json({
            success: false,
            message: "Payment successful but database update failed",
            error: dbError.message,
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: "Payment not approved",
          status: payment.state,
        });
      }
    });
  } catch (error) {
    console.error("Payment execution error:", error);
    res.status(500).json({
      success: false,
      message: "Error executing payment",
      error: error.message,
    });
  }
});

// User points
app.get("/api/user/points", authenticateToken, async (req, res) => {
  try {
    const earnedPoints = await Points.sum("points", {
      where: {
        userId: req.user.userId,
        type: "earned",
      },
    });

    const redeemedPoints = await Points.sum("points", {
      where: {
        userId: req.user.userId,
        type: "redeemed",
      },
    });

    const totalPoints = (earnedPoints || 0) - (redeemedPoints || 0);

    const pointsHistory = await Points.findAll({
      where: { userId: req.user.userId },
      order: [["createdAt", "DESC"]],
      limit: 20,
    });

    res.json({
      success: true,
      data: {
        totalPoints,
        earnedPoints: earnedPoints || 0,
        redeemedPoints: redeemedPoints || 0,
        history: pointsHistory.map((point) => ({
          points: point.points,
          type: point.type,
          description: point.description,
          date: point.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Points fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching points",
      error: error.message,
    });
  }
});

// ==================== REVIEW ENDPOINTS ====================

// Get reviews for a product
app.get("/api/reviews/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { sortBy = "newest", rating } = req.query;

    let orderBy = [["createdAt", "DESC"]];

    switch (sortBy) {
      case "oldest":
        orderBy = [["createdAt", "ASC"]];
        break;
      case "rating-high":
        orderBy = [["rating", "DESC"]];
        break;
      case "rating-low":
        orderBy = [["rating", "ASC"]];
        break;
      case "helpful":
        orderBy = [["helpfulVotes", "DESC"]];
        break;
    }

    const whereClause = { productId, status: "approved" };
    if (rating) {
      whereClause.rating = rating;
    }

    const reviews = await Review.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "username"],
        },
      ],
      order: orderBy,
    });

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
});

// Get review statistics for a product
app.get("/api/reviews/product/:productId/stats", async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.findAll({
      where: { productId, status: "approved" },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      ratingDistribution[review.rating]++;
    });

    res.json({
      success: true,
      stats: {
        averageRating,
        totalReviews,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching review stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch review stats",
    });
  }
});

// Create a new review
app.post("/api/reviews", authenticateToken, async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const userId = req.user.userId;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      where: { userId, productId },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const review = await Review.create({
      userId,
      productId,
      rating,
      title,
      comment,
      status: "approved", // Auto-approve for now
    });

    const reviewWithUser = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "username"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      review: reviewWithUser,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
});

// Vote a review as helpful
app.post(
  "/api/reviews/:reviewId/helpful",
  authenticateToken,
  async (req, res) => {
    try {
      const { reviewId } = req.params;

      const review = await Review.findByPk(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      review.helpfulVotes = (review.helpfulVotes || 0) + 1;
      await review.save();

      res.json({
        success: true,
        helpfulVotes: review.helpfulVotes,
      });
    } catch (error) {
      console.error("Error voting helpful:", error);
      res.status(500).json({
        success: false,
        message: "Failed to vote helpful",
      });
    }
  }
);

// ==================== END REVIEW ENDPOINTS ====================

// ==================== USER PROFILE & SECURITY ENDPOINTS ====================

// Change password endpoint
app.post(
  "/api/auth/change-password",
  authenticateToken,
  validatePasswordChange,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      // Get user with current password
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Check if new password is different from current
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from current password",
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await user.update({ password: hashedNewPassword });

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({
        success: false,
        message: "Failed to change password",
      });
    }
  }
);

// Update profile endpoint
app.put(
  "/api/auth/profile",
  authenticateToken,
  validateProfileUpdate,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email } = req.body;
      const userId = req.user.userId;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if email is being changed and if it already exists
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Email already exists",
          });
        }
      }

      // Update user profile
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      await user.update(updateData);

      // Return updated user data (excluding password)
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }
  }
);

// Validate password strength endpoint (for real-time validation)
app.post("/api/auth/validate-password", (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const validationResults = {
      length: password.length >= 8 && password.length <= 128,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    };

    const isValid = Object.values(validationResults).every((result) => result);

    const strength = Object.values(validationResults).filter(Boolean).length;
    let strengthText = "Very Weak";
    if (strength >= 5) strengthText = "Very Strong";
    else if (strength >= 4) strengthText = "Strong";
    else if (strength >= 3) strengthText = "Medium";
    else if (strength >= 2) strengthText = "Weak";

    res.json({
      success: true,
      isValid,
      strength: strengthText,
      requirements: {
        "8-128 characters": validationResults.length,
        "Uppercase letter": validationResults.uppercase,
        "Lowercase letter": validationResults.lowercase,
        Number: validationResults.number,
        "Special character (@$!%*?&)": validationResults.special,
      },
    });
  } catch (error) {
    console.error("Error validating password:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate password",
    });
  }
});

// Validate name endpoint (for real-time validation)
app.post("/api/auth/validate-name", (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const trimmedName = name.trim();
    const validationResults = {
      length: trimmedName.length >= 2 && trimmedName.length <= 50,
      characters: /^[a-zA-Z\s'-]+$/.test(trimmedName),
      noConsecutiveSpaces: !/\s{2,}/.test(trimmedName),
      noLeadingTrailing: trimmedName === name.trim(),
    };

    const isValid = Object.values(validationResults).every((result) => result);

    res.json({
      success: true,
      isValid,
      requirements: {
        "2-50 characters": validationResults.length,
        "Letters, spaces, apostrophes, hyphens only":
          validationResults.characters,
        "No consecutive spaces": validationResults.noConsecutiveSpaces,
        "No leading/trailing spaces": validationResults.noLeadingTrailing,
      },
    });
  } catch (error) {
    console.error("Error validating name:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate name",
    });
  }
});

// ==================== END USER PROFILE & SECURITY ENDPOINTS ====================

// Seed database with sample data
async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");

    // Create admin user
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@ecommerce.com",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
      status: "approved",
    });

    // Create some traders
    const trader1User = await User.create({
      name: "Raj Electronics",
      email: "raj@electronics.com",
      password: await bcrypt.hash("trader123", 10),
      role: "trader",
      status: "approved",
    });

    const trader2User = await User.create({
      name: "Fashion Hub",
      email: "fashion@hub.com",
      password: await bcrypt.hash("trader123", 10),
      role: "trader",
      status: "approved",
    });

    const trader3User = await User.create({
      name: "Sports World",
      email: "sports@world.com",
      password: await bcrypt.hash("trader123", 10),
      role: "trader",
      status: "approved",
    });

    // Create customers
    const customer1 = await User.create({
      name: "Binod Shrestha",
      email: "binod@gmail.com",
      password: await bcrypt.hash("customer123", 10),
      role: "customer",
      status: "approved",
    });

    // Create trader profiles
    const trader1 = await Trader.create({
      userId: trader1User.id,
      businessName: "Raj Electronics Store",
      verificationStatus: "approved",
    });

    const trader2 = await Trader.create({
      userId: trader2User.id,
      businessName: "Fashion Hub Nepal",
      verificationStatus: "approved",
    });

    const trader3 = await Trader.create({
      userId: trader3User.id,
      businessName: "Sports World Nepal",
      verificationStatus: "approved",
    });

    // Create shops
    const electronicsShop = await Shop.create({
      traderId: trader1.id,
      name: "Raj Electronics",
      category: "Electronics",
      description: "Premium electronics and gadgets",
    });

    const fashionShop = await Shop.create({
      traderId: trader2.id,
      name: "Fashion Hub",
      category: "Fashion",
      description: "Latest fashion trends and accessories",
    });

    const sportsShop = await Shop.create({
      traderId: trader3.id,
      name: "Sports World",
      category: "Sports",
      description: "Sports equipment and athletic wear",
    });

    // Create products
    const sampleProducts = [
      // Electronics
      {
        shopId: electronicsShop.id,
        traderId: trader1.id,
        name: "iPhone 15 Pro",
        description:
          "Latest iPhone with A17 Pro chip, titanium design, and advanced camera system",
        price: 149999.0,
        originalPrice: 159999.0,
        discount: 6,
        category: "Electronics",
        stock: 15,
        image:
          "https://via.placeholder.com/300x300/1a75ff/ffffff?text=iPhone+15+Pro",
        rating: 4.8,
        reviews: 124,
      },
      {
        shopId: electronicsShop.id,
        traderId: trader1.id,
        name: "Samsung Galaxy S24 Ultra",
        description:
          "Premium Samsung flagship with S Pen, 200MP camera, and AI features",
        price: 134999.0,
        originalPrice: 144999.0,
        discount: 7,
        category: "Electronics",
        stock: 20,
        image:
          "https://via.placeholder.com/300x300/ff6b1a/ffffff?text=Galaxy+S24",
        rating: 4.7,
        reviews: 89,
      },
      {
        shopId: electronicsShop.id,
        traderId: trader1.id,
        name: "MacBook Air M3",
        description:
          "Ultra-thin laptop with M3 chip, 13-inch Liquid Retina display",
        price: 124999.0,
        originalPrice: 134999.0,
        discount: 7,
        category: "Electronics",
        stock: 8,
        image:
          "https://via.placeholder.com/300x300/333333/ffffff?text=MacBook+Air",
        rating: 4.9,
        reviews: 67,
      },
      {
        shopId: electronicsShop.id,
        traderId: trader1.id,
        name: "Sony WH-1000XM5",
        description: "Industry-leading noise canceling wireless headphones",
        price: 34999.0,
        originalPrice: 39999.0,
        discount: 13,
        category: "Electronics",
        stock: 25,
        image:
          "https://via.placeholder.com/300x300/000000/ffffff?text=Sony+Headphones",
        rating: 4.6,
        reviews: 156,
      },
      {
        shopId: electronicsShop.id,
        traderId: trader1.id,
        name: 'iPad Pro 12.9"',
        description: "Powerful tablet with M2 chip, Liquid Retina XDR display",
        price: 109999.0,
        originalPrice: 119999.0,
        discount: 8,
        category: "Electronics",
        stock: 12,
        image:
          "https://via.placeholder.com/300x300/666666/ffffff?text=iPad+Pro",
        rating: 4.7,
        reviews: 78,
      },

      // Fashion
      {
        shopId: fashionShop.id,
        traderId: trader2.id,
        name: "Designer Kurta Set",
        description:
          "Premium cotton kurta with matching churidar, perfect for festivals",
        price: 4999.0,
        originalPrice: 6999.0,
        discount: 29,
        category: "Fashion",
        stock: 30,
        image:
          "https://via.placeholder.com/300x300/8B4513/ffffff?text=Kurta+Set",
        rating: 4.4,
        reviews: 45,
      },
      {
        shopId: fashionShop.id,
        traderId: trader2.id,
        name: "Lehenga Choli",
        description: "Beautiful bridal lehenga with heavy embroidery work",
        price: 24999.0,
        originalPrice: 34999.0,
        discount: 29,
        category: "Fashion",
        stock: 5,
        image: "https://via.placeholder.com/300x300/FF1493/ffffff?text=Lehenga",
        rating: 4.8,
        reviews: 23,
      },
      {
        shopId: fashionShop.id,
        traderId: trader2.id,
        name: "Saree Collection",
        description: "Elegant silk saree with traditional border design",
        price: 12999.0,
        originalPrice: 16999.0,
        discount: 24,
        category: "Fashion",
        stock: 18,
        image:
          "https://via.placeholder.com/300x300/FFD700/000000?text=Silk+Saree",
        rating: 4.5,
        reviews: 67,
      },
      {
        shopId: fashionShop.id,
        traderId: trader2.id,
        name: "Casual T-Shirt",
        description: "Comfortable cotton t-shirt for everyday wear",
        price: 1299.0,
        originalPrice: 1799.0,
        discount: 28,
        category: "Fashion",
        stock: 50,
        image: "https://via.placeholder.com/300x300/87CEEB/000000?text=T-Shirt",
        rating: 4.2,
        reviews: 134,
      },
      {
        shopId: fashionShop.id,
        traderId: trader2.id,
        name: "Jeans Premium",
        description: "High-quality denim jeans with perfect fit",
        price: 3499.0,
        originalPrice: 4999.0,
        discount: 30,
        category: "Fashion",
        stock: 22,
        image: "https://via.placeholder.com/300x300/000080/ffffff?text=Jeans",
        rating: 4.3,
        reviews: 89,
      },

      // Sports
      {
        shopId: sportsShop.id,
        traderId: trader3.id,
        name: "Football - FIFA Quality",
        description:
          "Professional quality football, FIFA approved for tournaments",
        price: 2999.0,
        originalPrice: 3999.0,
        discount: 25,
        category: "Sports",
        stock: 35,
        image:
          "https://via.placeholder.com/300x300/00FF00/000000?text=Football",
        rating: 4.6,
        reviews: 78,
      },
      {
        shopId: sportsShop.id,
        traderId: trader3.id,
        name: "Cricket Bat Professional",
        description:
          "English willow cricket bat, perfect for professional players",
        price: 8999.0,
        originalPrice: 11999.0,
        discount: 25,
        category: "Sports",
        stock: 15,
        image:
          "https://via.placeholder.com/300x300/8B4513/ffffff?text=Cricket+Bat",
        rating: 4.7,
        reviews: 45,
      },
      {
        shopId: sportsShop.id,
        traderId: trader3.id,
        name: "Badminton Racket Set",
        description: "Lightweight badminton racket with strings and grip",
        price: 4999.0,
        originalPrice: 6499.0,
        discount: 23,
        category: "Sports",
        stock: 28,
        image:
          "https://via.placeholder.com/300x300/FF4500/ffffff?text=Badminton",
        rating: 4.4,
        reviews: 67,
      },
      {
        shopId: sportsShop.id,
        traderId: trader3.id,
        name: "Running Shoes Nike",
        description: "Comfortable running shoes with air cushioning technology",
        price: 9999.0,
        originalPrice: 12999.0,
        discount: 23,
        category: "Sports",
        stock: 20,
        image:
          "https://via.placeholder.com/300x300/000000/ffffff?text=Nike+Shoes",
        rating: 4.8,
        reviews: 156,
      },
      {
        shopId: sportsShop.id,
        traderId: trader3.id,
        name: "Gym Equipment Set",
        description:
          "Complete home gym set with dumbbells and resistance bands",
        price: 15999.0,
        originalPrice: 19999.0,
        discount: 20,
        category: "Sports",
        stock: 10,
        image: "https://via.placeholder.com/300x300/4B0082/ffffff?text=Gym+Set",
        rating: 4.5,
        reviews: 34,
      },
    ];

    for (const productData of sampleProducts) {
      await Product.create({
        ...productData,
        inStock: productData.stock > 0,
        isActive: true,
        isViolated: false,
      });
    }

    console.log("✅ Database seeded successfully!");
    console.log("📊 Created:");
    console.log("   - 1 Admin user (admin@ecommerce.com / admin123)");
    console.log("   - 3 Traders with shops");
    console.log("   - 1 Customer (binod@gmail.com / customer123)");
    console.log("   - 15 Products across 3 categories");
    console.log("");
    console.log("🔐 Login credentials:");
    console.log("   Admin: admin@ecommerce.com / admin123");
    console.log("   Customer: binod@gmail.com / customer123");
    console.log("   Trader: raj@electronics.com / trader123");
  } catch (error) {
    console.error("❌ Seeding error:", error);
  }
}

// Initialize server with database setup
async function startServer() {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Define models after database is connected
    const models = defineModels(sequelize);
    ({
      User,
      Trader,
      Shop,
      Product,
      Order,
      OrderItem,
      Points,
      Violation,
      Review,
    } = models);

    // Sync database models
    await sequelize.sync({ force: false });
    console.log("📦 Database connected successfully"); // Check if data exists, if not seed it
    const userCount = await User.count();
    const productCount = await Product.count();

    console.log(
      `📊 Current database status: ${userCount} users, ${productCount} products`
    );

    if (userCount === 0 || productCount === 0) {
      console.log("🌱 Database appears empty, seeding with sample data...");
      await seedDatabase();
    } else {
      console.log("✅ Database already contains data, skipping seed");
    }

    // PayPal payment verification endpoint
    app.post(
      "/api/payments/verify-paypal",
      authenticateToken,
      async (req, res) => {
        try {
          const { paypalOrderId, paypalPayerId, transactionId } = req.body;

          // In production, you would verify with PayPal API here
          // For development, we'll simulate verification
          const verificationResult = {
            verified: true,
            paypalOrderId,
            paypalPayerId,
            transactionId,
            status: "COMPLETED",
            verifiedAt: new Date().toISOString(),
            environment: process.env.PAYPAL_ENVIRONMENT || "sandbox",
          };

          console.log("📧 PayPal payment verification:", verificationResult);

          res.json({
            success: true,
            data: verificationResult,
            message: "PayPal payment verified successfully",
          });
        } catch (error) {
          console.error("PayPal verification error:", error);
          res.status(500).json({
            success: false,
            message: "PayPal verification failed",
            error: error.message,
          });
        }
      }
    );

    // PayPal webhook endpoint (for production)
    app.post(
      "/api/webhooks/paypal",
      express.raw({ type: "application/json" }),
      async (req, res) => {
        try {
          const event = req.body;

          console.log("🔔 PayPal webhook received:", event.event_type);

          // In production, verify webhook signature here

          switch (event.event_type) {
            case "PAYMENT.CAPTURE.COMPLETED":
              // Handle successful payment
              console.log("✅ Payment completed:", event.resource.id);
              break;
            case "PAYMENT.CAPTURE.DENIED":
              // Handle failed payment
              console.log("❌ Payment denied:", event.resource.id);
              break;
            default:
              console.log("ℹ️ Unhandled webhook event:", event.event_type);
          }

          res.status(200).send("OK");
        } catch (error) {
          console.error("Webhook error:", error);
          res.status(400).send("Webhook Error");
        }
      }
    );

    app.listen(SERVER_PORT, () => {
      console.log(`🚀 Enhanced Database Server running on port ${SERVER_PORT}`);
      console.log(`📍 API available at: http://localhost:${SERVER_PORT}/api`);
      console.log("");
      console.log("🛒 Available endpoints:");
      console.log("   GET  /api/products - Get all products");
      console.log("   POST /api/auth/register - Register user");
      console.log("   POST /api/auth/login - Login user");
      console.log("   GET  /api/trader/dashboard - Trader dashboard");
      console.log("   POST /api/orders - Create order");
      console.log("   GET  /api/admin/dashboard - Admin dashboard");
      console.log("   GET  /api/user/points - User points");
      console.log(
        "   POST /api/payments/verify-paypal - Verify PayPal payment"
      );
      console.log("   POST /api/webhooks/paypal - PayPal webhook handler");
    });
  } catch (error) {
    console.error("❌ Server initialization failed:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
