import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ArrowLeft,
  ShoppingBag,
  UserPlus,
  Sparkles,
  Shield,
  CheckCircle,
  Users,
  Building2,
  UserCheck,
  Crown,
  Store,
  Gift,
} from "lucide-react";

const Register = () => {
  const { register, isLoading } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referralValid, setReferralValid] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    phone: "",
    address: "",
    referralCode: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Check for referral code in URL params
    const urlParams = new URLSearchParams(location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      setReferralCode(refCode);
      setFormData((prev) => ({ ...prev, referralCode: refCode }));
      validateReferralCode(refCode);
    }
  }, [location]);

  const validateReferralCode = async (code) => {
    if (!code) {
      setReferralValid(null);
      return;
    }

    try {
      // Mock validation - replace with actual API call
      const mockValidCodes = ["BP001", "BP002", "BP003"];
      const isValid = mockValidCodes.includes(code.toUpperCase());
      setReferralValid(isValid);
    } catch (error) {
      console.error("Error validating referral code:", error);
      setReferralValid(false);
    }
  };

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
    {
      value: "admin",
      label: "Admin",
      icon: Crown,
      description: "Manage platform and users",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
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
    setFormData({
      ...formData,
      role: role,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedRole) {
      setError("Please select your account type.");
      return;
    }

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // Prepare registration data with selected role
    const registrationData = {
      ...formData,
      role: selectedRole,
    };

    console.log("🚀 Registering user with data:", {
      ...registrationData,
      password: "[HIDDEN]",
      confirmPassword: "[HIDDEN]",
    });

    const result = await register(registrationData);

    if (result.success) {
      setSuccess("Registration successful! Redirecting...");

      // Redirect based on role
      let redirectPath = "/";
      switch (result.data.user.role) {
        case "admin":
          redirectPath = "/admin";
          break;
        case "trader":
          redirectPath = "/dashboard";
          break;
        case "customer":
          // Check if user has items in cart and redirect accordingly
          const hasCartItems = cart.items && cart.items.length > 0;

          if (hasCartItems) {
            redirectPath = "/checkout";
          } else {
            redirectPath = "/products";
          }
          break;
        default:
          redirectPath = "/";
      }

      setTimeout(() => navigate(redirectPath), 2000);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h2 className="text-2xl font-bold text-center mb-6">
            Create Account
          </h2>

          {error && <div className="alert alert-error">{error}</div>}

          {success && <div className="alert alert-success">{success}</div>}

          {/* Role Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Choose Account Type
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

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            {/* Referral Code Section */}
            <div className="form-group">
              <label
                htmlFor="referralCode"
                className="form-label flex items-center"
              >
                <Gift className="w-4 h-4 mr-2 text-purple-600" />
                Referral Code (Optional)
              </label>
              <input
                type="text"
                id="referralCode"
                name="referralCode"
                value={formData.referralCode}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setFormData((prev) => ({ ...prev, referralCode: value }));
                  setReferralCode(value);
                  validateReferralCode(value);
                }}
                className={`form-input ${
                  referralValid === true
                    ? "border-green-300 focus:border-green-500"
                    : referralValid === false
                    ? "border-red-300 focus:border-red-500"
                    : ""
                }`}
                placeholder="Enter referral code"
              />
              {referralValid === true && (
                <div className="mt-2 flex items-center text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Valid referral code! You'll receive bonus points.
                </div>
              )}
              {referralValid === false && (
                <div className="mt-2 text-red-600 text-sm">
                  Invalid referral code. Please check and try again.
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label">
                Address (Optional)
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
                rows="3"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="loading-spinner mr-2"></span>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-primary-color hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
