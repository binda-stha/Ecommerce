const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORS middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test routes
app.get("/api/health", (req, res) => {
  res.json({
    message: "Server is running!",
    timestamp: new Date().toISOString(),
    status: "healthy",
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend API is working!",
    version: "1.0.0",
  });
});

// Placeholder auth routes for testing
app.post("/api/auth/register", (req, res) => {
  res.json({
    success: true,
    message: "Registration endpoint ready (placeholder)",
    data: req.body,
  });
});

app.post("/api/auth/login", (req, res) => {
  res.json({
    success: true,
    message: "Login endpoint ready (placeholder)",
    token: "sample_jwt_token",
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✓ Test Server running on port ${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✓ Frontend should connect to: http://localhost:3000`);
});

module.exports = app;
