import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  ShoppingBag,
  User,
  Shield,
  Sparkles,
  UserCheck,
  Crown,
  Store,
} from "lucide-react";

const Login = () => {
  const { login, isLoading } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Get the page user was trying to access before login
  const from = location.state?.from?.pathname || "/";

  const roleOptions = [
    {
      value: "customer",
      label: "Customer",
      icon: User,
      description: "Shop and purchase products",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      value: "trader",
      label: "Trader",
      icon: Store,
      description: "Sell products and manage shops",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedRole) {
      setError("Please select your role before logging in.");
      return;
    }

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Check if the logged-in user's role matches the selected role
        if (result.data.user.role !== selectedRole) {
          setError(
            `Invalid credentials for ${selectedRole} login. Please check your role selection.`
          );
          return;
        }

        // Cart sync: if user is customer and has local cart, move to DB
        if (selectedRole === "customer") {
          const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
          if (localCart.length > 0) {
            // Send cart to backend for saving
            await fetch("/api/cart/sync", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${result.data.token}`,
              },
              body: JSON.stringify({ items: localCart }),
            });
            localStorage.removeItem("cart");
          }
        }

        // Redirect based on role
        let redirectPath = "/";
        switch (result.data.user.role) {
          case "trader":
            redirectPath = "/dashboard";
            break;
          case "customer":
            // Check if user has items in cart and redirect accordingly
            const hasCartItems = cart.items && cart.items.length > 0;

            if (hasCartItems) {
              redirectPath = "/checkout";
            } else {
              redirectPath = from === "/" ? "/products" : from;
            }
            break;
          default:
            redirectPath = "/";
        }

        navigate(redirectPath, { replace: true });
      } else {
        setError(result.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Simple background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50"></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Floating Card */}
          <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-blue-100 p-10 transform hover:scale-[1.03] transition-all duration-300">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 via-blue-300 to-purple-300 rounded-full mb-6 shadow-xl border-4 border-white">
                <img
                  src="/vite.svg"
                  alt="Binda Ecommerce"
                  className="w-12 h-12 rounded-full"
                />
              </div>
              <h1 className="text-4xl font-extrabold text-blue-700 mb-2 tracking-tight font-serif">
                Welcome Back
              </h1>
              <p className="text-gray-700 leading-relaxed text-lg font-medium">
                Sign in to your{" "}
                <span className="text-blue-600 font-bold">Binda Ecommerce</span>{" "}
                account and continue your shopping journey
              </p>
              <div className="flex justify-center mt-4 space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-1000"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse animation-delay-2000"></div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Login As
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {roleOptions.map((role) => {
                  const IconComponent = role.icon;
                  const isSelected = selectedRole === role.value;

                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleRoleSelect(role.value)}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all duration-300 text-left
                        ${
                          isSelected
                            ? `${role.color} border-transparent text-white shadow-lg scale-[1.02]`
                            : `${role.bgColor} ${role.textColor} border-gray-200 hover:border-gray-300 hover:shadow-md`
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`
                          p-2 rounded-lg 
                          ${isSelected ? "bg-white/20" : "bg-white"}
                        `}
                        >
                          <IconComponent
                            className={`w-5 h-5 ${
                              isSelected ? "text-white" : role.textColor
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {role.label}
                          </div>
                          <div
                            className={`text-xs ${
                              isSelected ? "text-white/80" : "text-gray-500"
                            }`}
                          >
                            {role.description}
                          </div>
                        </div>
                        {isSelected && (
                          <UserCheck className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alert Messages */}
            {location.state?.message && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <p className="text-blue-800 text-sm font-medium">
                    {location.state.message}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl backdrop-blur-sm">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email Field */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 border-2 border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 bg-blue-50/50 hover:bg-white focus:bg-white font-medium text-lg"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-4 border-2 border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 bg-blue-50/50 hover:bg-white focus:bg-white font-medium text-lg"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Removed Remember Me & Forgot Password for simplicity */}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-4 px-4 rounded-2xl font-bold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <Link
                to="/register"
                className="inline-block py-2 px-6 rounded-xl bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-colors"
              >
                Create New Account
              </Link>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
