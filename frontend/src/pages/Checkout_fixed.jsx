import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import PayPalIntegration from "../components/PayPalIntegration";
import {
  ShoppingCart,
  CreditCard,
  MapPin,
  User,
  Package,
  ArrowLeft,
  FileText,
} from "lucide-react";

const Checkout = () => {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [contactInfo, setContactInfo] = useState({
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Nepal",
  });
  const [billingInfo, setBillingInfo] = useState({
    sameAsShipping: true,
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Nepal",
  });
  const [paymentMethod, setPaymentMethod] = useState("paypal");

  // Get cart items from CartContext
  const cartItems = cart.items || [];

  // REQ-04: Forced Registration - Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login", {
        state: {
          from: "/checkout",
          message:
            "Please create an account or login to complete your purchase",
        },
      });
    }
  }, [user, navigate]);

  // NPR to USD conversion rate (1 USD = 133 NPR approximately)
  const NPR_TO_USD = 133;

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateTotalUSD = () => {
    const nprTotal = calculateTotal();
    return (nprTotal / NPR_TO_USD).toFixed(2);
  };

  const handleShippingChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleBillingChange = (e) => {
    setBillingInfo({
      ...billingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleContactChange = (e) => {
    setContactInfo({
      ...contactInfo,
      [e.target.name]: e.target.value,
    });
  };

  // PayPal Integration Handlers
  const handlePayPalSuccess = async (details) => {
    console.log("PayPal Payment Success:", details);
    setProcessing(true);

    try {
      // Create order data
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
        totalAmount: calculateTotal(),
        paymentMethod: "paypal",
        paymentStatus: "paid",
        contactInfo,
        shippingInfo,
        billingInfo: billingInfo.sameAsShipping ? shippingInfo : billingInfo,
        orderNotes,
        paypalTransaction: {
          transactionId: details.id,
          status: details.status,
          payerId: details.payer?.payer_id,
          captureId: details.purchase_units?.[0]?.payments?.captures?.[0]?.id,
        },
      };

      // Send order to backend
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert(`Order creation failed: ${response.status} ${errorText}`);
        throw new Error("Failed to create order");
      }
      const order = await response.json();
      console.log("Order created successfully:", order);

      // Clear cart and redirect to success page
      clearCart();
      navigate("/order-success", {
        state: {
          order,
          paymentDetails: details,
          message: "Your order has been placed successfully!",
        },
      });
    } catch (error) {
      console.error("Error processing order:", error);
      alert(`Error processing order: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handlePayPalError = (error) => {
    console.error("PayPal Payment Error:", error);
    alert(`Payment failed: ${error.message || "Unknown error occurred"}`);
    setProcessing(false);
  };

  const handlePayPalCancel = () => {
    console.log("PayPal Payment Cancelled");
    alert("Payment was cancelled. You can try again when ready.");
    setProcessing(false);
  };

  // If no cart items, show empty cart message
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some products to your cart before proceeding to checkout.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {processing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium">Processing your payment...</p>
            <p className="text-gray-600">Please don't close this window</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center text-gray-600 hover:text-primary-600 transition-colors mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <User className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Contact Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={contactInfo.email}
                    onChange={handleContactChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={contactInfo.phone}
                    onChange={handleContactChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="+977 98xxxxxxxx"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Shipping Address
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleShippingChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Kathmandu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleShippingChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Bagmati"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={handleShippingChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="44600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleShippingChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Nepal">Nepal</option>
                    <option value="India">India</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <FileText className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Order Notes (Optional)
                </h2>
              </div>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows="3"
                placeholder="Any special instructions for your order..."
              />
            </div>
          </div>

          {/* Right Column - Order Summary & Payment */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Package className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Order Summary
                </h2>
              </div>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
                <hr className="my-4" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total (NPR)</span>
                  <span>₹{calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total (USD)</span>
                  <span>${calculateTotalUSD()}</span>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Payment</h2>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      Privacy Policy
                    </a>
                    *
                  </span>
                </label>
              </div>

              {/* PayPal Payment */}
              <div
                className={`transition-opacity ${
                  !(
                    contactInfo.email &&
                    contactInfo.phone &&
                    shippingInfo.address &&
                    shippingInfo.city &&
                    shippingInfo.state &&
                    shippingInfo.zipCode &&
                    acceptTerms
                  )
                    ? "opacity-50 pointer-events-none"
                    : ""
                }`}
              >
                <PayPalIntegration
                  amount={calculateTotalUSD()}
                  currency="USD"
                  onSuccess={handlePayPalSuccess}
                  onError={handlePayPalError}
                  onCancel={handlePayPalCancel}
                  disabled={
                    !(
                      contactInfo.email &&
                      contactInfo.phone &&
                      shippingInfo.address &&
                      shippingInfo.city &&
                      shippingInfo.state &&
                      shippingInfo.zipCode &&
                      acceptTerms
                    ) || processing
                  }
                />
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600 text-center">
                  {paymentMethod === "paypal" &&
                    "Secure payment powered by PayPal"}
                  {paymentMethod === "card" &&
                    "Credit card payment coming soon"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
