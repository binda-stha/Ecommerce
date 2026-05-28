import React, { useState } from "react";
import { Tag, CheckCircle, X, AlertCircle } from "lucide-react";

const PromoCodeInput = ({
  onPromoApplied,
  onPromoRemoved,
  appliedPromo,
  cartTotal,
}) => {
  const [promoCode, setPromoCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState("");

  // Available promo codes (in real app, this would come from backend)
  const availablePromoCodes = [
    {
      code: "WELCOME10",
      type: "percentage",
      discount: 10,
      minAmount: 500,
      description: "10% off on orders above ₹500",
      active: true,
    },
    {
      code: "SAVE20",
      type: "percentage",
      discount: 20,
      minAmount: 1000,
      description: "20% off on orders above ₹1000",
      active: true,
    },
    {
      code: "FLAT100",
      type: "fixed",
      discount: 100,
      minAmount: 2000,
      description: "₹100 off on orders above ₹2000",
      active: true,
    },
    {
      code: "OPPERS15",
      type: "percentage",
      discount: 15,
      minAmount: 750,
      description: "Trader Special: 15% off on orders above ₹750",
      active: true,
      isTraderDiscount: true,
    },
  ];

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setIsApplying(true);
    setError("");

    try {
      // Find promo code
      const promo = availablePromoCodes.find(
        (p) => p.code.toLowerCase() === promoCode.toLowerCase() && p.active
      );

      if (!promo) {
        setError("Invalid or expired promo code!");
        setIsApplying(false);
        return;
      }

      // Check minimum amount
      if (cartTotal < promo.minAmount) {
        setError(
          `Minimum order amount of ₹${promo.minAmount} required for this promo code!`
        );
        setIsApplying(false);
        return;
      }

      // Calculate discount
      let discountAmount = 0;
      if (promo.type === "percentage") {
        discountAmount = Math.round((cartTotal * promo.discount) / 100);
      } else {
        discountAmount = promo.discount;
      }

      // Apply promo
      onPromoApplied({
        ...promo,
        discountAmount,
      });

      setPromoCode("");
    } catch (error) {
      setError("Error applying promo code. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemovePromo = () => {
    onPromoRemoved();
    setError("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleApplyPromo();
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-2xl p-6 border border-green-200 dark:border-green-800">
      <div className="flex items-center mb-4">
        <Tag className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Promo Code & OPPers
        </h3>
      </div>

      {!appliedPromo ? (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter promo code"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              disabled={isApplying}
            />
            <button
              onClick={handleApplyPromo}
              disabled={!promoCode.trim() || isApplying}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isApplying ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          {/* Available Codes */}
          <div className="border-t border-green-200 dark:border-green-800 pt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Available Codes:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availablePromoCodes.map((promo) => (
                <div
                  key={promo.code}
                  className={`p-3 rounded-lg text-xs cursor-pointer hover:bg-white hover:shadow-sm transition-all ${
                    promo.isTraderDiscount
                      ? "bg-orange-100 border border-orange-200 dark:bg-orange-900 dark:border-orange-800"
                      : "bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                  }`}
                  onClick={() => setPromoCode(promo.code)}
                >
                  <div className="font-medium text-gray-900 dark:text-white flex items-center">
                    {promo.code}
                    {promo.isTraderDiscount && (
                      <span className="ml-2 text-orange-600 dark:text-orange-400 text-xs">
                        OPPers
                      </span>
                    )}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {promo.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-300 dark:border-green-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {appliedPromo.code} Applied!
                  {appliedPromo.isTraderDiscount && (
                    <span className="ml-2 text-orange-600 dark:text-orange-400 text-sm">
                      (OPPers Discount)
                    </span>
                  )}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  You saved ₹{appliedPromo.discountAmount}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemovePromo}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput;
