import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Star,
  ShoppingCart,
  Heart,
  Eye,
  TrendingUp,
  Shield,
  Truck,
  CreditCard,
  ChevronRight,
  Timer,
  Percent,
  Sparkles,
  ArrowRight,
  Zap,
  Award,
  Users,
  Package,
  Target,
  Globe,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { categories, featuredDeals } from "../data/mockData";
import ApiService from "../services/api";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch featured products (first 4)
        const featuredResponse = await ApiService.fetchProductsWithFallback({
          limit: 4,
          sortBy: "rating",
          sortOrder: "desc",
        });

        if (featuredResponse.success) {
          setFeaturedProducts(featuredResponse.data.products);
        }

        // Fetch best sellers (next 4, sorted by views/popularity)
        const bestSellersResponse = await ApiService.fetchProductsWithFallback({
          page: 2,
          limit: 4,
          sortBy: "views",
          sortOrder: "desc",
        });

        if (bestSellersResponse.success) {
          setBestSellers(bestSellersResponse.data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        // Fallback already handled in ApiService
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    console.log("🛒 Adding to cart:", product);
    addToCart(product);
    // You can add a toast notification here
    alert(`✅ Added ${product.name} to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Categories */}
      <CategoriesSection />

      {/* Featured Deals */}
      <FeaturedDealsSection />

      {/* Featured Products */}
      <ProductSection
        title="Featured Products"
        subtitle="Handpicked products just for you"
        products={featuredProducts}
        onAddToCart={handleAddToCart}
      />

      {/* Best Sellers */}
      <ProductSection
        title="Best Sellers"
        subtitle="Most popular products this week"
        products={bestSellers}
        onAddToCart={handleAddToCart}
      />

      {/* Features */}
      <FeaturesSection />
    </div>
  );
};

const HeroSection = () => (
  <section className="relative bg-gradient-to-br from-primary-600 via-blue-600 to-purple-700 text-white overflow-hidden">
    {/* Animated Background Elements */}
    <div className="absolute inset-0">
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-200/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-purple-200/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>

    <div className="relative z-10 container mx-auto px-4 py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            Welcome to Binda Ecommerce
          </div>

          {/* Main Heading */}
          <div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Shop Smarter,
              <span className="text-yellow-300 block animate-float">
                Save More
              </span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 leading-relaxed">
              Discover amazing products from trusted sellers with unbeatable
              prices and fast delivery across India.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/products"
              className="group bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 inline-flex items-center justify-center transform hover:scale-105 shadow-xl"
            >
              Start Shopping
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="group border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 inline-flex items-center justify-center backdrop-blur-sm"
            >
              Join Now
              <Users className="w-5 h-5 ml-2" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-blue-200 text-sm">Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-blue-200 text-sm">Traders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-blue-200 text-sm">Happy Customers</div>
            </div>
          </div>
        </div>

        {/* Hero Image/Illustration */}
        <div className="relative">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-2xl p-6 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                <Package className="w-8 h-8 mb-4 text-yellow-300" />
                <h3 className="font-semibold mb-2">Quality Products</h3>
                <p className="text-sm text-blue-100">
                  Verified sellers and quality assurance
                </p>
              </div>
              <div className="bg-white/20 rounded-2xl p-6 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                <Zap className="w-8 h-8 mb-4 text-yellow-300" />
                <h3 className="font-semibold mb-2">Fast Delivery</h3>
                <p className="text-sm text-blue-100">
                  Quick and reliable shipping
                </p>
              </div>
              <div className="bg-white/20 rounded-2xl p-6 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                <Shield className="w-8 h-8 mb-4 text-yellow-300" />
                <h3 className="font-semibold mb-2">Secure Payment</h3>
                <p className="text-sm text-blue-100">
                  Safe and encrypted transactions
                </p>
              </div>
              <div className="bg-white/20 rounded-2xl p-6 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                <Award className="w-8 h-8 mb-4 text-yellow-300" />
                <h3 className="font-semibold mb-2">Best Prices</h3>
                <p className="text-sm text-blue-100">
                  Competitive pricing guaranteed
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold mb-4">Today's Deal</h3>
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold inline-block mb-4">
              60% OFF
            </div>
            <h4 className="text-xl font-semibold mb-2">Premium Headphones</h4>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold">₹2,999</span>
              <span className="text-lg line-through text-gray-300">₹7,499</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Timer className="w-4 h-4" />
              <span className="text-sm">Deal ends in 23:45:12</span>
            </div>
            <button className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition-colors">
              Shop Deal Now
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const CategoriesSection = () => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?category=${category.name.toLowerCase()}`}
            className="group text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
              {category.icon}
            </div>
            <h3 className="font-semibold text-sm text-gray-800 mb-1">
              {category.name}
            </h3>
            <p className="text-xs text-gray-500">
              {category.count.toLocaleString()} items
            </p>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const FeaturedDealsSection = () => (
  <section className="py-16 bg-gray-100">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">Featured Deals</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {featuredDeals.map((deal) => (
          <div
            key={deal.id}
            className={`bg-gradient-to-r ${deal.color} rounded-2xl p-8 text-white relative overflow-hidden`}
          >
            <h3 className="text-2xl font-bold mb-2">{deal.title}</h3>
            <p className="text-lg mb-6 opacity-90">{deal.subtitle}</p>
            <Link
              to="/products"
              className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Shop Now
            </Link>
            <div className="absolute top-4 right-4 bg-white bg-opacity-20 rounded-full p-2">
              <Percent className="w-8 h-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ProductSection = ({ title, subtitle, products, onAddToCart }) => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 text-lg">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      <div className="text-center mt-12">
        <Link
          to="/products"
          className="inline-flex items-center bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          View All Products
          <ChevronRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </div>
  </section>
);

const ProductCard = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            {product.discount}% OFF
          </div>
        )}

        {/* Quick Actions */}
        <div
          className={`absolute top-2 right-2 flex flex-col gap-2 transition-opacity ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 rounded-full shadow-md transition-colors ${
              isLiked
                ? "bg-red-500 text-white"
                : "bg-white text-gray-600 hover:text-red-500"
            }`}
          >
            <Heart
              className="w-4 h-4"
              fill={isLiked ? "currentColor" : "none"}
            />
          </button>
          <button className="p-2 bg-white text-gray-600 rounded-full shadow-md hover:text-primary-600 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
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

        {/* Price */}
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

        {/* Add to Cart Button */}
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

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure Shopping",
      description:
        "Your data and payments are protected with bank-level security",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description:
        "Free shipping on orders above ₹499. Same day delivery available",
    },
    {
      icon: CreditCard,
      title: "Easy Returns",
      description:
        "30-day return policy. No questions asked returns and refunds",
    },
    {
      icon: TrendingUp,
      title: "Best Prices",
      description: "We guarantee the best prices with our price match policy",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose Binda Ecommerce?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full mb-4">
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Home;
