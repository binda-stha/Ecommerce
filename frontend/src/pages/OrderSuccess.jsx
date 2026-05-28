import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import InvoiceService from "../services/invoiceService";
import {
  CheckCircle,
  Package,
  CreditCard,
  Gift,
  ArrowRight,
  Home,
  Download,
  FileText,
  Eye,
} from "lucide-react";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const { orderId, paypalOrderId, pointsEarned, invoiceData } =
    location.state || {};

  const handleDownloadInvoice = () => {
    if (invoiceData) {
      InvoiceService.downloadInvoice(invoiceData);
    }
  };

  const handlePreviewInvoice = () => {
    if (invoiceData) {
      InvoiceService.previewInvoice(invoiceData);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      // Redirect if no order data
      navigate("/dashboard");
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5001/api/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          {/* Success Card */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 text-center transform hover:scale-[1.02] transition-all duration-300">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-6 shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>

            {/* Success Message */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Order Successful! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Thank you for your purchase! Your order has been confirmed and
              will be processed shortly.
            </p>

            {/* Order Details */}
            {orderDetails && (
              <div className="bg-gray-50/80 rounded-2xl p-6 mb-8 text-left">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Order ID</p>
                    <p className="font-medium text-gray-900">#{orderId}</p>
                  </div>

                  <div>
                    <p className="text-gray-600">Order Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(orderDetails.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-medium text-gray-900">
                      ₹{orderDetails.totalAmount?.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600">Payment Method</p>
                    <p className="font-medium text-gray-900 flex items-center">
                      <CreditCard className="w-4 h-4 mr-1" />
                      PayPal
                    </p>
                  </div>
                </div>

                {paypalOrderId && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-gray-600">PayPal Transaction ID</p>
                      <p className="font-medium text-gray-900 text-xs break-all">
                        {paypalOrderId}
                      </p>
                    </div>
                  </div>
                )}

                {/* Digital Invoice Section */}
                {invoiceData && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Digital Invoice
                    </h3>
                    <div className="flex gap-3">
                      <button
                        onClick={handleDownloadInvoice}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </button>
                      <button
                        onClick={handlePreviewInvoice}
                        className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Invoice
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Points Earned */}
            {pointsEarned > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-center mb-2">
                  <Gift className="w-6 h-6 text-yellow-600 mr-2" />
                  <h3 className="text-lg font-semibold text-yellow-800">
                    Loyalty Points Earned!
                  </h3>
                </div>
                <p className="text-yellow-700">
                  You've earned <strong>{pointsEarned} points</strong> from this
                  purchase!
                </p>
                <p className="text-sm text-yellow-600 mt-1">
                  (1 point for every ₹100 spent)
                </p>
              </div>
            )}

            {/* What's Next */}
            <div className="bg-blue-50/80 rounded-2xl p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                What happens next?
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>
                    You'll receive an email confirmation with your order details
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Our traders will prepare your items for shipping</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>
                    You'll receive tracking information once your order ships
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>
                    Your loyalty points will be available for use on your next
                    purchase
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Dashboard
              </button>

              <button
                onClick={() => navigate("/products")}
                className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-300"
              >
                Continue Shopping
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            {/* Decorative Elements */}
            <div className="flex justify-center mt-8 space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-1000"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-2000"></div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center text-gray-600">
            <p className="text-sm">
              Need help? Contact our support team at{" "}
              <a
                href="mailto:support@bptrade.com"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                support@bptrade.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
