import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion"; // Temporarily disabled - need to install
import {
  Search,
  Filter,
  Star,
  TrendingUp,
  Users,
  ShoppingBag,
  Award,
  Shield,
  Zap,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import PointsDisplay from "../components/PointsDisplay";

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data.mockData?.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    console.log("Adding to cart:", product);
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleViewDetails = (product) => {
    console.log("Viewing product:", product);
  };

  const stats = [
    { label: "Active Traders", value: "2,500+", icon: Users },
    { label: "Products Listed", value: "50,000+", icon: ShoppingBag },
    { label: "Customer Rating", value: "4.8/5", icon: Star },
    { label: "Orders Processed", value: "1M+", icon: TrendingUp },
  ];

  const features = [
    {
      icon: Shield,
      title: "Secure Payments",
      description: "PayPal integration with buyer protection",
    },
    {
      icon: Award,
      title: "Loyalty Points",
      description: "Earn 1 point for every ₹100 spent",
    },
    {
      icon: Zap,
      title: "Fast Delivery",
      description: "Quick shipping from multiple vendors",
    },
    {
      icon: Users,
      title: "Multi-Vendor",
      description: "Shop from thousands of trusted traders",
    },
  ];

  const HeroSection = () => (
    <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white rounded-full"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-left">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Discover Amazing Products from
              <span className="block text-yellow-300">Trusted Traders</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of customers shopping from verified multi-vendor
              marketplace with secure payments and loyalty rewards.
            </p>

            {isAuthenticated ? (
              <div className="bg-white bg-opacity-20 rounded-2xl p-6 mb-8">
                <h3 className="text-2xl font-bold mb-2">
                  Welcome back, {user?.firstName}!
                </h3>
                <p className="text-blue-100 mb-4">
                  Ready to continue shopping?
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-white text-primary-600 px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:scale-105 transition-transform">
                    <ShoppingBag className="w-5 h-5" />
                    <span>Browse Products</span>
                  </button>
                  <button className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300 hover:scale-105">
                    Go to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="bg-white text-primary-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105">
                  <ShoppingBag className="w-5 h-5" />
                  <span>Start Shopping</span>
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105">
                  <Users className="w-5 h-5" />
                  <span>Become a Trader</span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="text-2xl lg:text-3xl font-bold text-yellow-300">
                    {stat.value}
                  </div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-in-right">
            <div className="glassmorphism rounded-3xl p-8 backdrop-blur-lg">
              <h3 className="text-2xl font-bold mb-6">Featured Today</h3>
              <div className="space-y-4">
                {products.slice(0, 2).map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 bg-white bg-opacity-20 rounded-2xl p-4 animate-fade-in-up hover:bg-opacity-30 transition-all duration-300"
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    <img
                      src={product.image || "/api/placeholder/60x60"}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-blue-200">
                        ₹{product.price?.toLocaleString()}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Products Section */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Discover amazing products from our trusted traders
            </p>
          </div>

          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-96 shimmer"
                ></div>
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product, index) => (
                <ProductCard
                  key={index}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Experience the future of multi-vendor e-commerce
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 text-center animate-fade-in-up hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-2xl mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loyalty Points Section for logged in users */}
      {isAuthenticated && (
        <section className="py-12 lg:py-20 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900 dark:to-purple-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-fade-in-up">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Your Loyalty Rewards
              </h2>
              <PointsDisplay
                currentPoints={247}
                pointsEarned={25}
                showAnimation={true}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
