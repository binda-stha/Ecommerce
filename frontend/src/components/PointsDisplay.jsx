import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion"; // Temporarily disabled - need to install
import { Star, Gift, TrendingUp, Award, Coins } from "lucide-react";

const PointsDisplay = ({
  currentPoints,
  pointsEarned = 0,
  showAnimation = false,
}) => {
  const [displayPoints, setDisplayPoints] = useState(currentPoints);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (showAnimation && pointsEarned > 0) {
      setIsAnimating(true);

      // Animate the points counter
      const duration = 1500;
      const steps = 30;
      const increment = pointsEarned / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setDisplayPoints((prev) => Math.min(prev + increment, currentPoints));

        if (currentStep >= steps) {
          clearInterval(timer);
          setDisplayPoints(currentPoints);
          setIsAnimating(false);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayPoints(currentPoints);
    }
  }, [currentPoints, pointsEarned, showAnimation]);

  const getPointsLevel = (points) => {
    if (points < 100) return { level: "Bronze", color: "amber", icon: Star };
    if (points < 500) return { level: "Silver", color: "gray", icon: Award };
    if (points < 1000) return { level: "Gold", color: "yellow", icon: Award };
    return { level: "Platinum", color: "purple", icon: Award };
  };

  const pointsLevel = getPointsLevel(currentPoints);
  const LevelIcon = pointsLevel.icon;

  const calculateValue = (points) => {
    return (points * 1).toFixed(0); // 1 point = ₹1 for this example
  };

  return (
    <div className="space-y-6">
      {/* Main Points Display */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-800 rounded-3xl p-6 text-white relative overflow-hidden animate-fade-in-up">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4">
            <Coins className="w-24 h-24" />
          </div>
          <div className="absolute bottom-4 left-4">
            <Star className="w-16 h-16" />
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <LevelIcon className="w-6 h-6" />
              <span className="font-semibold">{pointsLevel.level} Member</span>
            </div>
            <Gift className="w-6 h-6" />
          </div>

          <div className="text-center">
            <div
              className={`text-5xl font-bold mb-2 ${
                isAnimating ? "animate-pulse" : ""
              }`}
            >
              {Math.floor(displayPoints).toLocaleString()}
            </div>
            <p className="text-lg opacity-90">Loyalty Points</p>
            <p className="text-sm opacity-75">
              ≈ ₹{calculateValue(displayPoints)} value
            </p>
          </div>

          {/* Progress to Next Level */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>
                Progress to{" "}
                {pointsLevel.level === "Platinum" ? "Max Level" : "Next Level"}
              </span>
              <span>
                {pointsLevel.level === "Platinum"
                  ? "100%"
                  : `${Math.min(
                      100,
                      ((currentPoints % 500) / 500) * 100
                    ).toFixed(0)}%`}
              </span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-1000 ease-out"
                style={{
                  width:
                    pointsLevel.level === "Platinum"
                      ? "100%"
                      : `${Math.min(
                          100,
                          ((currentPoints % 500) / 500) * 100
                        )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Points Earned Animation */}
      {showAnimation && pointsEarned > 0 && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-2xl p-4 text-center animate-fade-in-up">
          <div className="text-green-600 dark:text-green-400 font-bold text-2xl mb-2 animate-pulse">
            +{pointsEarned} Points Earned!
          </div>
          <p className="text-green-700 dark:text-green-300">
            Thanks for your purchase! 🎉
          </p>
        </div>
      )}

      {/* Points Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                This Month
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {(pointsEarned || 85).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Points earned this month
          </p>
        </div>

        <div
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-xl">
              <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Redeemable
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.max(0, currentPoints - 100).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Available for redemption
          </p>
        </div>

        <div
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-xl">
              <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Lifetime
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {(currentPoints + 1250).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total points earned
          </p>
        </div>
      </div>

      {/* How to Earn More Points */}
      <div
        className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 rounded-2xl p-6 animate-fade-in-up"
        style={{ animationDelay: "0.4s" }}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How to Earn More Points
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Make Purchases
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Earn 1 point for every ₹100 spent
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Write Reviews
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get bonus points for product reviews
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Refer Friends
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Earn bonus points for referrals
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">4</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Special Promotions
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Participate in promotional events
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Redeem Button */}
      {currentPoints >= 100 && (
        <button
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105 active:scale-95 animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          <Gift className="w-5 h-5" />
          <span>Redeem Points</span>
        </button>
      )}
    </div>
  );
};

export default PointsDisplay;
