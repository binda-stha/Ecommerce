import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Ban,
  Shield,
  Clock,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
} from "lucide-react";

const ViolationManagement = ({ userRole, userId }) => {
  const [violations, setViolations] = useState([]);
  const [traderStatus, setTraderStatus] = useState({});
  const [products, setProducts] = useState([]);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    type: "",
    description: "",
    evidence: [],
  });

  const violationTypes = [
    { id: "fake_product", label: "Fake/Counterfeit Product", severity: "high" },
    {
      id: "misleading_description",
      label: "Misleading Description",
      severity: "medium",
    },
    { id: "wrong_category", label: "Wrong Category", severity: "low" },
    {
      id: "inappropriate_content",
      label: "Inappropriate Content",
      severity: "high",
    },
    {
      id: "pricing_manipulation",
      label: "Price Manipulation",
      severity: "medium",
    },
    { id: "spam", label: "Spam/Duplicate Listings", severity: "low" },
    { id: "poor_service", label: "Poor Customer Service", severity: "medium" },
    { id: "delayed_shipping", label: "Delayed Shipping", severity: "low" },
  ];

  useEffect(() => {
    loadViolationData();
  }, [userRole, userId]);

  const loadViolationData = async () => {
    try {
      // Mock data - replace with actual API calls
      if (userRole === "admin") {
        setViolations([
          {
            id: 1,
            type: "fake_product",
            traderId: 2,
            traderName: "TechShop Nepal",
            productId: 5,
            productName: "iPhone 13 Pro",
            reportedBy: "customer123",
            reportDate: "2024-01-20T10:30:00Z",
            status: "pending",
            severity: "high",
            description:
              "Product appears to be counterfeit based on customer reports",
            evidence: ["screenshot1.jpg", "customer_complaint.pdf"],
            adminNotes: "",
          },
          {
            id: 2,
            type: "misleading_description",
            traderId: 3,
            traderName: "Fashion Hub",
            productId: 8,
            productName: "Leather Jacket",
            reportedBy: "customer456",
            reportDate: "2024-01-18T14:20:00Z",
            status: "under_review",
            severity: "medium",
            description: "Product material does not match description",
            evidence: ["product_photo.jpg"],
            adminNotes: "Investigating with trader",
          },
        ]);

        setTraderStatus({
          2: { suspended: false, warningCount: 1, totalViolations: 1 },
          3: { suspended: false, warningCount: 0, totalViolations: 1 },
        });
      } else if (userRole === "trader") {
        setViolations([
          {
            id: 1,
            type: "fake_product",
            productId: 5,
            productName: "iPhone 13 Pro",
            reportedBy: "customer123",
            reportDate: "2024-01-20T10:30:00Z",
            status: "pending",
            severity: "high",
            description:
              "Product appears to be counterfeit based on customer reports",
            adminResponse: "Under investigation",
            canAppeal: true,
          },
        ]);
      }

      setProducts([
        { id: 5, name: "iPhone 13 Pro", status: "under_review", traderId: 2 },
        { id: 8, name: "Leather Jacket", status: "active", traderId: 3 },
      ]);
    } catch (error) {
      console.error("Error loading violation data:", error);
    }
  };

  const handleReportViolation = () => {
    setShowReportModal(true);
  };

  const submitReport = async () => {
    try {
      const newReport = {
        ...reportForm,
        reportedBy: userId,
        reportDate: new Date().toISOString(),
        status: "pending",
      };

      // Send to backend
      console.log("Submitting report:", newReport);

      setShowReportModal(false);
      setReportForm({ type: "", description: "", evidence: [] });

      // Reload data
      loadViolationData();
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  const handleAdminAction = async (violationId, action, notes = "") => {
    try {
      const violation = violations.find((v) => v.id === violationId);

      switch (action) {
        case "approve":
          // Disable product and warn trader
          await disableProduct(violation.productId);
          await warnTrader(violation.traderId, violation.type);
          break;
        case "reject":
          // No action needed
          break;
        case "suspend_trader":
          await suspendTrader(violation.traderId);
          break;
        case "disable_product":
          await disableProduct(violation.productId);
          break;
      }

      // Update violation status
      setViolations((prev) =>
        prev.map((v) =>
          v.id === violationId
            ? {
                ...v,
                status: action === "approve" ? "resolved" : "rejected",
                adminNotes: notes,
              }
            : v
        )
      );
    } catch (error) {
      console.error("Error handling admin action:", error);
    }
  };

  const disableProduct = async (productId) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: "disabled" } : p))
    );
  };

  const warnTrader = async (traderId, violationType) => {
    setTraderStatus((prev) => ({
      ...prev,
      [traderId]: {
        ...prev[traderId],
        warningCount: (prev[traderId]?.warningCount || 0) + 1,
        totalViolations: (prev[traderId]?.totalViolations || 0) + 1,
      },
    }));
  };

  const suspendTrader = async (traderId) => {
    setTraderStatus((prev) => ({
      ...prev,
      [traderId]: {
        ...prev[traderId],
        suspended: true,
      },
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-orange-600 bg-orange-100";
      case "under_review":
        return "text-blue-600 bg-blue-100";
      case "resolved":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (userRole === "customer") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Report a Violation
            </h1>
            <p className="text-gray-600">
              Help us maintain quality by reporting any violations you encounter
            </p>
          </div>

          <button
            onClick={handleReportViolation}
            className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Report Violation
          </button>

          {/* Report Modal */}
          {showReportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Report Violation
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Violation Type
                    </label>
                    <select
                      value={reportForm.type}
                      onChange={(e) =>
                        setReportForm((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select violation type</option>
                      {violationTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={reportForm.description}
                      onChange={(e) =>
                        setReportForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the violation in detail..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitReport}
                      disabled={!reportForm.type || !reportForm.description}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                    >
                      Submit Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (userRole === "admin") {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2">Violation Management</h1>
          <p className="text-red-100">
            Monitor and manage platform violations and trader compliance
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {violations.filter((v) => v.status === "pending").length}
                </div>
                <div className="text-gray-600 text-sm">Pending Reports</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {violations.filter((v) => v.status === "under_review").length}
                </div>
                <div className="text-gray-600 text-sm">Under Review</div>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {violations.filter((v) => v.status === "resolved").length}
                </div>
                <div className="text-gray-600 text-sm">Resolved</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {
                    Object.values(traderStatus).filter((t) => t.suspended)
                      .length
                  }
                </div>
                <div className="text-gray-600 text-sm">Suspended Traders</div>
              </div>
              <Ban className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Violations Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              Recent Violations
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Report
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Trader
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Product
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Severity
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {violations.map((violation) => (
                  <tr
                    key={violation.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <div className="font-medium text-gray-800">
                        {
                          violationTypes.find((t) => t.id === violation.type)
                            ?.label
                        }
                      </div>
                      <div className="text-sm text-gray-600">
                        Reported by: {violation.reportedBy}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">
                        {violation.traderName}
                      </div>
                      <div className="text-sm text-gray-600">
                        ID: {violation.traderId}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">
                        {violation.productName}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                          violation.severity
                        )}`}
                      >
                        {violation.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          violation.status
                        )}`}
                      >
                        {violation.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(violation.reportDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {violation.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleAdminAction(violation.id, "approve")
                              }
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                            >
                              Take Action
                            </button>
                            <button
                              onClick={() =>
                                handleAdminAction(violation.id, "reject")
                              }
                              className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedViolation(violation)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (userRole === "trader") {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Trader Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2">My Violations</h1>
          <p className="text-orange-100">
            View and manage violations reported against your products
          </p>
        </div>

        {/* Violation Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {violations.filter((v) => v.status === "pending").length}
            </div>
            <div className="text-gray-600">Pending Reviews</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-red-600 mb-2">
              {traderStatus[userId]?.warningCount || 0}
            </div>
            <div className="text-gray-600">Total Warnings</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {products.filter((p) => p.status === "active").length}
            </div>
            <div className="text-gray-600">Active Products</div>
          </div>
        </div>

        {/* Violations List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Violation Reports
          </h2>

          <div className="space-y-4">
            {violations.map((violation) => (
              <div
                key={violation.id}
                className="border border-gray-200 rounded-xl p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {
                        violationTypes.find((t) => t.id === violation.type)
                          ?.label
                      }
                    </h3>
                    <p className="text-gray-600">
                      Product: {violation.productName}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      violation.status
                    )}`}
                  >
                    {violation.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{violation.description}</p>

                {violation.adminResponse && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                    <p className="text-sm font-medium text-blue-800">
                      Admin Response:
                    </p>
                    <p className="text-blue-700">{violation.adminResponse}</p>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    Reported on{" "}
                    {new Date(violation.reportDate).toLocaleDateString()}
                  </span>
                  {violation.canAppeal && violation.status === "resolved" && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Appeal Decision
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ViolationManagement;
