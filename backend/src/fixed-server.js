// ...existing code...
// ...existing code...
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Sequelize } = require("sequelize");

const app = express();
const PORT = process.env.PORT || 5001;

// Database connection
const sequelize = new Sequelize("ecommerce_db", "postgres", "root", {
  host: "localhost",
  port: 5432,
  dialect: "postgres",
  logging: false,
});

// Test database connection
sequelize
  .authenticate()
  .then(() => console.log("✅ PostgreSQL connected successfully"))
  .catch((err) => console.error("❌ Database connection error:", err));

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());

// Trader Product CRUD
const authenticateTrader = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    if (decoded.role !== "trader")
      return res.status(403).json({ message: "Access denied" });
    req.traderUserId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Create product
app.post("/api/trader/products", authenticateTrader, async (req, res) => {
  try {
    const { name, sku, price, stock, image, category, description } = req.body;
    if (!name || !price || !stock || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    // Find trader's shop (limit 2 shops)
    const [shops] = await sequelize.query(
      `SELECT id FROM "Shops" WHERE "traderId" = :traderId LIMIT 1`,
      {
        replacements: { traderId: req.traderUserId },
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    if (shops.length === 0)
      return res.status(400).json({ message: "No shop found for trader" });
    // Insert product (limit 5 per shop)
    const [productCount] = await sequelize.query(
      `SELECT COUNT(*) FROM "Products" WHERE "shopId" = :shopId`,
      {
        replacements: { shopId: shops[0].id },
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    if (parseInt(productCount.count) >= 5)
      return res.status(400).json({ message: "Shop product limit reached" });
    const [result] = await sequelize.query(
      `INSERT INTO "Products" ("shopId", name, sku, price, stock, images, category, description, "isActive", "createdAt", "updatedAt")
       VALUES (:shopId, :name, :sku, :price, :stock, :images, :category, :description, true, NOW(), NOW()) RETURNING *`,
      {
        replacements: {
          shopId: shops[0].id,
          name,
          sku: sku || `SKU${Date.now()}`,
          price,
          stock,
          images: JSON.stringify([image]),
          category,
          description: description || "",
        },
        type: Sequelize.QueryTypes.INSERT,
      }
    );
    res.json({ success: true, product: result[0] });
  } catch (err) {
    res.status(500).json({ message: "Error creating product" });
  }
});

// Update product
app.put("/api/trader/products/:id", authenticateTrader, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, price, stock, image, category, description, action } =
      req.body;
    // Find product and verify ownership
    const [products] = await sequelize.query(
      `SELECT p.*, s."traderId" FROM "Products" p JOIN "Shops" s ON p."shopId" = s.id WHERE p.id = :id`,
      { replacements: { id }, type: Sequelize.QueryTypes.SELECT }
    );
    if (products.length === 0)
      return res.status(404).json({ message: "Product not found" });
    if (products[0].traderId !== req.traderUserId)
      return res.status(403).json({ message: "Not your product" });
    // Toggle status
    if (action === "toggle_status") {
      await sequelize.query(
        `UPDATE "Products" SET "isActive" = NOT "isActive", "updatedAt" = NOW() WHERE id = :id`,
        { replacements: { id }, type: Sequelize.QueryTypes.UPDATE }
      );
      return res.json({ success: true, message: "Product status toggled" });
    }
    // Update fields
    await sequelize.query(
      `UPDATE "Products" SET name = :name, sku = :sku, price = :price, stock = :stock, images = :images, category = :category, description = :description, "updatedAt" = NOW() WHERE id = :id`,
      {
        replacements: {
          id,
          name: name || products[0].name,
          sku: sku || products[0].sku,
          price: price || products[0].price,
          stock: stock || products[0].stock,
          images: JSON.stringify([
            image || (products[0].images ? products[0].images[0] : ""),
          ]),
          category: category || products[0].category,
          description: description || products[0].description,
        },
        type: Sequelize.QueryTypes.UPDATE,
      }
    );
    res.json({ success: true, message: "Product updated" });
  } catch (err) {
    res.status(500).json({ message: "Error updating product" });
  }
});

// Delete product
app.delete("/api/trader/products/:id", authenticateTrader, async (req, res) => {
  try {
    const { id } = req.params;
    // Find product and verify ownership
    const [products] = await sequelize.query(
      `SELECT p.*, s."traderId" FROM "Products" p JOIN "Shops" s ON p."shopId" = s.id WHERE p.id = :id`,
      { replacements: { id }, type: Sequelize.QueryTypes.SELECT }
    );
    if (products.length === 0)
      return res.status(404).json({ message: "Product not found" });
    if (products[0].traderId !== req.traderUserId)
      return res.status(403).json({ message: "Not your product" });
    await sequelize.query(`DELETE FROM "Products" WHERE id = :id`, {
      replacements: { id },
      type: Sequelize.QueryTypes.DELETE,
    });
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product" });
  }
});
// ...existing code...

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Register route
app.post("/api/auth/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phone, address } =
      req.body;
    if (!firstName || !lastName || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Missing required fields", success: false });
    }
    // Check if user exists
    const [existing] = await sequelize.query(
      `SELECT id FROM "Users" WHERE email = $1`,
      { bind: [email], type: sequelize.QueryTypes.SELECT }
    );
    if (existing) {
      return res
        .status(409)
        .json({ message: "Email already registered", success: false });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert user
    const [user] = await sequelize.query(
      `INSERT INTO "Users" ("firstName", "lastName", email, password, role, phone, address, "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW()) RETURNING id, "firstName", "lastName", email, role`,
      {
        bind: [
          firstName,
          lastName,
          email,
          hashedPassword,
          role,
          phone || "",
          address || "",
        ],
        type: sequelize.QueryTypes.INSERT,
      }
    );
    res.json({ success: true, message: "User registered successfully", user });
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    res
      .status(500)
      .json({ message: "Server error during registration", success: false });
  }
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "🏪 E-commerce API Server",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth/login",
      products: "/api/products",
      users: "/api/users/profile",
    },
  });
});
// Dummy /api/orders endpoint for order placement (COD/PayPal)
app.post("/api/orders", (req, res) => {
  const { paymentMethod } = req.body;
  if (paymentMethod === "paypal") {
    return res.json({
      success: true,
      message: "Order placed with dummy PayPal payment.",
      paymentStatus: "paid",
      transactionId: "DUMMY_PAYPAL_TXN_123456",
    });
  }
  return res.json({
    success: true,
    message: "Order placed with Cash on Delivery.",
    paymentStatus: "pending",
  });
});
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

app.get("/api/orders", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    const userId = decoded.userId;
    const [orders] = await sequelize.query(
      `SELECT * FROM "Orders" WHERE "customerId" = '${userId}' ORDER BY "createdAt" DESC`
    );
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "E-commerce API Server",
    timestamp: new Date().toISOString(),
    database: "PostgreSQL connected",
  });
});

// Auth routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Login attempt for:", email);

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
        success: false,
      });
    }

    // Query user with correct column names
    const users = await sequelize.query(
      `
      SELECT id, "firstName", "lastName", email, password, role, "isActive"
      FROM "Users" 
      WHERE email = $1 AND "isActive" = true
    `,
      {
        bind: [email],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (users.length === 0) {
      console.log("❌ User not found:", email);
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log("❌ Invalid password for:", email);
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    // Get trader profile if user is trader
    let traderProfile = null;
    if (user.role === "trader") {
      const traders = await sequelize.query(
        `
        SELECT id, "businessName", "businessType", status, "isApproved", "shopCount"
        FROM "Traders" 
        WHERE "userId" = $1
      `,
        {
          bind: [user.id],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (traders.length > 0) {
        traderProfile = traders[0];
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" }
    );

    console.log("✅ Login successful for:", email, "Role:", user.role);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        trader: traderProfile,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({
      message: "Server error during login",
      success: false,
    });
  }
});

// Get products
// TEMP: Admin endpoint to activate all products and remove violation flags
app.put("/api/admin/activate-all-products", async (req, res) => {
  try {
    await sequelize.query(
      'UPDATE "Products" SET "isActive" = true, "isViolated" = false WHERE "isActive" = false OR "isViolated" = true'
    );
    res.json({
      success: true,
      message: "All products activated and violations removed.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
app.get("/api/products", async (req, res) => {
  try {
    const [products] = await sequelize.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p."originalPrice",
        p.category,
        p.stock,
        p.images,
        p.rating,
        p."totalSales",
        p."isActive",
        s.name as "shopName",
        t."businessName" as "traderName"
      FROM "Products" p
      LEFT JOIN "Shops" s ON p."shopId" = s.id
      LEFT JOIN "Traders" t ON s."traderId" = t.id
      WHERE p."isActive" = true AND p."isViolated" = false
      ORDER BY p."createdAt" DESC
      LIMIT 50
    `);

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      originalPrice: product.originalPrice
        ? parseFloat(product.originalPrice)
        : null,
      category: product.category,
      stock: product.stock,
      images: product.images || [],
      rating: product.rating ? parseFloat(product.rating) : 0,
      totalSales: product.totalSales || 0,
      shopName: product.shopName,
      traderName: product.traderName,
      inStock: product.stock > 0,
      discount: product.originalPrice
        ? Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) *
              100
          )
        : 0,
    }));

    res.json({
      success: true,
      products: formattedProducts,
      total: formattedProducts.length,
    });
  } catch (error) {
    console.error("❌ Products error:", error.message);
    res.status(500).json({
      message: "Error fetching products",
      success: false,
    });
  }
});

// Get user profile (protected route)
app.get("/api/users/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );

    const [users] = await sequelize.query(
      `
      SELECT id, "firstName", "lastName", email, role, phone, address
      FROM "Users" 
      WHERE id = :userId
    `,
      {
        replacements: { userId: decoded.userId },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error("❌ Profile error:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
});

// Get trader dashboard data
// Get admin dashboard data
app.get("/api/admin/dashboard", async (req, res) => {
  try {
    // Optionally, add admin authentication here if needed
    // Get total users
    const [users] = await sequelize.query(
      'SELECT COUNT(*) AS count FROM "Users"'
    );
    // Get total traders
    const [traders] = await sequelize.query(
      'SELECT COUNT(*) AS count FROM "Traders"'
    );
    // Get total products
    const [products] = await sequelize.query(
      'SELECT COUNT(*) AS count FROM "Products"'
    );
    // Get total orders
    const [orders] = await sequelize.query(
      'SELECT COUNT(*) AS count FROM "Orders"'
    );
    // Get total shops
    const [shops] = await sequelize.query(
      'SELECT COUNT(*) AS count FROM "Shops"'
    );
    // Get total points awarded
    const [points] = await sequelize.query(
      'SELECT SUM(points) AS total FROM "Points"'
    );
    res.json({
      success: true,
      stats: {
        totalUsers: users[0]?.count || 0,
        totalTraders: traders[0]?.count || 0,
        totalProducts: products[0]?.count || 0,
        totalOrders: orders[0]?.count || 0,
        totalShops: shops[0]?.count || 0,
        totalPoints: points[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("❌ Admin dashboard error:", error.message);
    res.status(500).json({ message: "Server error", success: false });
  }
});

// Generic fetch endpoints for admin
app.get("/api/admin/users", async (req, res) => {
  try {
    const [users] = await sequelize.query('SELECT * FROM "Users"');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/admin/products", async (req, res) => {
  try {
    const [products] = await sequelize.query('SELECT * FROM "Products"');
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/admin/traders", async (req, res) => {
  try {
    const [traders] = await sequelize.query('SELECT * FROM "Traders"');
    res.json({ success: true, traders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/admin/shops", async (req, res) => {
  try {
    const [shops] = await sequelize.query('SELECT * FROM "Shops"');
    res.json({ success: true, shops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/admin/orders", async (req, res) => {
  try {
    const [orders] = await sequelize.query('SELECT * FROM "Orders"');
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/admin/points", async (req, res) => {
  try {
    const [points] = await sequelize.query('SELECT * FROM "Points"');
    res.json({ success: true, points });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generic update endpoint for admin (example: update user)
app.put("/api/admin/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    // Build update query dynamically
    const fields = Object.keys(updates)
      .map((key, idx) => `"${key}" = $${idx + 1}`)
      .join(", ");
    const values = Object.values(updates);
    await sequelize.query(
      `UPDATE "Users" SET ${fields} WHERE id = $${values.length + 1}`,
      { bind: [...values, userId], type: sequelize.QueryTypes.UPDATE }
    );
    res.json({ success: true, message: "User updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fetch everything from all main tables (admin overview)
app.get("/api/admin/all-data", async (req, res) => {
  try {
    const [users] = await sequelize.query('SELECT * FROM "Users"');
    const [traders] = await sequelize.query('SELECT * FROM "Traders"');
    const [products] = await sequelize.query('SELECT * FROM "Products"');
    const [shops] = await sequelize.query('SELECT * FROM "Shops"');
    const [orders] = await sequelize.query('SELECT * FROM "Orders"');
    const [orderItems] = await sequelize.query('SELECT * FROM "OrderItems"');
    const [points] = await sequelize.query('SELECT * FROM "Points"');
    res.json({
      success: true,
      users,
      traders,
      products,
      shops,
      orders,
      orderItems,
      points,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Get trader dashboard data
app.get("/api/trader/dashboard", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );

    if (decoded.role !== "trader") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get trader profile
    const [traders] = await sequelize.query(
      `
      SELECT * FROM "Traders" WHERE "userId" = :userId
    `,
      {
        replacements: { userId: decoded.userId },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (traders.length === 0) {
      return res.status(404).json({ message: "Trader profile not found" });
    }

    const trader = traders[0];

    // Get trader's shops
    const [shops] = await sequelize.query(
      `
      SELECT * FROM "Shops" WHERE "traderId" = :traderId
    `,
      {
        replacements: { traderId: trader.id },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    // Get trader's products
    const [products] = await sequelize.query(
      `
      SELECT p.*, s.name as "shopName"
      FROM "Products" p
      LEFT JOIN "Shops" s ON p."shopId" = s.id
      WHERE s."traderId" = :traderId
    `,
      {
        replacements: { traderId: trader.id },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      success: true,
      trader,
      shops,
      products,
      stats: {
        totalShops: shops.length,
        totalProducts: products.length,
        activeProducts: products.filter((p) => p.isActive).length,
      },
    });
  } catch (error) {
    console.error("❌ Dashboard error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);
  res.status(500).json({
    message: "Internal server error",
    success: false,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(
    `📊 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );
  console.log(`🔐 Test login: electronics@trader.com / trader123`);
});

module.exports = app;
