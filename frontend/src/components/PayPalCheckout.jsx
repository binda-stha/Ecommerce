import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from "../context/AuthContext";

const PayPalCheckout = ({ items, total, onSuccess, onError }) => {
  const { getAuthHeaders } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // PayPal configuration
  const paypalOptions = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test-client-id",
    currency: "USD", // PayPal requires USD, but we'll show NPR to users
    intent: "capture",
  };

  // Convert NPR to USD for PayPal (approximate rate: 1 USD = 133 NPR)
  const convertNPRToUSD = (nprAmount) => {
    const exchangeRate = 133; // 1 USD = 133 NPR (approximate)
    return (nprAmount / exchangeRate).toFixed(2);
  };

  const createOrder = async (data, actions) => {
    try {
      setIsProcessing(true);

      // Create order in our backend first
      const orderResponse = await fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          subtotal: total,
          total: total,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message);
      }

      // Store order ID for later use
      window.currentOrderId = orderData.data.orderId;

      // Create PayPal order directly
      return actions.order.create({
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: convertNPRToUSD(total),
            },
            description: `Order #${orderData.data.orderId} - Binda Trade`,
            custom_id: orderData.data.orderId.toString(),
          },
        ],
      });
    } catch (error) {
      console.error("Create order error:", error);
      onError(error.message);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const onApprove = async (data, actions) => {
    try {
      setIsProcessing(true);

      // Capture the payment
      const details = await actions.order.capture();

      // Get the order ID we stored earlier
      const orderId =
        window.currentOrderId || details.purchase_units[0].custom_id;

      // Execute payment in our backend to update order status
      const executeResponse = await fetch(
        "http://localhost:5001/api/payments/execute",
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            paymentId: details.id,
            orderId: orderId,
            payerId: details.payer.payer_id,
          }),
        }
      );

      const executeData = await executeResponse.json();

      if (executeData.success) {
        onSuccess({
          orderId: orderId,
          paymentId: details.id,
          status: "completed",
          details: details,
        });
      } else {
        throw new Error(executeData.message);
      }
    } catch (error) {
      console.error("Payment execution error:", error);
      onError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="paypal-checkout">
      <div className="payment-summary">
        <h3>Order Summary</h3>
        <div className="order-items">
          {items.map((item, index) => (
            <div key={index} className="order-item">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="order-total">
          <strong>Total: ₹{total.toLocaleString()}</strong>
          <small>(≈ ${convertNPRToUSD(total)} USD)</small>
        </div>
      </div>

      <PayPalScriptProvider options={paypalOptions}>
        <div className="paypal-button-container">
          <PayPalButtons
            style={{
              layout: "vertical",
              color: "blue",
              shape: "rect",
              label: "paypal",
            }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={(err) => {
              console.error("PayPal error:", err);
              onError("Payment failed. Please try again.");
            }}
            disabled={isProcessing}
          />
        </div>
      </PayPalScriptProvider>

      {isProcessing && (
        <div className="processing-overlay">
          <div className="spinner"></div>
          <p>Processing payment...</p>
        </div>
      )}

      <style jsx>{`
        .paypal-checkout {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }

        .payment-summary {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .payment-summary h3 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }

        .order-total {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #007bff;
          font-size: 18px;
        }

        .order-total small {
          display: block;
          color: #666;
          font-size: 14px;
          margin-top: 5px;
        }

        .paypal-button-container {
          margin: 20px 0;
        }

        .processing-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .processing-overlay p {
          color: white;
          margin-top: 10px;
          font-size: 16px;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default PayPalCheckout;
