const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Enhanced product data inspired by VistaarTrade structure
const products = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    description:
      "High-quality wireless headphones with noise cancellation technology for professional use",
    price: 299.99,
    originalPrice: 499.99,
    category: "Consumer Electronics",
    subCategory: "Audio Equipment",
    image: "https://via.placeholder.com/300x300/3B82F6/white?text=Headphones",
    rating: 4.5,
    reviews: 128,
    inStock: true,
    stockQuantity: 45,
    discount: 40,
    shop: "TechHub Electronics",
    trader: "Electronics Pro",
    traderId: "TR001",
    points: 30,
    moq: 1, // Minimum Order Quantity
    unit: "PCS",
    specifications: {
      brand: "AudioTech",
      warranty: "2 years",
      features: ["Noise Cancellation", "Bluetooth 5.0", "30hr Battery"],
    },
    tags: ["wireless", "headphones", "noise-cancelling", "premium"],
    featured: true,
    dateAdded: "2024-01-15",
  },
  {
    id: "2",
    name: "Professional Smartphone Case",
    description:
      "Durable smartphone case with premium finish and drop protection",
    price: 59.99,
    originalPrice: 99.99,
    category: "Mobile Accessories",
    subCategory: "Phone Cases",
    image: "https://via.placeholder.com/300x300/10B981/white?text=Case",
    rating: 4.2,
    reviews: 85,
    inStock: true,
    stockQuantity: 120,
    discount: 40,
    shop: "Mobile World",
    trader: "Accessory King",
    traderId: "TR002",
    points: 6,
    moq: 5,
    unit: "PCS",
    specifications: {
      brand: "ProtectCase",
      material: "Premium TPU",
      compatibility: "Universal",
    },
    tags: ["smartphone", "case", "protection", "durable"],
    featured: false,
    dateAdded: "2024-01-20",
  },
  {
    id: "3",
    name: "Bluetooth Speaker Pro",
    description:
      "Portable Bluetooth speaker with excellent sound quality and waterproof design",
    price: 149.99,
    originalPrice: 249.99,
    category: "Consumer Electronics",
    subCategory: "Audio Equipment",
    image: "https://via.placeholder.com/300x300/F59E0B/white?text=Speaker",
    rating: 4.7,
    reviews: 203,
    inStock: true,
    stockQuantity: 32,
    discount: 40,
    shop: "Audio Plus Store",
    trader: "Sound Master",
    traderId: "TR003",
    points: 15,
    moq: 2,
    unit: "PCS",
    specifications: {
      brand: "SoundWave",
      power: "20W",
      battery: "12 hours",
      waterproof: "IPX7",
    },
    tags: ["bluetooth", "speaker", "portable", "waterproof"],
    featured: true,
    dateAdded: "2024-01-25",
  },
  {
    id: "4",
    name: "Gaming Laptop Pro",
    description:
      "High-performance gaming laptop with dedicated graphics card and RGB keyboard",
    price: 1299.99,
    originalPrice: 1799.99,
    category: "Computer & IT",
    subCategory: "Laptops",
    image: "https://via.placeholder.com/300x300/DC2626/white?text=Laptop",
    rating: 4.8,
    reviews: 95,
    inStock: true,
    stockQuantity: 8,
    discount: 28,
    shop: "Gaming Central",
    trader: "PC Master",
    traderId: "TR004",
    points: 130,
    moq: 1,
    unit: "PCS",
    specifications: {
      brand: "GameTech",
      processor: "Intel i7",
      graphics: "RTX 4060",
      ram: "16GB",
      storage: "512GB SSD",
    },
    tags: ["gaming", "laptop", "high-performance", "rgb"],
    featured: true,
    dateAdded: "2024-02-01",
  },
  {
    id: "5",
    name: "Ergonomic Wireless Mouse",
    description:
      "Professional wireless mouse with precision tracking and ergonomic design",
    price: 49.99,
    originalPrice: 79.99,
    category: "Computer & IT",
    subCategory: "Input Devices",
    image: "https://via.placeholder.com/300x300/7C3AED/white?text=Mouse",
    rating: 4.3,
    reviews: 67,
    inStock: true,
    stockQuantity: 95,
    discount: 37,
    shop: "PC World",
    trader: "Accessory King",
    traderId: "TR002",
    points: 5,
    moq: 10,
    unit: "PCS",
    specifications: {
      brand: "PrecisionTech",
      dpi: "3200 DPI",
      battery: "6 months",
      connectivity: "2.4GHz Wireless",
    },
    tags: ["wireless", "mouse", "ergonomic", "precision"],
    featured: false,
    dateAdded: "2024-02-05",
  },
  {
    id: "6",
    name: "Smart Fitness Watch",
    description:
      "Advanced smartwatch with health monitoring and fitness tracking features",
    price: 199.99,
    originalPrice: 299.99,
    category: "Wearable Tech",
    subCategory: "Smartwatches",
    image: "https://via.placeholder.com/300x300/059669/white?text=Watch",
    rating: 4.4,
    reviews: 142,
    inStock: true,
    stockQuantity: 65,
    discount: 33,
    shop: "Wearable Tech Store",
    trader: "Tech Guru",
    traderId: "TR005",
    points: 20,
    moq: 3,
    unit: "PCS",
    specifications: {
      brand: "FitTech",
      display: "1.4 inch AMOLED",
      battery: "7 days",
      waterproof: "5ATM",
    },
    tags: ["smartwatch", "fitness", "health", "waterproof"],
    featured: true,
    dateAdded: "2024-02-10",
  },
  {
    id: "7",
    name: "USB-C Multi Hub",
    description:
      "Professional USB-C hub with 4K HDMI output and multiple ports",
    price: 79.99,
    originalPrice: 119.99,
    category: "Computer & IT",
    subCategory: "Accessories",
    image: "https://via.placeholder.com/300x300/1F2937/white?text=Hub",
    rating: 4.1,
    reviews: 34,
    inStock: true,
    stockQuantity: 78,
    discount: 33,
    shop: "Tech Accessories Pro",
    trader: "Port Master",
    traderId: "TR006",
    points: 8,
    moq: 5,
    unit: "PCS",
    specifications: {
      brand: "ConnectPro",
      ports: "7-in-1",
      video: "4K@60Hz",
      power: "100W PD",
    },
    tags: ["usb-c", "hub", "4k", "multiport"],
    featured: false,
    dateAdded: "2024-02-15",
  },
  {
    id: "8",
    name: "Mechanical Gaming Keyboard",
    description:
      "RGB mechanical keyboard with custom switches and programmable keys",
    price: 159.99,
    originalPrice: 229.99,
    category: "Computer & IT",
    subCategory: "Input Devices",
    image: "https://via.placeholder.com/300x300/8B5CF6/white?text=Keyboard",
    rating: 4.6,
    reviews: 88,
    inStock: true,
    stockQuantity: 42,
    discount: 30,
    shop: "Gaming Central",
    trader: "Key Master",
    traderId: "TR007",
    points: 16,
    moq: 2,
    unit: "PCS",
    specifications: {
      brand: "MechPro",
      switches: "Cherry MX Blue",
      lighting: "RGB Backlit",
      layout: "Full Size",
    },
    tags: ["mechanical", "keyboard", "gaming", "rgb"],
    featured: true,
    dateAdded: "2024-02-20",
  },
  {
    id: "9",
    name: "4K Webcam Professional",
    description:
      "Ultra HD webcam with auto-focus and noise reduction for streaming",
    price: 129.99,
    originalPrice: 189.99,
    category: "Computer & IT",
    subCategory: "Video Equipment",
    image: "https://via.placeholder.com/300x300/EC4899/white?text=Webcam",
    rating: 4.5,
    reviews: 56,
    inStock: true,
    stockQuantity: 28,
    discount: 32,
    shop: "Video Pro Store",
    trader: "Stream King",
    traderId: "TR008",
    points: 13,
    moq: 1,
    unit: "PCS",
    specifications: {
      brand: "StreamTech",
      resolution: "4K@30fps",
      focus: "Auto-focus",
      microphone: "Dual stereo",
    },
    tags: ["4k", "webcam", "streaming", "professional"],
    featured: false,
    dateAdded: "2024-02-25",
  },
  {
    id: "10",
    name: "Fast Charging Power Bank",
    description:
      "20,000mAh power bank with fast charging and multiple device support",
    price: 39.99,
    originalPrice: 59.99,
    category: "Mobile Accessories",
    subCategory: "Power Banks",
    image: "https://via.placeholder.com/300x300/F97316/white?text=PowerBank",
    rating: 4.2,
    reviews: 178,
    inStock: true,
    stockQuantity: 156,
    discount: 33,
    shop: "Mobile World",
    trader: "Power Expert",
    traderId: "TR009",
    points: 4,
    moq: 10,
    unit: "PCS",
    specifications: {
      brand: "PowerTech",
      capacity: "20,000mAh",
      charging: "22.5W Fast Charge",
      ports: "USB-A, USB-C",
    },
    tags: ["power-bank", "fast-charging", "portable", "20000mah"],
    featured: false,
    dateAdded: "2024-03-01",
  },
  {
    id: "11",
    name: "Professional LED Monitor",
    description:
      "27-inch 4K LED monitor with color accuracy for professional work",
    price: 399.99,
    originalPrice: 599.99,
    category: "Computer & IT",
    subCategory: "Monitors",
    image: "https://via.placeholder.com/300x300/3B82F6/white?text=Monitor",
    rating: 4.7,
    reviews: 89,
    inStock: true,
    stockQuantity: 15,
    discount: 33,
    shop: "Display Pro",
    trader: "Screen Master",
    traderId: "TR010",
    points: 40,
    moq: 1,
    unit: "PCS",
    specifications: {
      brand: "VisualPro",
      size: "27 inch",
      resolution: "4K UHD",
      panel: "IPS",
      colorSpace: "99% sRGB",
    },
    tags: ["monitor", "4k", "professional", "ips"],
    featured: true,
    dateAdded: "2024-03-05",
  },
  {
    id: "12",
    name: "Wireless Charging Pad",
    description:
      "Fast wireless charging pad compatible with all Qi-enabled devices",
    price: 29.99,
    originalPrice: 49.99,
    category: "Mobile Accessories",
    subCategory: "Chargers",
    image: "https://via.placeholder.com/300x300/10B981/white?text=Charger",
    rating: 4.0,
    reviews: 124,
    inStock: true,
    stockQuantity: 89,
    discount: 40,
    shop: "Tech Accessories Pro",
    trader: "Charge Master",
    traderId: "TR011",
    points: 3,
    moq: 15,
    unit: "PCS",
    specifications: {
      brand: "WirelessTech",
      power: "15W Fast Charge",
      compatibility: "Qi-enabled devices",
      design: "Slim & Portable",
    },
    tags: ["wireless", "charging", "qi", "fast-charge"],
    featured: false,
    dateAdded: "2024-03-10",
  },
];

// Enhanced Categories inspired by VistaarTrade
const categories = [
  { id: "1", name: "Consumer Electronics", count: 4, icon: "📱" },
  { id: "2", name: "Computer & IT", count: 6, icon: "💻" },
  { id: "3", name: "Mobile Accessories", count: 3, icon: "📱" },
  { id: "4", name: "Wearable Tech", count: 1, icon: "⌚" },
  { id: "5", name: "Audio Equipment", count: 2, icon: "🎧" },
  { id: "6", name: "Gaming", count: 2, icon: "🎮" },
];

// Enhanced Traders/Suppliers
const traders = [
  {
    id: "TR001",
    name: "Electronics Pro",
    company: "TechHub Electronics",
    location: "Kathmandu, Nepal",
    rating: 4.8,
    totalProducts: 25,
    yearsInBusiness: 5,
    verified: true,
    specialties: ["Consumer Electronics", "Audio Equipment"],
  },
  {
    id: "TR002",
    name: "Accessory King",
    company: "Mobile World & PC World",
    location: "Pokhara, Nepal",
    rating: 4.6,
    totalProducts: 45,
    yearsInBusiness: 3,
    verified: true,
    specialties: ["Mobile Accessories", "Computer Accessories"],
  },
  {
    id: "TR003",
    name: "Sound Master",
    company: "Audio Plus Store",
    location: "Biratnagar, Nepal",
    rating: 4.9,
    totalProducts: 18,
    yearsInBusiness: 7,
    verified: true,
    specialties: ["Audio Equipment", "Professional Sound"],
  },
];

// Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Binda Trade E-commerce API",
    timestamp: new Date().toISOString(),
    environment: "development",
    version: "2.0.0",
    totalProducts: products.length,
    totalCategories: categories.length,
  });
});

app.get("/api/products", (req, res) => {
  console.log(
    "� Enhanced Binda Trade Server starting with VistaarTrade-inspired features..."
  );

  // Query parameters for filtering
  const { category, featured, search, limit, offset } = req.query;

  let filteredProducts = [...products];

  // Filter by category
  if (category && category !== "all") {
    filteredProducts = filteredProducts.filter((p) =>
      p.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  // Filter by featured
  if (featured === "true") {
    filteredProducts = filteredProducts.filter((p) => p.featured);
  }

  // Search functionality
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  }

  // Pagination
  const startIndex = parseInt(offset) || 0;
  const limitNum = parseInt(limit) || filteredProducts.length;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + limitNum
  );

  res.json({
    success: true,
    data: paginatedProducts,
    total: filteredProducts.length,
    page: Math.floor(startIndex / limitNum) + 1,
    limit: limitNum,
    hasMore: startIndex + limitNum < filteredProducts.length,
  });
});

app.get("/api/products/:id", (req, res) => {
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
});

app.get("/api/categories", (req, res) => {
  res.json({
    success: true,
    data: categories,
  });
});

app.get("/api/traders", (req, res) => {
  res.json({
    success: true,
    data: traders,
  });
});

app.get("/api/featured-products", (req, res) => {
  const featuredProducts = products.filter((p) => p.featured);
  res.json({
    success: true,
    data: featuredProducts,
  });
});

// Enhanced search endpoint
app.get("/api/search", (req, res) => {
  const { q, category, minPrice, maxPrice, rating } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: "Search query is required",
    });
  }

  let results = products.filter((product) => {
    const searchMatch =
      product.name.toLowerCase().includes(q.toLowerCase()) ||
      product.description.toLowerCase().includes(q.toLowerCase()) ||
      product.tags.some((tag) => tag.toLowerCase().includes(q.toLowerCase()));

    const categoryMatch =
      !category ||
      category === "all" ||
      product.category.toLowerCase().includes(category.toLowerCase());

    const priceMatch =
      (!minPrice || product.price >= parseFloat(minPrice)) &&
      (!maxPrice || product.price <= parseFloat(maxPrice));

    const ratingMatch = !rating || product.rating >= parseFloat(rating);

    return searchMatch && categoryMatch && priceMatch && ratingMatch;
  });

  res.json({
    success: true,
    data: results,
    total: results.length,
    query: q,
  });
});

// Dummy /api/orders endpoint for order placement (COD/PayPal)
// Use real order controller and route
const orderRoutes = require("./routes/order");
app.use("/api/orders", orderRoutes);

// Start server
app.listen(PORT, () => {
  console.log(
    `🚀 Enhanced Binda Trade API Server running on http://localhost:${PORT}`
  );
  console.log(`📊 API Health check: http://localhost:${PORT}/api/health`);
  console.log(`🛒 Products API: http://localhost:${PORT}/api/products`);
  console.log(`🏪 Categories API: http://localhost:${PORT}/api/categories`);
  console.log(`👥 Traders API: http://localhost:${PORT}/api/traders`);
  console.log(
    `⭐ Featured Products: http://localhost:${PORT}/api/featured-products`
  );
  console.log(`🔍 Search API: http://localhost:${PORT}/api/search?q=laptop`);
});
