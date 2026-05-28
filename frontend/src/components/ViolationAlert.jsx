import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion"; // Temporarily disabled - need to install
import {
  AlertTriangle,
  Shield,
  X,
  Clock,
  Ban,
  CheckCircle,
  Eye,
} from "lucide-react";

const ViolationAlert = ({
  violations,
  userRole,
  onDisableProduct,
  onDisableTrader,
}) => {
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null);

  const getViolationSeverity = (count) => {
    if (count === 0) return "none";
    if (count === 1) return "warning";
    return "critical";
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "none":
        return "green";
      case "warning":
        return "yellow";
      case "critical":
        return "red";
      default:
        return "gray";
    }
  };

  const ViolationBadge = ({ count, severity }) => {
    const color = getSeverityColor(severity);

    return (
      <motion.div
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          severity === "none"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : severity === "warning"
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        }`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
      >
        {severity === "none" ? (
          <CheckCircle className="w-4 h-4 mr-1" />
        ) : (
          <AlertTriangle className="w-4 h-4 mr-1" />
        )}
        {count === 0
          ? "No Violations"
          : `${count} Violation${count > 1 ? "s" : ""}`}
      </motion.div>
    );
  };

  const ViolationCard = ({ violation, index }) => (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-card border-l-4 border-red-500"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="font-semibold text-gray-900 dark:text-white">
              {violation.type.charAt(0).toUpperCase() + violation.type.slice(1)}{" "}
              Violation
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                violation.status === "pending"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
              }`}
            >
              {violation.status}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-2">
            <strong>Trader:</strong> {violation.trader}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            <strong>Product:</strong> {violation.product}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            <Clock className="w-4 h-4 inline mr-1" />
            {new Date(violation.date).toLocaleDateString()}
          </p>
        </div>

        {userRole === "admin" && violation.status === "pending" && (
          <div className="flex flex-col space-y-2 ml-4">
            <motion.button
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
              onClick={() => {
                setSelectedViolation(violation);
                setActionType("disable_product");
                setShowModal(true);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Ban className="w-3 h-3" />
              <span>Disable Product</span>
            </motion.button>

            {violation.isSecondOffense && (
              <motion.button
                className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
                onClick={() => {
                  setSelectedViolation(violation);
                  setActionType("disable_trader");
                  setShowModal(true);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Shield className="w-3 h-3" />
                <span>Disable Trader</span>
              </motion.button>
            )}

            <motion.button
              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
              onClick={() => {
                setSelectedViolation(violation);
                setShowModal(true);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Eye className="w-3 h-3" />
              <span>View</span>
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );

  const ConfirmationModal = () => (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirm Action
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="mb-6">
              {actionType === "disable_product" ? (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Ban className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Disable Product
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    This will disable the product "{selectedViolation?.product}"
                    and send a warning to the trader. This is a first offense
                    action.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Shield className="w-5 h-5 text-red-700" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Disable Trader Account
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    This will disable the entire trader account for "
                    {selectedViolation?.trader}". This is a second offense
                    action and cannot be undone easily.
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <motion.button
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                onClick={() => setShowModal(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors duration-200"
                onClick={() => {
                  if (actionType === "disable_product") {
                    onDisableProduct(selectedViolation);
                  } else {
                    onDisableTrader(selectedViolation);
                  }
                  setShowModal(false);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Confirm
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!violations || violations.length === 0) {
    return (
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4"
        >
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </motion.div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Violations
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          All traders are following platform guidelines.
        </p>
      </div>
    );
  }

  const violationCount = violations.length;
  const severity = getViolationSeverity(violationCount);

  return (
    <div>
      {/* Summary */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Violation Management
          </h2>
          <ViolationBadge count={violationCount} severity={severity} />
        </div>

        {violationCount > 0 && (
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {violationCount} violation{violationCount > 1 ? "s" : ""} require
            {violationCount === 1 ? "s" : ""} your attention.
          </p>
        )}
      </div>

      {/* Violations List */}
      <div className="space-y-4">
        {violations.map((violation, index) => (
          <ViolationCard
            key={violation.id}
            violation={violation}
            index={index}
          />
        ))}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal />
    </div>
  );
};

export default ViolationAlert;
