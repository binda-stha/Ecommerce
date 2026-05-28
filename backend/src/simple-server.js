require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Sample products data (for testing without database)
const sampleProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 2999,
    originalPrice: 3999,
    discount: 25,
    rating: 4.5,
    reviews: 245,
    image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Headphones",
    category: "Electronics",
    description: "High-quality wireless headphones with noise cancellation",
    inStock: true,
    views: 120,
    shop: "TechWorld",
    trader: "Tech Trader",
    points: 29,
  },
  {
    id: 2,
    name: "Designer Cotton T-Shirt",
    price: 1299,
    originalPrice: 1799,
    discount: 28,
    rating: 4.2,
    reviews: 89,
    image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=T-Shirt",
    category: "Fashion",
    description: "Comfortable cotton t-shirt with modern design",
    inStock: true,
    views: 95,
    shop: "Fashion Hub",
    trader: "Style Trader",
    points: 12,
  },
  {
    id: 3,
    name: "Smart Fitness Watch",
    price: 4999,
    originalPrice: 6499,
    discount: 23,
    rating: 4.7,
    reviews: 156,
    image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Watch",
    category: "Electronics",
    description: "Advanced fitness tracking with heart rate monitor",
    inStock: true,
    views: 203,
    shop: "FitGear",
    trader: "Fitness Pro",
    points: 49,
  },
  {
    id: 4,
    name: "Organic Skincare Set",
    price: 1599,
    originalPrice: 2299,
    discount: 30,
    rating: 4.4,
    reviews: 78,
    image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Skincare",
    category: "Beauty",
    description: "Natural organic skincare collection",
    inStock: true,
    views: 67,
    shop: "Beauty Box",
    trader: "Beauty Expert",
    points: 15,
  },
  {
    id: 5,
    name: "Gaming Mechanical Keyboard",
    price: 3499,
    originalPrice: 4299,
    discount: 19,
    rating: 4.6,
    reviews: 134,
    image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Keyboard",
    category: "Electronics",
    description: "RGB mechanical keyboard for gaming",
    inStock: true,
    views: 189,
    shop: "GameZone",
    trader: "Gaming Pro",
    points: 34,
  },
  {
    id: 6,
    name: "Yoga Mat Premium",
    price: 899,
    originalPrice: 1199,
    discount: 25,
    rating: 4.3,
    reviews: 92,
    image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Yoga+Mat",
    category: "Sports",
    description: "Non-slip premium yoga mat",
    inStock: true,
    views: 56,
    shop: "FitLife",
    trader: "Wellness Pro",
    points: 8,
  },
  {
    id: 7,
    name: "Bluetooth Speaker",
    price: 1999,
    originalPrice: 2799,
    discount: 29,
    rating: 4.4,
    reviews: 167,
    image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Speaker",
    category: "Electronics",
    description: "Portable wireless speaker with deep bass",
    inStock: true,
    views: 143,
    shop: "SoundHub",
    trader: "Audio Expert",
    points: 19,
  },
  {
    id: 8,
    name: "Coffee Maker Deluxe",
    price: 5999,
    originalPrice: 7499,
    discount: 20,
    rating: 4.5,
    reviews: 201,
    image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Coffee",
    category: "Home",
    description: "Professional grade coffee maker",
    inStock: true,
    views: 234,
    shop: "KitchenPro",
    trader: "Home Expert",
    points: 59,
  },
];

const categories = [
  { id: 1, name: "Electronics", count: 4 },
  { id: 2, name: "Fashion", count: 1 },
  { id: 3, name: "Beauty", count: 1 },
  { id: 4, name: "Sports", count: 1 },
  { id: 5, name: "Home", count: 1 },
];

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "VistaarTrade E-commerce API - Simple Server",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// Products endpoints
app.get("/api/products", (req, res) => {
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

    let filteredProducts = [...sampleProducts];

    // Apply filters
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm)
      );
    }

    if (category && category !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (minPrice) {
      filteredProducts = filteredProducts.filter(
        (product) => product.price >= parseInt(minPrice)
      );
    }

    if (maxPrice) {
      filteredProducts = filteredProducts.filter(
        (product) => product.price <= parseInt(maxPrice)
      );
    }

    // Apply sorting
    filteredProducts.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "price" || sortBy === "rating" || sortBy === "views") {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (sortOrder === "desc") {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(filteredProducts.length / limitNum),
          totalProducts: filteredProducts.length,
          hasNext: endIndex < filteredProducts.length,
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
});

app.get("/api/products/categories", (req, res) => {
  try {
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
});

app.get("/api/products/:id", (req, res) => {
  try {
    const { id } = req.params;
    const product = sampleProducts.find((p) => p.id === parseInt(id));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Increment view count (in real app, this would update database)
    product.views = (product.views || 0) + 1;

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Simple Server running on port ${PORT}`);
  console.log(
    `🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🛍️  Products: http://localhost:${PORT}/api/products`);
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
