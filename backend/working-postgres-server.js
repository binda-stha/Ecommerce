require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Import our actual models
const { User, Trader, Shop, Product } = require("./src/models");

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
const { sequelize } = require("./src/models");

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connection established successfully.");

    // Test users
    const users = await User.findAll({ attributes: ["email", "role"] });
    console.log("📋 Users in database:", users.length);
    users.forEach((user) => console.log(`- ${user.email} (${user.role})`));
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Login attempt for:", email);

    // Find user
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Trader,
          as: "traderProfile",
          required: false,
        },
      ],
    });

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log("✅ User found:", user.email, "Role:", user.role);

    // Check if user is active
    if (!user.isActive) {
      console.log("❌ User inactive");
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    console.log("🔑 Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("❌ Password invalid");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "binda-trade-nepal-secret-key",
      { expiresIn: "7d" }
    );

    console.log("🎉 Login successful for:", user.email);

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
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// Basic endpoints
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Shop, as: "shop" }],
    });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/trader/dashboard", async (req, res) => {
  res.json({ success: true, message: "Trader dashboard endpoint" });
});

app.get("/api/admin/dashboard", async (req, res) => {
  res.json({ success: true, message: "Admin dashboard endpoint" });
});

app.listen(PORT, () => {
  console.log(`🚀 PostgreSQL Server running on port ${PORT}`);
  console.log(`📍 API available at: http://localhost:${PORT}/api`);
  startServer();
});
