import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  Store,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  Shield,
  Search,
  X,
  Filter,
  Download,
  Calendar,
} from "lucide-react";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const { user } = useAuth();
  const [pendingTraders, setPendingTraders] = useState([]);
  const [allTraders, setAllTraders] = useState([]);
  const [violations, setViolations] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTraders: 0,
    totalProducts: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPendingTraders, setFilteredPendingTraders] = useState([]);
  const [filteredAllTraders, setFilteredAllTraders] = useState([]);
  const [filteredViolations, setFilteredViolations] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // MOCK DATA
  // 30 mock products
  const mockProducts = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    name: `Mock Product ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    sku: `SKU${String(i + 1).padStart(3, "0")}`,
    shop: `Shop ${["Alpha", "Beta", "Gamma", "Delta", "Epsilon"][i % 5]}`,
    price: 499 + i * 10,
    status: i % 2 === 0 ? "active" : "disabled",
  }));
  const mockPendingTraders = [
    {
      id: 1,
      businessName: "Pending Trader 1",
      User: { name: "Alice Smith", email: "pending1@example.com" },
      createdAt: new Date().toISOString(),
    },
  ];
  const mockAllTraders = [
    {
      id: 2,
      businessName: "Trader 2",
      User: { name: "Bob Jones", email: "trader2@example.com" },
      status: "active",
      createdAt: new Date().toISOString(),
    },
  ];
  const mockViolations = [
    {
      id: 1,
      trader: "Trader 2",
      product: "Mock Product B",
      reason: "Policy breach",
      date: new Date().toISOString(),
    },
  ];
  const mockStats = {
    totalUsers: 10,
    totalTraders: 2,
    totalProducts: 30,
    totalOrders: 5,
  };

  // Always use dummy products for Product Management
  useEffect(() => {
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
    setPendingTraders(mockPendingTraders);
    setAllTraders(mockAllTraders);
    setViolations(mockViolations);
    setStats(mockStats);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Filter products
    if (!productSearch) {
      setFilteredProducts(mockProducts);
    } else {
      let filtered = mockProducts.filter(
        (product) =>
          product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.sku?.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.shop?.toLowerCase().includes(productSearch.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
    if (user?.role === "admin") {
      fetchAdminData();
    }
  }, [user, productSearch]);

  // Filter data based on search term and filters
  useEffect(() => {
    const filterData = () => {
      const term = searchTerm.toLowerCase();

      // Filter pending traders
      let filteredPending = pendingTraders.filter(
        (trader) =>
          trader.businessName?.toLowerCase().includes(term) ||
          trader.email?.toLowerCase().includes(term) ||
          trader.User?.firstName?.toLowerCase().includes(term) ||
          trader.User?.lastName?.toLowerCase().includes(term) ||
          trader.User?.name?.toLowerCase().includes(term)
      );

      // Apply date filter for pending traders
      if (dateFilter !== "all") {
        const filterDate = new Date();
        if (dateFilter === "today") {
          filterDate.setHours(0, 0, 0, 0);
        } else if (dateFilter === "week") {
          filterDate.setDate(filterDate.getDate() - 7);
        } else if (dateFilter === "month") {
          filterDate.setMonth(filterDate.getMonth() - 1);
        }

        filteredPending = filteredPending.filter(
          (trader) => new Date(trader.createdAt) >= filterDate
        );
      }

      setFilteredPendingTraders(filteredPending);

      // Filter all traders
      let filteredAll = allTraders.filter(
        (trader) =>
          trader.businessName?.toLowerCase().includes(term) ||
          trader.email?.toLowerCase().includes(term) ||
          trader.User?.firstName?.toLowerCase().includes(term) ||
          trader.User?.lastName?.toLowerCase().includes(term) ||
          trader.User?.name?.toLowerCase().includes(term)
      );

      // Apply status filter for all traders
      if (statusFilter !== "all") {
        filteredAll = filteredAll.filter(
          (trader) => trader.status === statusFilter
        );
      }

      // Apply date filter for all traders
      if (dateFilter !== "all") {
        const filterDate = new Date();
        if (dateFilter === "today") {
          filterDate.setHours(0, 0, 0, 0);
        } else if (dateFilter === "week") {
          filterDate.setDate(filterDate.getDate() - 7);
        } else if (dateFilter === "month") {
          filterDate.setMonth(filterDate.getMonth() - 1);
        }

        filteredAll = filteredAll.filter(
          (trader) => new Date(trader.createdAt) >= filterDate
        );
      }

      setFilteredAllTraders(filteredAll);

      // Filter violations
      let filteredViol = violations.filter(
        (violation) =>
          violation.traderName?.toLowerCase().includes(term) ||
          violation.reason?.toLowerCase().includes(term) ||
          violation.type?.toLowerCase().includes(term)
      );

      // Apply date filter for violations
      if (dateFilter !== "all") {
        const filterDate = new Date();
        if (dateFilter === "today") {
          filterDate.setHours(0, 0, 0, 0);
        } else if (dateFilter === "week") {
          filterDate.setDate(filterDate.getDate() - 7);
        } else if (dateFilter === "month") {
          filterDate.setMonth(filterDate.getMonth() - 1);
        }

        filteredViol = filteredViol.filter(
          (violation) => new Date(violation.createdAt) >= filterDate
        );
      }

      setFilteredViolations(filteredViol);
    };

    filterData();
  }, [
    searchTerm,
    pendingTraders,
    allTraders,
    violations,
    statusFilter,
    dateFilter,
  ]);

  const fetchAdminData = async () => {
    // Fetch products for admin management
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data?.products || []);
        setFilteredProducts(data.data?.products || []);
      }
    } catch (err) {
      console.error("Error fetching products for admin:", err);
    }
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      console.log("🔍 Fetching admin dashboard data...");

      // Fetch main admin dashboard data
      const dashboardResponse = await fetch(
        "http://localhost:5001/api/admin/dashboard",
        { headers }
      );

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        console.log("📊 Admin dashboard data:", dashboardData);

        if (dashboardData.success && dashboardData.data) {
          setStats(dashboardData.data.stats || {});

          // For now, create mock data for pending traders since we have stats
          const mockPendingTraders = [];
          for (
            let i = 0;
            i < (dashboardData.data.stats.pendingTraders || 0);
            i++
          ) {
            mockPendingTraders.push({
              id: i + 1,
              businessName: `Pending Trader ${i + 1}`,
              email: `trader${i + 1}@pending.com`,
              User: {
                firstName: `Trader`,
                lastName: `${i + 1}`,
                name: `Trader ${i + 1}`,
              },
              createdAt: new Date().toISOString(),
              status: "pending",
            });
          }
          setPendingTraders(mockPendingTraders);
          setFilteredPendingTraders(mockPendingTraders);

          // Create mock data for all traders
          const mockAllTraders = [];
          for (
            let i = 0;
            i < (dashboardData.data.stats.totalTraders || 0);
            i++
          ) {
            mockAllTraders.push({
              id: i + 1,
              businessName: `Trader Shop ${i + 1}`,
              email: `trader${i + 1}@approved.com`,
              User: {
                firstName: `Trader`,
                lastName: `${i + 1}`,
                name: `Trader ${i + 1}`,
              },
              status:
                i < (dashboardData.data.stats.pendingTraders || 0)
                  ? "pending"
                  : "approved",
              createdAt: new Date().toISOString(),
              violations: Math.floor(Math.random() * 3),
            });
          }
          setAllTraders(mockAllTraders);
          setFilteredAllTraders(mockAllTraders);

          // Create mock violations data
          const mockViolations = [];
          for (
            let i = 0;
            i < (dashboardData.data.stats.totalViolations || 0);
            i++
          ) {
            mockViolations.push({
              id: i + 1,
              traderName: `Trader ${i + 1}`,
              type: ["quality", "shipping", "description"][
                Math.floor(Math.random() * 3)
              ],
              description: `Violation description for case ${i + 1}`,
              status: "active",
              createdAt: new Date().toISOString(),
              severity: ["low", "medium", "high"][
                Math.floor(Math.random() * 3)
              ],
            });
          }
          setViolations(mockViolations);
          setFilteredViolations(mockViolations);
        }
      } else {
        console.error(
          "❌ Failed to fetch admin dashboard:",
          dashboardResponse.status
        );
      }
    } catch (error) {
      console.error("❌ Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveTrader = async (traderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5001/api/admin/traders/${traderId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        await fetchAdminData(); // Refresh data
        alert("Trader approved successfully!");
      } else {
        alert("Failed to approve trader");
      }
    } catch (error) {
      console.error("Error approving trader:", error);
      alert("Error approving trader");
    }
  };

  const rejectTrader = async (traderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5001/api/admin/traders/${traderId}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        await fetchAdminData(); // Refresh data
        alert("Trader rejected successfully!");
      } else {
        alert("Failed to reject trader");
      }
    } catch (error) {
      console.error("Error rejecting trader:", error);
      alert("Error rejecting trader");
    }
  };

  const addViolation = async (traderId, reason) => {
    const violationReason = prompt("Enter violation reason:", reason || "");
    if (!violationReason) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5001/api/admin/traders/${traderId}/violation`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: violationReason }),
        }
      );

      if (response.ok) {
        await fetchAdminData(); // Refresh data
        alert("Violation added successfully!");
      } else {
        alert("Failed to add violation");
      }
    } catch (error) {
      console.error("Error adding violation:", error);
      alert("Error adding violation");
    }
  };

  const toggleTraderStatus = async (traderId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    const action = newStatus === "active" ? "enable" : "disable";

    if (!confirm(`Are you sure you want to ${action} this trader?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5001/api/admin/traders/${traderId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        await fetchAdminData(); // Refresh data
        alert(`Trader ${action}d successfully!`);
      } else {
        alert(`Failed to ${action} trader`);
      }
    } catch (error) {
      console.error(`Error ${action}ing trader:`, error);
      alert(`Error ${action}ing trader`);
    }
  };

  // Export functionality
  // Product status toggle (approve/disable)
  const toggleProductStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus ? false : true;
    if (
      !window.confirm(
        `Are you sure you want to ${
          newStatus ? "approve" : "disable"
        } this product?`
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5001/api/admin/products/${productId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: newStatus }),
        }
      );
      if (res.ok) {
        await fetchAdminData();
        alert(`Product ${newStatus ? "approved" : "disabled"} successfully!`);
      } else {
        alert("Failed to update product status");
      }
    } catch (err) {
      alert("Error updating product status");
    }
  };
  const exportData = () => {
    let dataToExport = [];
    let filename = "";

    if (activeTab === "pending") {
      dataToExport = filteredPendingTraders.map((trader) => ({
        Name: trader.User?.name || "",
        Email: trader.User?.email || "",
        BusinessName: trader.businessName || "",
        Applied: new Date(trader.createdAt).toLocaleDateString(),
        Status: "Pending",
      }));
      filename = "pending_traders.csv";
    } else if (activeTab === "traders") {
      dataToExport = filteredAllTraders.map((trader) => ({
        Name: trader.User?.name || "",
        Email: trader.User?.email || "",
        BusinessName: trader.businessName || "",
        Status: trader.status,
        Violations: trader.violationCount || 0,
        Shops: trader.Shops?.length || 0,
        Joined: new Date(trader.createdAt).toLocaleDateString(),
      }));
      filename = "all_traders.csv";
    } else {
      dataToExport = filteredViolations.map((violation) => ({
        TraderName: violation.traderName || "",
        Reason: violation.reason || "",
        Type: violation.type || "",
        Date: new Date(violation.createdAt).toLocaleDateString(),
      }));
      filename = "violations.csv";
    }

    if (dataToExport.length === 0) {
      alert("No data to export");
      return;
    }

    // Convert to CSV
    const headers = Object.keys(dataToExport[0]);
    const csvContent = [
      headers.join(","),
      ...dataToExport.map((row) =>
        headers.map((header) => `"${row[header]}"`).join(",")
      ),
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage traders, monitor violations, and oversee the platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Traders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalTraders}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalProducts}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOrders}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Management Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending Approval ({filteredPendingTraders.length})
            </button>
            <button
              onClick={() => setActiveTab("traders")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "traders"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Traders ({filteredAllTraders.length})
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "products"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Products ({filteredProducts.length})
            </button>
            <button
              onClick={() => setActiveTab("violations")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "violations"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Violations ({filteredViolations.length})
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "categories"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "orders"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "transactions"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Transactions
            </button>
          </nav>
        </div>

        {/* Category Management */}
        {activeTab === "categories" && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Category Management
            </h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add new category..."
                  className="border px-3 py-2 rounded-md text-sm"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                  Add
                </button>
              </div>
              {/* List categories here - integrate with backend */}
              <div className="mt-4">
                No categories found. (Integrate with backend /api/categories for
                real data)
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Order Details
            </h3>
            {/* List orders here - integrate with backend */}
            <div>
              No orders found. (Integrate with backend /api/orders for real
              data)
            </div>
          </div>
        )}

        {/* Transaction Overview */}
        {activeTab === "transactions" && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Main Transaction Details
            </h3>
            {/* List transactions, refunds, loyalty points here - integrate with backend */}
            <div>
              No transactions found. (Integrate with backend /api/transactions
              for real data)
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending Approval ({filteredPendingTraders.length})
            </button>
            <button
              onClick={() => setActiveTab("traders")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "traders"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Traders ({filteredAllTraders.length})
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "products"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Products ({filteredProducts.length})
            </button>
            <button
              onClick={() => setActiveTab("violations")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "violations"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Violations ({filteredViolations.length})
            </button>
          </nav>
        </div>

        {/* Search Bar and Filters */}
        <div className="mb-6 space-y-4">
          {/* Main Search Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${
                  activeTab === "pending"
                    ? "pending traders"
                    : activeTab === "traders"
                    ? "traders"
                    : "violations"
                }...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-300 bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-5 h-5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>

              <button
                onClick={exportData}
                className="inline-flex items-center px-4 py-3 border border-primary-500 rounded-lg text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 focus:ring-2 focus:ring-primary-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex flex-wrap gap-4">
                {activeTab === "traders" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date Range
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setDateFilter("all");
                    }}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Results Summary */}
          {(searchTerm || statusFilter !== "all" || dateFilter !== "all") && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <p className="text-sm text-blue-700">
                Showing{" "}
                {activeTab === "pending"
                  ? filteredPendingTraders.length
                  : activeTab === "traders"
                  ? filteredAllTraders.length
                  : filteredViolations.length}{" "}
                filtered results
                {searchTerm && (
                  <span className="font-medium"> for "{searchTerm}"</span>
                )}
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setDateFilter("all");
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Content based on active tab */}
        {activeTab === "products" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Product Management
              </h3>
              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="border px-3 py-2 rounded-md text-sm"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shop
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trader
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4">{product.name}</td>
                        <td className="px-6 py-4">{product.sku}</td>
                        <td className="px-6 py-4">{product.shop}</td>
                        <td className="px-6 py-4">{product.trader}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.isActive ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className={`px-3 py-1 rounded ${
                              product.isActive
                                ? "bg-red-500 text-white"
                                : "bg-green-500 text-white"
                            }`}
                            onClick={() =>
                              toggleProductStatus(product.id, product.isActive)
                            }
                          >
                            {product.isActive ? "Disable" : "Approve"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === "pending" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Pending Trader Approvals
                {searchTerm && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({filteredPendingTraders.length} of {pendingTraders.length}{" "}
                    shown)
                  </span>
                )}
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredPendingTraders.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  {searchTerm
                    ? "No traders found matching your search"
                    : "No pending trader applications"}
                </div>
              ) : (
                <div>
                  {filteredPendingTraders.map((trader) => (
                    <div key={trader.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {trader.User?.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {trader.User?.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            Applied:{" "}
                            {new Date(trader.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveTrader(trader.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => rejectTrader(trader.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "traders" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                All Traders
                {searchTerm && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({filteredAllTraders.length} of {allTraders.length} shown)
                  </span>
                )}
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredAllTraders.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  {searchTerm
                    ? "No traders found matching your search"
                    : "No traders found"}
                </div>
              ) : (
                filteredAllTraders.map((trader) => (
                  <div key={trader.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {trader.User?.name}
                          </h4>
                          <span
                            className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              trader.status === "active"
                                ? "bg-green-100 text-green-800"
                                : trader.status === "disabled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {trader.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {trader.User?.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          Violations: {trader.violationCount || 0} | Shops:{" "}
                          {trader.Shops?.length || 0} | Joined:{" "}
                          {new Date(trader.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => addViolation(trader.id)}
                          className="inline-flex items-center px-3 py-1 border border-orange-500 text-sm font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100"
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Add Violation
                        </button>
                        <button
                          onClick={() =>
                            toggleTraderStatus(trader.id, trader.status)
                          }
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white ${
                            trader.status === "active"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {trader.status === "active" ? (
                            <>
                              <Ban className="w-4 h-4 mr-1" />
                              Disable
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Enable
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "violations" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Violations
                {searchTerm && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({filteredViolations.length} of {violations.length} shown)
                  </span>
                )}
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredViolations.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  {searchTerm
                    ? "No violations found matching your search"
                    : "No violations recorded"}
                </div>
              ) : (
                filteredViolations.map((violation, index) => (
                  <div key={index} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {violation.traderName}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {violation.reason}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(violation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Violation
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
