// Clean redirect to PostgreSQL server
console.log(
  "🔄 Starting Binda Trade server for Nepal with 20 products (NPR pricing)..."
);
require("./postgres-server.js");

// Temporarily comment out routes that cause issues
// app.use("/api/products", productRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "VistaarTrade-Style E-commerce API",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

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
  {
    id: 9,
    name: "Laptop Stand Adjustable",
    price: 1499,
    originalPrice: 1999,
    discount: 25,
    rating: 4.3,
    reviews: 87,
    image:
      "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Laptop+Stand",
    category: "Electronics",
    description: "Ergonomic adjustable laptop stand",
    inStock: true,
    views: 145,
    shop: "OfficeDesk",
    trader: "Office Pro",
    points: 14,
  },
  {
    id: 10,
    name: "Wireless Mouse",
    price: 899,
    originalPrice: 1299,
    discount: 31,
    rating: 4.4,
    reviews: 156,
    image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Mouse",
    category: "Electronics",
    description: "Precision wireless optical mouse",
    inStock: true,
    views: 98,
    shop: "TechWorld",
    trader: "Tech Trader",
    points: 8,
  },
  {
    id: 11,
    name: "Running Shoes",
    price: 3999,
    originalPrice: 5499,
    discount: 27,
    rating: 4.6,
    reviews: 203,
    image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Shoes",
    category: "Sports",
    description: "Professional running shoes with comfort sole",
    inStock: true,
    views: 187,
    shop: "SportZone",
    trader: "Sports Pro",
    points: 39,
  },
  {
    id: 12,
    name: "LED Desk Lamp",
    price: 1299,
    originalPrice: 1799,
    discount: 28,
    rating: 4.2,
    reviews: 134,
    image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Lamp",
    category: "Home",
    description: "Energy efficient LED desk lamp",
    inStock: true,
    views: 76,
    shop: "LightingHub",
    trader: "Home Expert",
    points: 12,
  },
  {
    id: 13,
    name: "Protein Powder",
    price: 2499,
    originalPrice: 2999,
    discount: 17,
    rating: 4.5,
    reviews: 298,
    image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Protein",
    category: "Health",
    description: "Premium whey protein powder",
    inStock: true,
    views: 245,
    shop: "HealthStore",
    trader: "Nutrition Pro",
    points: 24,
  },
  {
    id: 14,
    name: "Backpack Travel",
    price: 1899,
    originalPrice: 2599,
    discount: 27,
    rating: 4.4,
    reviews: 167,
    image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Backpack",
    category: "Travel",
    description: "Durable travel backpack with multiple compartments",
    inStock: true,
    views: 189,
    shop: "TravelGear",
    trader: "Travel Pro",
    points: 18,
  },
  {
    id: 15,
    name: "Smart Phone Case",
    price: 599,
    originalPrice: 899,
    discount: 33,
    rating: 4.1,
    reviews: 89,
    image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Phone+Case",
    category: "Electronics",
    description: "Protective smartphone case with wireless charging",
    inStock: true,
    views: 56,
    shop: "MobileHub",
    trader: "Mobile Pro",
    points: 5,
  },
  {
    id: 16,
    name: "Kitchen Knife Set",
    price: 2999,
    originalPrice: 3999,
    discount: 25,
    rating: 4.7,
    reviews: 178,
    image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Knives",
    category: "Home",
    description: "Professional kitchen knife set with storage block",
    inStock: true,
    views: 234,
    shop: "KitchenPro",
    trader: "Chef Pro",
    points: 29,
  },
  {
    id: 17,
    name: "Wireless Earbuds",
    price: 1999,
    originalPrice: 2799,
    discount: 29,
    rating: 4.3,
    reviews: 145,
    image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Earbuds",
    category: "Electronics",
    description: "True wireless earbuds with charging case",
    inStock: true,
    views: 167,
    shop: "AudioZone",
    trader: "Audio Expert",
    points: 19,
  },
  {
    id: 18,
    name: "Face Cream Anti-Aging",
    price: 1599,
    originalPrice: 2299,
    discount: 30,
    rating: 4.4,
    reviews: 234,
    image: "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Face+Cream",
    category: "Beauty",
    description: "Premium anti-aging face cream with natural ingredients",
    inStock: true,
    views: 198,
    shop: "BeautyWorld",
    trader: "Beauty Expert",
    points: 15,
  },
  {
    id: 19,
    name: "Gaming Chair",
    price: 8999,
    originalPrice: 11999,
    discount: 25,
    rating: 4.6,
    reviews: 156,
    image:
      "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Gaming+Chair",
    category: "Furniture",
    description: "Ergonomic gaming chair with lumbar support",
    inStock: true,
    views: 289,
    shop: "GameStation",
    trader: "Gaming Pro",
    points: 89,
  },
  {
    id: 20,
    name: "Water Bottle Steel",
    price: 899,
    originalPrice: 1299,
    discount: 31,
    rating: 4.2,
    reviews: 123,
    image:
      "https://via.placeholder.com/300x300/1a75ff/ffffff?text=Water+Bottle",
    category: "Sports",
    description: "Insulated stainless steel water bottle",
    inStock: true,
    views: 87,
    shop: "SportZone",
    trader: "Sports Pro",
    points: 8,
  },
];

const categories = [
  { id: 1, name: "Electronics", count: 7 },
  { id: 2, name: "Fashion", count: 1 },
  { id: 3, name: "Beauty", count: 2 },
  { id: 4, name: "Sports", count: 3 },
  { id: 5, name: "Home", count: 3 },
  { id: 6, name: "Health", count: 1 },
  { id: 7, name: "Travel", count: 1 },
  { id: 8, name: "Furniture", count: 1 },
];

// Products endpoints (order matters - specific routes before parameterized ones)
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

// VistaarTrade-inspired API endpoints

// Authentication endpoints
app.post("/api/auth/register", (req, res) => {
  res.json({
    message: "User registration endpoint",
    endpoint: "POST /api/auth/register",
    status: "ready for implementation",
    features: [
      "Customer registration",
      "Trader registration with approval",
      "Email verification",
    ],
  });
});

app.post("/api/auth/login", (req, res) => {
  res.json({
    message: "User login endpoint",
    endpoint: "POST /api/auth/login",
    status: "ready for implementation",
    features: ["JWT authentication", "Role-based access", "Remember me"],
  });
});

// Trader endpoints
app.post("/api/traders/register", (req, res) => {
  res.json({
    message: "Trader registration endpoint",
    endpoint: "POST /api/traders/register",
    status: "ready for implementation",
    features: ["Pending admin approval", "Business details", "Document upload"],
  });
});

app.get("/api/traders/dashboard", (req, res) => {
  const { Trader, Shop, OrderItem, Order, User } = require("./models");
  const { Op } = require("sequelize");
  app.get("/api/traders/dashboard", async (req, res) => {
    try {
      // Assume trader is authenticated and req.user.id is trader's userId
      const userId = req.user?.id;
      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      const trader = await Trader.findOne({ where: { userId } });
      if (!trader)
        return res
          .status(404)
          .json({ success: false, message: "Trader not found" });

      // Get shops owned by trader
      const shops = await Shop.findAll({ where: { traderId: trader.id } });

      // Get all order items for trader
      const orderItems = await OrderItem.findAll({
        where: { traderId: trader.id },
        include: [Order],
      });
      const totalOrders = orderItems.length;
      const totalSpent = orderItems.reduce(
        (sum, item) => sum + parseFloat(item.totalPrice),
        0
      );

      // Recent orders (last 5)
      const recentOrders = orderItems.slice(0, 5).map((item) => ({
        id: item.orderId,
        customer: item.order?.customerId,
        amount: item.totalPrice,
        status: item.status,
      }));

      // Referrals and rating (dummy for now, can be implemented later)
      const referrals = trader.referrals || 0;
      const rating = trader.rating || 4.5;

      // Violations (dummy for now)
      const violations = trader.violations || 0;

      // Total revenue
      const totalRevenue = totalSpent;

      res.json({
        message: "Trader dashboard data",
        endpoint: "GET /api/traders/dashboard",
        data: {
          shops,
          recentOrders,
          violations,
          totalOrders,
          totalSpent,
          referrals,
          rating,
          totalRevenue,
        },
      });
    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
          message: "Error fetching dashboard",
          error: err.message,
        });
    }
  });
});

app.put("/api/traders/products/:id", (req, res) => {
  const { id } = req.params;
  res.json({
    message: "Toggle product status",
    endpoint: `PUT /api/traders/products/${id}`,
    action: req.body.action || "toggle",
    productId: id,
  });
});

// Product endpoints - handled by /api/products routes

// Cart endpoints
app.post("/api/cart/convert", (req, res) => {
  res.json({
    message: "Convert guest cart to user cart",
    endpoint: "POST /api/cart/convert",
    status: "ready for implementation",
    features: ["Merge session cart", "Preserve pricing", "Update inventory"],
  });
});

// Checkout endpoints
app.post("/api/checkout", (req, res) => {
  res.json({
    message: "Process checkout",
    endpoint: "POST /api/checkout",
    mockData: {
      orderId: "ORD" + Date.now(),
      total: req.body.total || 4298,
      pointsEarned: Math.floor((req.body.total || 4298) / 100),
      paymentUrl: "https://sandbox.paypal.com/checkout",
      traderInvoices: [
        { trader: "Tech Trader", amount: 2999, items: 1 },
        { trader: "Style Trader", amount: 1299, items: 1 },
      ],
    },
  });
});

// Payment endpoints
app.post("/api/payments/create", (req, res) => {
  res.json({
    message: "Create PayPal payment",
    endpoint: "POST /api/payments/create",
    mockPaymentId: "PAY" + Date.now(),
    approvalUrl: "https://sandbox.paypal.com/approve",
  });
});

app.post("/api/payments/execute", (req, res) => {
  res.json({
    message: "Execute PayPal payment",
    endpoint: "POST /api/payments/execute",
    status: "success",
    transactionId: "TXN" + Date.now(),
  });
});

// Admin endpoints
app.get("/api/admin/sales-report", (req, res) => {
  res.json({
    message: "Sales analytics report",
    endpoint: "GET /api/admin/sales-report",
    mockData: {
      totalSales: 125000,
      totalOrders: 48,
      activeTraders: 5,
      topProducts: [
        { name: "Premium Headphones", sales: 25000 },
        { name: "Designer T-Shirt", sales: 18000 },
      ],
      revenueByMonth: [
        { month: "Jan", revenue: 45000 },
        { month: "Feb", revenue: 52000 },
        { month: "Mar", revenue: 28000 },
      ],
    },
  });
});

app.put("/api/admin/traders/:id", (req, res) => {
  const { id } = req.params;
  res.json({
    message: "Manage trader account",
    endpoint: `PUT /api/admin/traders/${id}`,
    action: req.body.action || "toggle_status",
    traderId: id,
  });
});

app.get("/api/admin/violations", (req, res) => {
  res.json({
    message: "Violation management",
    endpoint: "GET /api/admin/violations",
    mockData: {
      violations: [
        {
          id: 1,
          trader: "Fashion Trader",
          product: "Fake Designer Bag",
          type: "counterfeit",
          date: "2025-01-15",
          status: "pending",
        },
      ],
    },
  });
});

// Test authentication route
app.post("/api/auth/test", (req, res) => {
  res.json({
    message: "Authentication endpoint working",
    body: req.body,
  });
});

// Basic routes structure
app.use("/api/auth", (req, res, next) => {
  console.log("Auth route accessed:", req.method, req.path);
  next();
});

// Basic auth routes (placeholder)
app.post("/api/auth/register", (req, res) => {
  res.json({ message: "Registration endpoint - ready for implementation" });
});

app.post("/api/auth/login", (req, res) => {
  res.json({ message: "Login endpoint - ready for implementation" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
  });
});

module.exports = app;
