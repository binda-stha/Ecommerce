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
  const cartItems = cart.items;

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

  // PayPal configuration with fallback
  const paypalOptions = {
    "client-id": "test", // Using test for development
    currency: "USD",
    intent: "capture",
  };

  // State for PayPal SDK loading
  const [paypalSDKLoaded, setPaypalSDKLoaded] = useState(false);
  const [paypalSDKError, setPaypalSDKError] = useState(false);

  // Debug PayPal configuration
  useEffect(() => {
    console.log(
      "PayPal Client ID:",
      import.meta.env.VITE_PAYPAL_CLIENT_ID || "test"
    );
    console.log("PayPal Options:", paypalOptions);
  }, []);

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
      const response = await fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
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

  const handleBillingChange = (e) => {
    setBillingInfo({
      ...billingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleBillingSameAsShipping = (e) => {
    setBillingInfo({
      ...billingInfo,
      sameAsShipping: e.target.checked,
      ...(e.target.checked
        ? {
            address: shippingInfo.address,
            city: shippingInfo.city,
            state: shippingInfo.state,
            zipCode: shippingInfo.zipCode,
            country: shippingInfo.country,
          }
        : {}),
    });
  };

  // Create PayPal order
  const createOrder = async (data, actions) => {
    if (processing) return; // Prevent duplicate orders

    const totalUSD = calculateTotalUSD();

    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: totalUSD,
            currency_code: "USD",
          },
          description: `Binda Ecommerce Order - ${cartItems.length} items`,
          custom_id: `order_${user.id}_${Date.now()}`,
        },
      ],
    });
  };

  // Handle PayPal payment approval
  const onApprove = async (data, actions) => {
    if (processing) return; // Prevent duplicate processing

    setProcessing(true);

    try {
      const details = await actions.order.capture();

      // Create order in database
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: calculateTotal(),
        contactInfo: contactInfo,
        shippingAddress: shippingInfo,
        billingAddress: billingInfo.sameAsShipping ? shippingInfo : billingInfo,
        orderNotes: orderNotes,
        paymentDetails: {
          method: "paypal",
          paypalOrderId: details.id,
          paypalPayerId: details.payer.payer_id,
          paymentStatus: details.status,
          transactionId: details.purchase_units[0].payments.captures[0].id,
        },
      };

      // Save order to database
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();

        // Add points (1 point per 100 NPR spent)
        const pointsToAdd = Math.floor(calculateTotal() / 100);

        // Generate and save digital invoice
        const invoiceData = {
          invoiceNumber: `BP-${order.id}-${Date.now()}`,
          orderId: order.id,
          date: new Date().toISOString(),
          paymentStatus: details.status,
          customer: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: contactInfo.email,
            phone: contactInfo.phone,
          },
          items: cartItems.map((item) => ({
            name: item.name,
            trader: item.trader || "Binda Ecommerce",
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: calculateTotal(),
          discount: 0, // TODO: Add promo code discount
          tax: Math.round(calculateTotal() * 0.18),
          finalTotal: Math.round(calculateTotal() * 1.18),
          transactionId: details.purchase_units[0].payments.captures[0].id,
          paymentDate: new Date().toISOString(),
          pointsEarned: pointsToAdd,
          totalPoints: (user.points || 0) + pointsToAdd,
          traders: [...new Set(cartItems.map((item) => item.trader))].map(
            (traderName) => ({
              name: traderName || "Binda Ecommerce",
              shopName: `${traderName} Shop` || "Binda Ecommerce Shop",
            })
          ),
        };

        // Clear cart using CartContext
        clearCart();
        if (pointsToAdd > 0) {
          await fetch("http://localhost:5001/api/points/add", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ points: pointsToAdd }),
          });
        }

        // Redirect to success page with invoice data
        navigate("/order-success", {
          state: {
            orderId: order.id,
            paypalOrderId: details.id,
            pointsEarned: pointsToAdd,
            invoiceData: invoiceData,
          },
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create PayPal order");
      }
    } catch (error) {
      console.error("PayPal payment processing error:", error);
      alert(
        `Payment was successful but there was an error processing your order: ${error.message}. Please contact support with your PayPal transaction ID.`
      );
    } finally {
      setProcessing(false);
    }
  };

  const onError = (err) => {
    console.error("PayPal payment error:", err);
    setProcessing(false);

    // More specific error messages
    let errorMessage = "Payment failed. ";
    if (err.message && err.message.includes("funding")) {
      errorMessage +=
        "Funding source not available. Please try a different payment method.";
    } else if (err.message && err.message.includes("client")) {
      errorMessage += "PayPal configuration error. Please contact support.";
    } else {
      errorMessage += "Please check your internet connection and try again.";
    }

    alert(errorMessage);
  };

  // Mock PayPal payment for development
  const handleMockPayPalPayment = async () => {
    if (processing) return;

    setProcessing(true);

    try {
      // Simulate PayPal redirect and approval process
      const confirmPayment = window.confirm(
        `🧪 DEVELOPMENT MODE - Mock PayPal Payment\n\n` +
          `Amount: $${calculateTotalUSD()} USD (₹${calculateTotal()} NPR)\n` +
          `Items: ${cartItems.length} products\n\n` +
          `This simulates the PayPal payment process.\n` +
          `Click OK to simulate successful payment, Cancel to abort.`
      );

      if (!confirmPayment) {
        alert("Payment cancelled by user.");
        return;
      }

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create mock PayPal transaction details
      const mockPayPalDetails = {
        id: `MOCK_PAYPAL_${Date.now()}`,
        status: "COMPLETED",
        payer: {
          payer_id: "MOCK_PAYER_ID",
          name: {
            given_name: "Test",
            surname: "User",
          },
        },
        purchase_units: [
          {
            payments: {
              captures: [
                {
                  id: `MOCK_CAPTURE_${Date.now()}`,
                },
              ],
            },
            amount: {
              value: calculateTotalUSD(),
            },
          },
        ],
      };

      // Create order in database (same as real PayPal)
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: calculateTotal(),
        contactInfo: contactInfo,
        shippingAddress: shippingInfo,
        billingAddress: billingInfo.sameAsShipping ? shippingInfo : billingInfo,
        orderNotes: orderNotes,
        paymentDetails: {
          method: "paypal",
          paypalOrderId: mockPayPalDetails.id,
          paypalPayerId: mockPayPalDetails.payer.payer_id,
          paymentStatus: mockPayPalDetails.status,
          transactionId:
            mockPayPalDetails.purchase_units[0].payments.captures[0].id,
          mockPayment: true, // Flag to indicate this was a mock payment
        },
      };

      // Save order to database
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();

        // Add points (1 point per 100 NPR spent)
        const pointsToAdd = Math.floor(calculateTotal() / 100);

        // Clear cart
        clearCart();

        // Show success message
        alert(
          `🎉 Mock PayPal Payment Successful!\n\n` +
            `Order ID: ${order.id}\n` +
            `Transaction ID: ${mockPayPalDetails.id}\n` +
            `Amount: $${calculateTotalUSD()} USD (₹${calculateTotal()} NPR)\n` +
            `Points Earned: ${pointsToAdd}\n\n` +
            `In production, this would be a real PayPal transaction.`
        );

        // Redirect to success page
        navigate("/order-success", {
          state: {
            orderId: order.id,
            paymentMethod: "paypal",
            pointsEarned: pointsToAdd,
            mockPayment: true,
          },
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to create mock PayPal order"
        );
      }
    } catch (error) {
      console.error("Mock PayPal payment error:", error);
      alert(`Mock payment failed: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Function to validate all required fields
  const validateForm = () => {
    const errors = [];

    // Contact information validation
    if (!contactInfo.email) errors.push("Email address is required");
    if (!contactInfo.phone) errors.push("Phone number is required");

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (contactInfo.email && !emailRegex.test(contactInfo.email)) {
      errors.push("Please enter a valid email address");
    }

    // Phone format validation (basic)
    if (contactInfo.phone && contactInfo.phone.length < 10) {
      errors.push("Please enter a valid phone number");
    }

    // Shipping information validation
    if (!shippingInfo.address) errors.push("Shipping address is required");
    if (!shippingInfo.city) errors.push("City is required");
    if (!shippingInfo.state) errors.push("State/Province is required");
    if (!shippingInfo.zipCode) errors.push("ZIP code is required");

    // Terms acceptance
    if (!acceptTerms) errors.push("You must accept the terms and conditions");

    return errors;
  };

  // Function to handle order now button click
  const handleOrderNow = async () => {
    setLoading(true);

    try {
      const validationErrors = validateForm();

      if (validationErrors.length > 0) {
        alert(
          "Please complete all required fields:\n" + validationErrors.join("\n")
        );
        return;
      }

      if (paymentMethod === "paypal") {
        // For PayPal, scroll to PayPal buttons without alert
        const paypalSection = document.querySelector(".paypal-buttons-section");
        if (paypalSection) {
          paypalSection.scrollIntoView({ behavior: "smooth" });
          // Focus on PayPal buttons to draw attention
          const paypalButton = paypalSection.querySelector(
            '[data-funding-source="paypal"]'
          );
          if (paypalButton) {
            paypalButton.focus();
          }
        }
      } else if (paymentMethod === "cod") {
        // Handle Cash on Delivery
        await processCODOrder();
      } else if (paymentMethod === "card") {
        // Handle Credit Card (when implemented)
        alert("Credit card payment is coming soon. Please use PayPal for now.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to process Cash on Delivery order
  const processCODOrder = async () => {
    if (processing) return; // Prevent duplicate processing

    setProcessing(true);

    try {
      // Create order in database for COD
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: calculateTotal(),
        contactInfo: contactInfo,
        shippingAddress: shippingInfo,
        billingAddress: billingInfo.sameAsShipping ? shippingInfo : billingInfo,
        orderNotes: orderNotes,
        paymentDetails: {
          method: "cod",
          paymentStatus: "pending",
        },
      };

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();

        // Clear cart
        clearCart();

        // Redirect to success page
        navigate("/order-success", {
          state: {
            orderId: order.id,
            paymentMethod: "cod",
            pointsEarned: Math.floor(calculateTotal() / 100),
          },
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create COD order");
      }
    } catch (error) {
      console.error("COD order error:", error);
      alert(
        `Failed to create order: ${error.message}. Please try again or contact support.`
      );
    } finally {
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-4">
            Add some items to your cart before checking out
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // REQ-04: Enforce authentication before rendering checkout
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-4">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please log in or create an account to complete your purchase.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() =>
                navigate("/login", { state: { from: "/checkout" } })
              }
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Login to Continue
            </button>
            <button
              onClick={() =>
                navigate("/register", { state: { from: "/checkout" } })
              }
              className="w-full bg-gray-100 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Create New Account
            </button>
          </div>
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
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <img
                    src={item.image || "/api/placeholder/80/80"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total (NPR)</span>
                <span>₹{calculateTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>Total (USD)</span>
                <span>${calculateTotalUSD()}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Contact Information
              </h2>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={contactInfo.email}
                    onChange={handleContactChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="your@email.com"
                    required
                    aria-describedby="email-help"
                  />
                  <p id="email-help" className="text-xs text-gray-500 mt-1">
                    We'll send your order confirmation to this email
                  </p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="+977-9800000000"
                    required
                    aria-describedby="phone-help"
                  />
                  <p id="phone-help" className="text-xs text-gray-500 mt-1">
                    For delivery coordination and order updates
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Shipping Information
              </h2>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your address"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="City"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="State"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="ZIP"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="Nepal">Nepal</option>
                      <option value="India">India</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Billing Address
              </h2>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={billingInfo.sameAsShipping}
                    onChange={handleBillingSameAsShipping}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Same as shipping address
                  </span>
                </label>
              </div>

              {!billingInfo.sameAsShipping && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={billingInfo.address}
                      onChange={handleBillingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter billing address"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={billingInfo.city}
                        onChange={handleBillingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="City"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={billingInfo.state}
                        onChange={handleBillingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="State"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={billingInfo.zipCode}
                        onChange={handleBillingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="ZIP"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <select
                        name="country"
                        value={billingInfo.country}
                        onChange={handleBillingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="Nepal">Nepal</option>
                        <option value="India">India</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Method
              </h2>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3 flex items-center">
                      <span className="font-medium">PayPal</span>
                      <span className="ml-2 text-sm text-gray-500">
                        (Recommended - Secure & Fast)
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      disabled
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3 flex items-center">
                      <span className="font-medium">Credit/Debit Card</span>
                      <span className="ml-2 text-sm text-gray-500">
                        (Coming Soon)
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3 flex items-center">
                      <span className="font-medium">Cash on Delivery</span>
                      <span className="ml-2 text-sm text-gray-500">
                        (Pay when you receive)
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Currency Conversion Info */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Currency Conversion:</strong> Your total of ₹
                  {calculateTotal().toLocaleString()} NPR will be charged as $
                  {calculateTotalUSD()} USD through PayPal.
                </p>
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

              {/* Payment Buttons */}
              {paymentMethod === "paypal" && (
                <div className="paypal-buttons-section">
                  {/* Always show PayPal buttons but disable if fields incomplete */}
                  <div className="space-y-4">
                    {/* Field validation status */}
                    {contactInfo.email &&
                    contactInfo.phone &&
                    shippingInfo.address &&
                    shippingInfo.city &&
                    shippingInfo.state &&
                    shippingInfo.zipCode &&
                    acceptTerms ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                        <p className="text-green-800 font-medium">
                          ✅ All fields completed! Click PayPal button below to
                          proceed:
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                        <p className="text-yellow-800 font-medium">
                          ⚠️ Please complete all required fields above, then
                          PayPal buttons will be enabled
                        </p>
                        <div className="mt-2 text-sm text-yellow-700">
                          Missing:{" "}
                          {[
                            !contactInfo.email && "Email",
                            !contactInfo.phone && "Phone",
                            !shippingInfo.address && "Address",
                            !shippingInfo.city && "City",
                            !shippingInfo.state && "State",
                            !shippingInfo.zipCode && "Zip Code",
                            !acceptTerms && "Accept Terms",
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      </div>
                    )}

                    {/* PayPal Integration Component */}
                    <div
                      className={`${
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
                  </div>
                </div>
              )}

              {/* Cash on Delivery Payment */}
              {paymentMethod === "cod" && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">
                      Cash on Delivery
                    </h4>
                    <p className="text-sm text-green-700">
                      You can pay with cash when your order is delivered to your
                      address. A delivery fee of ₹50 may apply.
                    </p>
                  </div>

                  {contactInfo.email &&
                  contactInfo.phone &&
                  shippingInfo.address &&
                  shippingInfo.city &&
                  shippingInfo.state &&
                  shippingInfo.zipCode &&
                  acceptTerms ? (
                    <button
                      onClick={processCODOrder}
                      disabled={processing}
                      className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
                    >
                      {processing
                        ? "Processing Order..."
                        : "Place Order (Cash on Delivery)"}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-medium cursor-not-allowed"
                    >
                      Complete Required Fields to Continue
                    </button>
                  )}
                </div>
              )}

              {/* Credit Card Payment (Coming Soon) */}
              {paymentMethod === "card" && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <p className="text-yellow-800 font-medium">
                    Credit card payment is coming soon. Please use PayPal or
                    Cash on Delivery for now.
                  </p>
                </div>
              )}
            </div>

            {/* Order Notes (Optional) */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Order Notes (Optional)
              </h2>

              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Special instructions for your order (e.g., delivery preferences, gift message, etc.)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                rows={3}
              />

              {/* Order Now Button */}
              <div className="mt-4">
                <button
                  onClick={handleOrderNow}
                  disabled={processing || loading}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {processing || loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {processing
                        ? "Processing Order..."
                        : "Preparing Order..."}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      {paymentMethod === "paypal"
                        ? `Go to PayPal Payment - ₹${calculateTotal().toLocaleString()}`
                        : paymentMethod === "cod"
                        ? `Place COD Order - ₹${calculateTotal().toLocaleString()}`
                        : `Complete Order - ₹${calculateTotal().toLocaleString()}`}
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-2">
                  {paymentMethod === "paypal" &&
                    "This will scroll you to the PayPal payment buttons above"}
                  {paymentMethod === "cod" &&
                    "Your order will be confirmed for cash on delivery"}
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
