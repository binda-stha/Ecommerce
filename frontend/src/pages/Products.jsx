import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  Star,
  Heart,
  ShoppingCart,
  TrendingUp,
  Package,
  Zap,
  Sparkles,
  ArrowRight,
  Download,
  FileText,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { categories } from "../data/mockData";
import ApiService from "../services/api";

const Products = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    // Fetch products from API
    fetchProducts();
  }, [
    searchTerm,
    selectedCategory,
    sortBy,
    priceRange,
    pagination.currentPage,
  ]);

  const loadMockData = async () => {
    setLoading(true);
    try {
      console.log("🧪 Loading mock data directly...");
      const { mockProducts } = await import("../data/mockData.js");
      console.log("📦 Mock products loaded:", mockProducts.length, "items");

      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setPagination({
        currentPage: 1,
        totalPages: Math.ceil(mockProducts.length / 12),
        totalProducts: mockProducts.length,
        hasNext: mockProducts.length > 12,
        hasPrev: false,
      });
    } catch (error) {
      console.error("❌ Error loading mock data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching products with filters:", {
        search: searchTerm,
        category: selectedCategory,
        sortBy,
        priceRange,
        page: pagination.currentPage,
      });

      const filters = {
        search: searchTerm || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        sortBy: getSortByValue(sortBy),
        sortOrder: getSortOrder(sortBy),
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 10000 ? priceRange[1] : undefined,
        page: pagination.currentPage,
        limit: 12,
      };

      const response = await ApiService.fetchProductsWithFallback(filters);

      console.log("📦 Products response:", response);

      if (response.success) {
        console.log(
          "✅ Products fetched successfully:",
          response.data.products.length,
          "products"
        );
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
        setPagination(response.data.pagination);
      } else {
        console.error("❌ Products response failed:", response);
      }
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSortByValue = (sortBy) => {
    switch (sortBy) {
      case "price-low":
      case "price-high":
        return "price";
      case "rating":
        return "rating";
      case "newest":
        return "createdAt";
      default:
        return "name";
    }
  };

  const getSortOrder = (sortBy) => {
    switch (sortBy) {
      case "price-high":
      case "rating":
        return "desc";
      case "price-low":
        return "asc";
      case "newest":
        return "desc";
      default:
        return "asc";
    }
  };

  // Remove the old filterProducts function since we're fetching from API

  const handleAddToCart = (product) => {
    console.log("🛒 Adding to cart:", product);
    addToCart(product);
    alert(`✅ Added ${product.name} to cart!`);
  };

  const exportToCSV = () => {
    const csvHeaders = [
      "Product Name",
      "Category",
      "Price (₹)",
      "Original Price (₹)",
      "Rating",
      "Reviews",
      "Trader",
      "Stock Status",
      "Discount (%)",
    ];

    const csvData = filteredProducts.map((product) => [
      `"${product.name}"`,
      `"${product.category}"`,
      product.price,
      product.originalPrice || "",
      product.rating,
      product.reviews,
      `"${product.trader}"`,
      product.inStock ? "In Stock" : "Out of Stock",
      product.discount || "",
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `products_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm">
              <Package className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Amazing Products
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Explore thousands of quality products from verified traders across
              India
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 mr-2" />
                  <span className="text-2xl font-bold">{products.length}+</span>
                </div>
                <p className="text-blue-100">Products Available</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 mr-2" />
                  <span className="text-2xl font-bold">500+</span>
                </div>
                <p className="text-blue-100">Trusted Traders</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 mr-2" />
                  <span className="text-2xl font-bold">24h</span>
                </div>
                <p className="text-blue-100">Fast Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 mb-8 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Search Section */}
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search for products, brands, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <SlidersHorizontal className="w-5 h-5 mr-2" />
                Filters
              </button>

              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-primary-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-primary-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">
                {filteredProducts.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {products.length}
              </span>{" "}
              products found
            </p>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div
            className={`bg-white rounded-lg shadow-sm p-6 h-fit ${
              showFilters ? "block" : "hidden"
            } lg:block w-full lg:w-80`}
          >
            <h3 className="text-lg font-semibold mb-4">Filters</h3>

            {/* Category Filter */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Category</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value="all"
                    checked={selectedCategory === "all"}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mr-2"
                  />
                  All Categories
                </label>
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category.name}
                      checked={selectedCategory === category.name}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="mr-2"
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Price Range</h4>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([
                        parseInt(e.target.value) || 0,
                        priceRange[1],
                      ])
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([
                        priceRange[0],
                        parseInt(e.target.value) || 10000,
                      ])
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Sort By */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Sort By</h4>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {filteredProducts.map((product) =>
                  viewMode === "grid" ? (
                    <ProductGridCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ) : (
                    <ProductListCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductGridCard = ({ product, onAddToCart }) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden group">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {product.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            {product.discount}% OFF
          </div>
        )}

        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-colors ${
            isLiked
              ? "bg-red-500 text-white"
              : "bg-white text-gray-600 hover:text-red-500"
          }`}
        >
          <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
        </button>

        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= product.rating
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">({product.reviews})</span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold text-gray-900">
            ₹{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={!product.inStock}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            product.inStock
              ? "bg-primary-600 text-white hover:bg-primary-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {product.inStock ? (
            <>
              <ShoppingCart className="w-4 h-4 inline mr-2" />
              Add to Cart
            </>
          ) : (
            "Out of Stock"
          )}
        </button>
      </div>
    </div>
  );
};

const ProductListCard = ({ product, onAddToCart }) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex gap-4">
        <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.discount && (
            <div className="absolute top-1 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs font-bold">
              {product.discount}% OFF
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-lg text-gray-800 mb-2">
              {product.name}
            </h3>

            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= product.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({product.reviews} reviews)
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-2">
              Category: {product.category} | Seller: {product.trader}
            </p>

            {product.features && (
              <div className="flex flex-wrap gap-1 mb-3">
                {product.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-500 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${
                  isLiked
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:text-red-500"
                }`}
              >
                <Heart
                  className="w-4 h-4"
                  fill={isLiked ? "currentColor" : "none"}
                />
              </button>

              <button
                onClick={() => onAddToCart(product)}
                disabled={!product.inStock}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  product.inStock
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {product.inStock ? (
                  <>
                    <ShoppingCart className="w-4 h-4 inline mr-2" />
                    Add to Cart
                  </>
                ) : (
                  "Out of Stock"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
