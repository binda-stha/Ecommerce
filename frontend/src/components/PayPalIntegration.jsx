import React, { useState, useEffect } from "react";

const PayPalIntegration = ({
  amount,
  currency = "USD",
  onSuccess,
  onError,
  onCancel,
  disabled = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [error, setError] = useState(null);

  // PayPal configuration
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const environment = import.meta.env.VITE_PAYPAL_ENVIRONMENT || "sandbox";
  const enableMock = import.meta.env.VITE_ENABLE_MOCK_PAYPAL === "true";

  // Load PayPal SDK
  useEffect(() => {
    if (enableMock) {
      setPaypalLoaded(true);
      return;
    }

    if (window.paypal) {
      setPaypalLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture`;
    script.async = true;

    script.onload = () => {
      setPaypalLoaded(true);
      setError(null);
    };

    script.onerror = () => {
      setError("Failed to load PayPal SDK");
      setPaypalLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector(
        `script[src*="paypal.com/sdk"]`
      );
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [clientId, currency, enableMock]);

  // Handle mock PayPal payment (for development)
  const handleMockPayment = async () => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);

    try {
      // Show mock PayPal dialog
      const confirmed = window.confirm(
        `🧪 DEVELOPMENT MODE - Mock PayPal Payment\n\n` +
          `Amount: ${amount} ${currency}\n` +
          `Environment: ${environment}\n\n` +
          `This simulates the PayPal payment process.\n` +
          `Click OK to simulate successful payment.`
      );

      if (!confirmed) {
        onCancel?.();
        return;
      }

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create mock transaction
      const mockTransaction = {
        id: `MOCK_${Date.now()}`,
        status: "COMPLETED",
        amount: { value: amount, currency_code: currency },
        payer: {
          payer_id: "MOCK_PAYER",
          name: { given_name: "Test", surname: "User" },
        },
        purchase_units: [
          {
            payments: {
              captures: [{ id: `CAPTURE_${Date.now()}` }],
            },
          },
        ],
        create_time: new Date().toISOString(),
        mockPayment: true,
      };

      onSuccess?.(mockTransaction);
    } catch (error) {
      console.error("Mock payment error:", error);
      onError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle real PayPal payment
  const handleRealPayment = () => {
    if (!window.paypal || disabled || isProcessing) return;

    window.paypal
      .Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  currency_code: currency,
                  value: amount,
                },
              },
            ],
          });
        },
        onApprove: async (data, actions) => {
          setIsProcessing(true);
          try {
            const details = await actions.order.capture();
            onSuccess?.(details);
          } catch (error) {
            onError?.(error);
          } finally {
            setIsProcessing(false);
          }
        },
        onError: (err) => {
          setIsProcessing(false);
          onError?.(err);
        },
        onCancel: () => {
          setIsProcessing(false);
          onCancel?.();
        },
      })
      .render("#paypal-button-container");
  };

  if (error && !enableMock) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-medium">PayPal Error</p>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-red-700 underline text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Status indicator */}
      {enableMock && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-sm text-blue-700">
            🧪 Development Mode: Mock PayPal Integration
          </p>
        </div>
      )}

      {/* PayPal Button */}
      {enableMock ? (
        <button
          onClick={handleMockPayment}
          disabled={disabled || isProcessing}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
            disabled || isProcessing
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#0070ba] text-white hover:bg-[#005ea6]"
          }`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <span className="text-lg">💳</span>
              <span>Pay with PayPal</span>
              <span className="text-sm opacity-75">
                {amount} {currency}
              </span>
            </>
          )}
        </button>
      ) : (
        <div>
          {paypalLoaded ? (
            <div id="paypal-button-container" onLoad={handleRealPayment}></div>
          ) : (
            <div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Loading PayPal...</span>
            </div>
          )}
        </div>
      )}

      {/* Payment info */}
      <div className="text-xs text-gray-500 text-center">
        {enableMock
          ? "Development mode simulation"
          : "Secure PayPal payment processing"}
      </div>
    </div>
  );
};

export default PayPalIntegration;
