require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
const PORT = process.env.PORT || 5001;

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || "ecommerce_db",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "password",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Define Product model
const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0,
  },
  reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  inStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  discount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  shop: {
    type: DataTypes.STRING,
  },
  trader: {
    type: DataTypes.STRING,
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

// Define User model for authentication
const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
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
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("customer", "trader", "admin"),
    defaultValue: "customer",
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  totalPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  phone: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.TEXT,
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "VistaarTrade E-commerce API - PostgreSQL Connected",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.1", // Updated version
  });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access token required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your_jwt_secret",
    (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid token" });
      }
      req.user = user;
      next();
    }
  );
};

// Auth endpoints
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, address } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Email, password, first name, and last name are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      address,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          totalPoints: user.totalPoints,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          totalPoints: user.totalPoints,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
});

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user data",
      error: error.message,
    });
  }
});

// Seed sample products (run once)
const seedProducts = async () => {
  try {
    const count = await Product.count();
    if (count === 0) {
      console.log("🌱 Seeding sample products...");

      const sampleProducts = [
        {
          name: "Premium Wireless Headphones",
          description:
            "High-quality wireless headphones with active noise cancellation and 30-hour battery life",
          price: 2999.0,
          originalPrice: 3999.0,
          category: "Electronics",
          image:
            "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Headphones",
          rating: 4.5,
          reviews: 245,
          inStock: true,
          views: 120,
          discount: 25,
          shop: "TechWorld",
          trader: "Tech Trader",
          points: 29,
        },
        {
          name: "Designer Cotton T-Shirt",
          description:
            "Comfortable premium cotton t-shirt with modern design and perfect fit",
          price: 1299.0,
          originalPrice: 1799.0,
          category: "Fashion",
          image:
            "https://via.placeholder.com/300x300/1a75ff/ffffff?text=T-Shirt",
          rating: 4.2,
          reviews: 89,
          inStock: true,
          views: 95,
          discount: 28,
          shop: "Fashion Hub",
          trader: "Style Trader",
          points: 12,
        },
        {
          name: "Smart Fitness Watch",
          description:
            "Advanced fitness tracking watch with heart rate monitor, GPS, and water resistance",
          price: 4999.0,
          originalPrice: 6499.0,
          category: "Electronics",
          image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Watch",
          rating: 4.7,
          reviews: 156,
          inStock: true,
          views: 203,
          discount: 23,
          shop: "FitGear",
          trader: "Fitness Pro",
          points: 49,
        },
        {
          name: "Organic Skincare Set",
          description:
            "Complete organic skincare routine with natural ingredients for all skin types",
          price: 1599.0,
          originalPrice: 2299.0,
          category: "Beauty",
          image:
            "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Skincare",
          rating: 4.4,
          reviews: 78,
          inStock: true,
          views: 67,
          discount: 30,
          shop: "Beauty Box",
          trader: "Beauty Expert",
          points: 15,
        },
        {
          name: "Gaming Mechanical Keyboard",
          description:
            "RGB mechanical keyboard with cherry switches, perfect for gaming and typing",
          price: 3499.0,
          originalPrice: 4299.0,
          category: "Electronics",
          image:
            "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Keyboard",
          rating: 4.6,
          reviews: 134,
          inStock: true,
          views: 189,
          discount: 19,
          shop: "GameZone",
          trader: "Gaming Pro",
          points: 34,
        },
        {
          name: "Premium Yoga Mat",
          description:
            "Non-slip premium yoga mat with excellent grip and cushioning for all yoga styles",
          price: 899.0,
          originalPrice: 1199.0,
          category: "Sports",
          image:
            "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Yoga+Mat",
          rating: 4.3,
          reviews: 92,
          inStock: true,
          views: 56,
          discount: 25,
          shop: "FitLife",
          trader: "Wellness Pro",
          points: 8,
        },
        {
          name: "Bluetooth Portable Speaker",
          description:
            "High-quality portable speaker with deep bass and 20-hour battery life",
          price: 1999.0,
          originalPrice: 2799.0,
          category: "Electronics",
          image:
            "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Speaker",
          rating: 4.4,
          reviews: 167,
          inStock: true,
          views: 143,
          discount: 29,
          shop: "SoundHub",
          trader: "Audio Expert",
          points: 19,
        },
        {
          name: "Professional Coffee Maker",
          description:
            "Professional grade coffee maker with built-in grinder and programmable settings",
          price: 5999.0,
          originalPrice: 7499.0,
          category: "Home",
          image:
            "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Coffee",
          rating: 4.5,
          reviews: 201,
          inStock: true,
          views: 234,
          discount: 20,
          shop: "KitchenPro",
          trader: "Home Expert",
          points: 59,
        },
        {
          name: "Wireless Charging Pad",
          description:
            "Fast wireless charging pad compatible with all Qi-enabled devices",
          price: 799.0,
          originalPrice: 1199.0,
          category: "Electronics",
          image:
            "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Charger",
          rating: 4.1,
          reviews: 87,
          inStock: true,
          views: 76,
          discount: 33,
          shop: "TechWorld",
          trader: "Tech Trader",
          points: 7,
        },
        {
          name: "Stainless Steel Water Bottle",
          description:
            "Insulated stainless steel water bottle that keeps drinks cold for 24h or hot for 12h",
          price: 699.0,
          originalPrice: 999.0,
          category: "Sports",
          image:
            "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Bottle",
          rating: 4.2,
          reviews: 143,
          inStock: true,
          views: 89,
          discount: 30,
          shop: "FitLife",
          trader: "Wellness Pro",
          points: 6,
        },
        {
          name: "LED Desk Lamp",
          description:
            "Adjustable LED desk lamp with touch controls and USB charging port",
          price: 1299.0,
          originalPrice: 1799.0,
          category: "Home",
          image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Lamp",
          rating: 4.3,
          reviews: 98,
          inStock: true,
          views: 67,
          discount: 28,
          shop: "KitchenPro",
          trader: "Home Expert",
          points: 12,
        },
        {
          name: "Luxury Face Cream",
          description:
            "Anti-aging luxury face cream with natural ingredients and SPF protection",
          price: 2299.0,
          originalPrice: 3199.0,
          category: "Beauty",
          image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Cream",
          rating: 4.6,
          reviews: 212,
          inStock: true,
          views: 156,
          discount: 28,
          shop: "Beauty Box",
          trader: "Beauty Expert",
          points: 22,
        },
      ];

      await Product.bulkCreate(sampleProducts);
      console.log("✅ Sample products seeded successfully!");
    }
  } catch (error) {
    console.error("❌ Error seeding products:", error);
  }
};

// Products API endpoints
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

    // Build where clause
    const whereClause = {};

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
      if (whereClause.price) {
        whereClause.price[Sequelize.Op.lte] = parseFloat(maxPrice);
      } else {
        whereClause.price = { [Sequelize.Op.lte]: parseFloat(maxPrice) };
      }
    }

    // Build order clause
    const orderClause = [[sortBy, sortOrder.toUpperCase()]];

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Execute query
    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: limitNum,
      offset: offset,
    });

    res.json({
      success: true,
      data: {
        products: rows,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(count / limitNum),
          totalProducts: count,
          hasNext: offset + limitNum < count,
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
});

app.get("/api/products/categories", async (req, res) => {
  try {
    const categories = await Product.findAll({
      attributes: [
        "category",
        [sequelize.fn("COUNT", sequelize.col("category")), "count"],
      ],
      group: ["category"],
      order: [["category", "ASC"]],
    });

    res.json({
      success: true,
      data: categories.map((cat, index) => ({
        id: index + 1,
        name: cat.category,
        count: parseInt(cat.dataValues.count),
      })),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Increment view count
    await product.increment("views", { by: 1 });

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log("🔄 Connecting to PostgreSQL database...");
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    console.log("🔄 Syncing database models...");
    await sequelize.sync({ alter: true });
    console.log("✅ Database models synced successfully.");

    await seedProducts();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `🌐 Frontend URL: ${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }`
      );
      console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
      console.log(`🛍️  Products: http://localhost:${PORT}/api/products`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
