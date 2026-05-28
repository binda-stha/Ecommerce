import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import PromoCodeInput from "../components/PromoCodeInput";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  Lock,
  User,
} from "lucide-react";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } =
    useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [appliedPromo, setAppliedPromo] = useState(null);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handlePromoApplied = (promo) => {
    setAppliedPromo(promo);
  };

  const handlePromoRemoved = () => {
    setAppliedPromo(null);
  };

  const getSubtotal = () => {
    return getCartTotal();
  };

  const getDiscountAmount = () => {
    return appliedPromo ? appliedPromo.discountAmount : 0;
  };

  const getTax = () => {
    const afterDiscount = getSubtotal() - getDiscountAmount();
    return Math.round(afterDiscount * 0.18);
  };

  const getFinalTotal = () => {
    return getSubtotal() - getDiscountAmount() + getTax();
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      // Redirect to login with message about checkout
      navigate("/login", {
        state: {
          from: { pathname: "/cart" },
          message: "Please sign in to proceed with checkout",
        },
      });
    } else {
      // Navigate to checkout page
      navigate("/checkout");
    }
  };

  const handleGuestCheckout = () => {
    // For guest checkout, redirect to register
    navigate("/register", {
      state: {
        from: { pathname: "/cart" },
        message: "Create an account for faster checkout",
      },
    });
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-6">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-primary-600 to-blue-600 p-3 rounded-2xl">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Shopping Cart
                </h1>
                <p className="text-gray-600 mt-1">
                  {cart.items.length === 0
                    ? "Your cart is empty"
                    : `${cart.items.length} item${
                        cart.items.length !== 1 ? "s" : ""
                      } in your cart`}
                </p>
              </div>
            </div>
            <Link
              to="/products"
              className="group bg-primary-50 hover:bg-primary-100 text-primary-600 px-6 py-3 rounded-xl font-medium flex items-center transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Continue Shopping
            </Link>
          </div>

          {/* Cart Stats */}
          {cart.items.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-green-600">
                  {cart.items.length}
                </div>
                <div className="text-green-700 text-sm">Items</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">
                  ₹{getCartTotal()}
                </div>
                <div className="text-blue-700 text-sm">Total</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">
                  {cart.items.reduce(
                    (sum, item) => sum + item.points * item.quantity,
                    0
                  )}
                </div>
                <div className="text-purple-700 text-sm">Points</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Cart Items (
                    {cart.items.reduce(
                      (total, item) => total + item.quantity,
                      0
                    )}
                    )
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 font-medium flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear Cart
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ₹{getSubtotal().toLocaleString()}
                  </span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount ({appliedPromo.code})
                      {appliedPromo.isTraderDiscount && (
                        <span className="text-orange-600 text-xs ml-1">
                          OPPers
                        </span>
                      )}
                    </span>
                    <span className="font-medium">
                      -₹{getDiscountAmount().toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18%)</span>
                  <span className="font-medium">
                    ₹{getTax().toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{getFinalTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Promo Code Input */}
              <PromoCodeInput
                onPromoApplied={handlePromoApplied}
                cartTotal={getSubtotal()}
                appliedPromo={appliedPromo}
              />

              {!isAuthenticated ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Lock className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 mb-1">
                          Sign in to continue
                        </p>
                        <p className="text-sm text-blue-700">
                          Please sign in to your account or create a new one to
                          complete your purchase
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <User className="w-5 h-5 mr-2" />
                    Sign In to Checkout
                  </button>

                  <button
                    onClick={handleGuestCheckout}
                    className="w-full bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Account & Checkout
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Signed in as {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-green-700">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Proceed to Checkout
                  </button>
                </div>
              )}

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Secure checkout powered by PayPal
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const itemTotal = item.price * item.quantity;

  return (
    <div className="p-6">
      <div className="flex gap-4">
        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-800 pr-4">{item.name}</h3>
            <button
              onClick={() => onRemove(item.id)}
              className="text-red-600 hover:text-red-700 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            Category: {item.category} | Seller: {item.trader}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Qty:</span>
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                  className="p-1 hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 min-w-[3rem] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                  className="p-1 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                ₹{itemTotal.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                ₹{item.price.toLocaleString()} each
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
