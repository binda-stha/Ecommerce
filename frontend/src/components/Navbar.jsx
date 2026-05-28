import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  ShoppingCart,
  User,
  LogOut,
  Menu,
  Search,
  Heart,
  Store,
  Sparkles,
  Bell,
} from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartCount = getCartCount();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-18">
          {/* Enhanced Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 text-2xl font-bold text-primary-600 hover:text-primary-700 transition-all duration-300 group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="bg-gradient-to-r from-primary-600 to-blue-600 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              Binda Ecommerce
            </span>
          </Link>

          {/* Enhanced Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search products, brands and more..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="bg-primary-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  Search
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/products"
              className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-all duration-300 rounded-lg hover:bg-primary-50"
            >
              Products
            </Link>

            {/* Enhanced Cart */}
            <Link
              to="/cart"
              className="relative p-3 text-gray-700 hover:text-primary-600 flex items-center transition-all duration-300 rounded-xl hover:bg-primary-50 group"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse shadow-lg">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Enhanced Wishlist */}
            <button className="p-3 text-gray-700 hover:text-primary-600 transition-all duration-300 rounded-xl hover:bg-primary-50 relative group">
              <Heart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                3
              </span>
            </button>

            {/* Notifications */}
            <button className="p-3 text-gray-700 hover:text-primary-600 transition-all duration-300 rounded-xl hover:bg-primary-50 relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 bg-blue-500 w-2 h-2 rounded-full"></span>
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 flex items-center font-medium transition-colors"
                >
                  <User size={20} className="mr-1" />
                  {user?.firstName || "Account"}
                </Link>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Hello, {user?.firstName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline flex items-center"
                  >
                    <LogOut size={16} className="mr-1" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
                <Link
                  to="/admin"
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors px-2 py-1 rounded border border-gray-300 hover:border-red-300"
                  title="Admin Portal"
                >
                  Admin
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-primary-color"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50">
              <Link
                to="/products"
                className="block px-3 py-2 text-gray-700 hover:text-primary-color"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/cart"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-color"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Cart
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-color"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="px-3 py-2">
                    <p className="text-sm text-gray-600 mb-2">
                      Hello, {user?.firstName}
                    </p>
                    <button
                      onClick={handleLogout}
                      className="btn btn-outline w-full"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-color"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-color"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
