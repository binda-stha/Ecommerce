require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for products
const products = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 2999,
    originalPrice: 4999,
    category: "Electronics",
    image: "https://via.placeholder.com/300x300/3B82F6/white?text=Headphones",
    rating: 4.5,
    reviews: 128,
    inStock: true,
    discount: 40,
    shop: "TechHub",
    trader: "Electronics Pro",
    points: 30,
  },
  {
    id: "2",
    name: "Smartphone Case",
    description: "Durable smartphone case with premium finish",
    price: 599,
    originalPrice: 999,
    category: "Accessories",
    image: "https://via.placeholder.com/300x300/10B981/white?text=Case",
    rating: 4.2,
    reviews: 85,
    inStock: true,
    discount: 40,
    shop: "Mobile World",
    trader: "Accessory King",
    points: 6,
  },
  {
    id: "3",
    name: "Bluetooth Speaker",
    description: "Portable Bluetooth speaker with excellent sound quality",
    price: 1499,
    originalPrice: 2499,
    category: "Electronics",
    image: "https://via.placeholder.com/300x300/F59E0B/white?text=Speaker",
    rating: 4.7,
    reviews: 203,
    inStock: true,
    discount: 40,
    shop: "Audio Plus",
    trader: "Sound Master",
    points: 15,
  },
  {
    id: "4",
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse for gaming and office use",
    price: 899,
    originalPrice: 1299,
    category: "Computer",
    image: "https://via.placeholder.com/300x300/EF4444/white?text=Mouse",
    rating: 4.3,
    reviews: 67,
    inStock: true,
    discount: 31,
    shop: "PC World",
    trader: "Computer Hub",
    points: 9,
  },
  {
    id: "5",
    name: "USB Cable",
    description: "High-speed USB-C charging cable",
    price: 299,
    originalPrice: 499,
    category: "Accessories",
    image: "https://via.placeholder.com/300x300/8B5CF6/white?text=Cable",
    rating: 4.1,
    reviews: 45,
    inStock: true,
    discount: 40,
    shop: "Cable Store",
    trader: "Tech Accessories",
    points: 3,
  },
  {
    id: "6",
    name: "Power Bank",
    description: "10000mAh portable power bank with fast charging",
    price: 1299,
    originalPrice: 1999,
    category: "Electronics",
    image: "https://via.placeholder.com/300x300/06B6D4/white?text=PowerBank",
    rating: 4.4,
    reviews: 156,
    inStock: true,
    discount: 35,
    shop: "Power Solutions",
    trader: "Battery Expert",
    points: 13,
  },
  {
    id: "7",
    name: "Gaming Keyboard",
    description: "Mechanical gaming keyboard with RGB lighting",
    price: 2599,
    originalPrice: 3999,
    category: "Computer",
    image: "https://via.placeholder.com/300x300/F97316/white?text=Keyboard",
    rating: 4.6,
    reviews: 89,
    inStock: true,
    discount: 35,
    shop: "Gaming World",
    trader: "Pro Gamer",
    points: 26,
  },
  {
    id: "8",
    name: "Smart Watch",
    description: "Fitness tracking smartwatch with heart rate monitor",
    price: 4999,
    originalPrice: 7999,
    category: "Electronics",
    image: "https://via.placeholder.com/300x300/EC4899/white?text=Watch",
    rating: 4.4,
    reviews: 145,
    inStock: true,
    discount: 38,
    shop: "Wearable Tech",
    trader: "Smart Devices",
    points: 50,
  },
  {
    id: "9",
    name: "Laptop Stand",
    description: "Adjustable aluminum laptop stand for better ergonomics",
    price: 1799,
    originalPrice: 2999,
    category: "Computer",
    image: "https://via.placeholder.com/300x300/14B8A6/white?text=Stand",
    rating: 4.3,
    reviews: 76,
    inStock: true,
    discount: 40,
    shop: "Office Solutions",
    trader: "Workspace Pro",
    points: 18,
  },
  {
    id: "10",
    name: "Camera Lens",
    description: "50mm prime lens for DSLR cameras",
    price: 8999,
    originalPrice: 12999,
    category: "Photography",
    image: "https://via.placeholder.com/300x300/8B5CF6/white?text=Lens",
    rating: 4.8,
    reviews: 234,
    inStock: true,
    discount: 31,
    shop: "Photo Hub",
    trader: "Camera Expert",
    points: 90,
  },
];

// Categories
const categories = [
  { id: "1", name: "Electronics", count: 152 },
  { id: "2", name: "Accessories", count: 89 },
  { id: "3", name: "Computer", count: 67 },
  { id: "4", name: "Mobile", count: 234 },
  { id: "5", name: "Audio", count: 45 },
];

// Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "VistaarTrade E-commerce API",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// Get all products
app.get("/api/products", (req, res) => {
  try {
    const { category, search, limit, offset } = req.query;
    let filteredProducts = [...products];

    // Filter by category
    if (category && category !== "all") {
      filteredProducts = filteredProducts.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.category.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const startIndex = parseInt(offset) || 0;
    const count = parseInt(limit) || filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(
      startIndex,
      startIndex + count
    );

    res.json({
      success: true,
      data: paginatedProducts,
      total: filteredProducts.length,
      count: paginatedProducts.length,
      offset: startIndex,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
});

// Get single product
app.get("/api/products/:id", (req, res) => {
  try {
    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
});

// Get categories
app.get("/api/categories", (req, res) => {
  try {
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
});

// Auth routes (mock)
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  // Mock authentication
  if (email && password) {
    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: "1",
        email: email,
        firstName: "John",
        lastName: "Doe",
        role: "customer",
      },
      token: "mock-jwt-token",
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid credentials",
    });
  }
});

app.post("/api/auth/register", (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Mock registration
  if (email && password && firstName && lastName) {
    res.json({
      success: true,
      message: "Registration successful",
      user: {
        id: "2",
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: "customer",
      },
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Health check: http://localhost:${PORT}/api/health`);
  console.log(`🛒 Products API: http://localhost:${PORT}/api/products`);
});

module.exports = app;
