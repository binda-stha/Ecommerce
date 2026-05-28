import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  Minus,
  ShoppingCart,
  Eye,
  Package,
  CheckCircle,
  XCircle,
} from "lucide-react";

const UIDebug = () => {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount,
  } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  // Test product for adding to cart
  const testProduct = {
    id: "debug-test-1",
    name: "Debug Test Product",
    price: 99,
    image: "https://via.placeholder.com/150x150/3B82F6/white?text=Test",
    category: "Test",
    trader: "Test Trader",
    shop: "Test Shop",
    points: 5,
  };

  const addTestProduct = () => {
    addToCart(testProduct);
  };

  const removeTestProduct = () => {
    removeFromCart(testProduct.id);
  };

  const updateTestQuantity = (newQty) => {
    updateQuantity(testProduct.id, newQty);
  };

  const cartItem = cart.items.find((item) => item.id === testProduct.id);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🔧 UI Debug Panel
          </h1>
          <p className="text-gray-600">
            This panel helps debug UI elements that might not be showing
            properly.
          </p>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Current Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">
                  Cart Items
                </span>
                <span className="text-2xl font-bold text-blue-900">
                  {getCartCount()}
                </span>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">
                  Cart Total
                </span>
                <span className="text-2xl font-bold text-green-900">
                  ₹{getCartTotal()}
                </span>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-700">
                  User Status
                </span>
                <span className="text-lg font-bold text-purple-900">
                  {isAuthenticated
                    ? `✅ ${user?.firstName || "Logged In"}`
                    : "❌ Guest"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Icon Tests */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">🎨 Icon Tests</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <Plus className="w-5 h-5 text-green-600" />
              <span>Plus Icon</span>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <Minus className="w-5 h-5 text-red-600" />
              <span>Minus Icon</span>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <span>Cart Icon</span>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
              <span>Package Icon</span>
            </div>
          </div>
        </div>

        {/* Cart Controls Test */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">🛒 Cart Controls Test</h2>

          {/* Add Test Product */}
          <div className="mb-6">
            <button
              onClick={addTestProduct}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Test Product to Cart</span>
            </button>
          </div>

          {/* Show Cart Item if exists */}
          {cartItem && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={cartItem.image}
                    alt={cartItem.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold">{cartItem.name}</h3>
                    <p className="text-gray-600">₹{cartItem.price}</p>
                  </div>
                </div>
                <button
                  onClick={removeTestProduct}
                  className="text-red-600 hover:text-red-700 p-2"
                >
                  🗑️ Remove
                </button>
              </div>

              {/* QUANTITY CONTROLS - THIS IS WHAT YOU'RE LOOKING FOR */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium">
                    Quantity:
                  </span>
                  <div className="flex items-center border-2 border-gray-300 rounded-lg bg-white">
                    <button
                      onClick={() => updateTestQuantity(cartItem.quantity - 1)}
                      className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                      disabled={cartItem.quantity <= 1}
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="px-4 py-2 min-w-[3rem] text-center font-semibold bg-gray-50">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => updateTestQuantity(cartItem.quantity + 1)}
                      className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Subtotal:</div>
                  <div className="text-lg font-bold">
                    ₹{cartItem.price * cartItem.quantity}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!cartItem && (
            <div className="text-gray-500 text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No test product in cart. Click "Add Test Product" above.</p>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">🧭 Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/"
              className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
            >
              <div className="text-2xl mb-2">🏠</div>
              <div className="font-medium">Home</div>
            </a>
            <a
              href="/products"
              className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
            >
              <div className="text-2xl mb-2">📦</div>
              <div className="font-medium">Products</div>
            </a>
            <a
              href="/cart"
              className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors"
            >
              <div className="text-2xl mb-2">🛒</div>
              <div className="font-medium">Cart</div>
            </a>
            <a
              href="/login"
              className="p-4 bg-orange-50 rounded-lg text-center hover:bg-orange-100 transition-colors"
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="font-medium">Login</div>
            </a>
          </div>
        </div>

        {/* Detailed Debug Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">🔍 Detailed Debug Info</h2>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {showDetails ? "Hide" : "Show"} Details
            </button>
          </div>

          {showDetails && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Cart State:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(cart, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Auth State:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify({ isAuthenticated, user }, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UIDebug;
