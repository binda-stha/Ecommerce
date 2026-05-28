import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Store,
  Package,
  TrendingUp,
  Users,
  AlertTriangle,
  Eye,
  ToggleLeft,
  ToggleRight,
  Plus,
  Edit,
  BarChart3,
} from "lucide-react";
import { toast } from "react-hot-toast";

const TraderDashboard = () => {
  // ...existing code...
  // Logout handler: only this should log out the user
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("traderDashboardData");
    window.location.href = "/login";
  };
  const deleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/trader/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchDashboardData();
        alert("Product deleted");
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      alert("Error deleting product");
    }
  };

  // Tabs array for navigation
  const tabs = [
    { id: "shops", label: "My Shops", icon: Store },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Order List", icon: TrendingUp },
    { id: "orderHistory", label: "Order History", icon: TrendingUp },
    { id: "profile", label: "Profile", icon: Users },
    { id: "customer", label: "Customer Profile", icon: Users },
  ];
  const [dashboardData, setDashboardData] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
    image: "",
  });
  const [addProductLoading, setAddProductLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("shops");
  const [loading, setLoading] = useState(true);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  // Add missing state for Edit Profile Modal
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    name: "",
    email: "",
    avatar: "",
  });
  const [editProfileLoading, setEditProfileLoading] = useState(false);

  // Sync editProfileData with customerProfile when modal opens
  useEffect(() => {
    if (showEditProfile && customerProfile) {
      setEditProfileData({
        name: customerProfile.name || "",
        email: customerProfile.email || "",
        avatar: customerProfile.avatar || "",
      });
    }
  }, [showEditProfile, customerProfile]);

  useEffect(() => {
    // Restore dashboardData from localStorage if available
    const storedDashboard = localStorage.getItem("traderDashboardData");
    if (storedDashboard) {
      setDashboardData(JSON.parse(storedDashboard));
    }
    fetchDashboardData();
    fetchOrderHistory();
    fetchCustomerProfile();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/trader/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        // Token invalid or expired, force logout
        localStorage.removeItem("token");
        localStorage.removeItem("traderDashboardData");
        window.location.href = "/login";
        return;
      }
      const data = await response.json();
      // Use new backend response structure
      if (data && data.data) {
        const d = data.data;
        const dashboardObj = {
          shops: d.shops || [],
          recentOrders: d.recentOrders || [],
          totalOrders: d.totalOrders || 0,
          totalRevenue: d.totalRevenue || 0,
          totalSpent: d.totalSpent || 0,
          referrals: d.referrals || 0,
          rating: d.rating || 0,
          violations: d.violations || 0,
          products: [], // You may want to fetch products separately if needed
        };
        setDashboardData(dashboardObj);
        localStorage.setItem(
          "traderDashboardData",
          JSON.stringify(dashboardObj)
        );
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer profile info
  const fetchCustomerProfile = async () => {
    setCustomerLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/customer/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.customer) {
        setCustomerProfile(data.customer);
      } else {
        setCustomerProfile(null);
      }
    } catch (error) {
      setCustomerProfile(null);
    } finally {
      setCustomerLoading(false);
    }
  };

  // Fetch real checkout history for trader
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);
  const fetchOrderHistory = async () => {
    setOrderHistoryLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/trader/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrderHistory(data.orders);
      } else {
        setOrderHistory([]);
      }
    } catch (error) {
      setOrderHistory([]);
    } finally {
      setOrderHistoryLoading(false);
    }
  };

  // Call this after successful checkout to refresh order history
  const handleCheckoutSuccess = () => {
    fetchOrderHistory();
  };
  // Remove duplicate state and hooks

  // ...existing code...

  // The rest of your component logic

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Logout Menu Button (add to header) */}
      <div className="absolute top-6 right-8">
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Trader Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Manage your shops and products
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Stat Cards removed (overview and mock data) */}
      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  selectedTab === tab.id
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      {/* Tab Content */}
      {/* Customer Profile Tab */}
      {selectedTab === "customer" && (
        <div className="bg-white dark:bg-gray-800 shadow-card rounded-2xl overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Customer Profile
            </h3>
            {customerProfile && (
              <button
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200"
                onClick={() => setShowEditProfile(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
          {customerLoading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : customerProfile ? (
            <div className="p-6 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0">
                <img
                  src={customerProfile.avatar || "/api/placeholder/80x80"}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary-500 mb-4"
                />
              </div>
              <div className="flex-1">
                <div className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                  {customerProfile.name}
                </div>
                <div className="mb-2 text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Email:</span>{" "}
                  {customerProfile.email}
                </div>
                <div className="mb-2 text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Points:</span>{" "}
                  {customerProfile.points}
                </div>
                <div className="mb-2 text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Joined:</span>{" "}
                  {new Date(customerProfile.createdAt).toLocaleDateString()}
                </div>
                {/* Add more customer info fields as needed */}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No customer info found.
            </div>
          )}
          {/* Edit Profile Modal */}
          {showEditProfile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setEditProfileLoading(true);
                    try {
                      const token = localStorage.getItem("token");
                      const res = await fetch("/api/customer/profile", {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(editProfileData),
                      });
                      if (res.ok) {
                        setShowEditProfile(false);
                        await fetchCustomerProfile();
                        toast.success("Profile updated successfully");
                        // DO NOT LOGOUT OR CLEAR TOKEN
                      } else {
                        toast.error("Failed to update profile");
                      }
                    } catch (err) {
                      toast.error("Error updating profile");
                    } finally {
                      setEditProfileLoading(false);
                    }
                  }}
                >
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full mb-2 p-2 border rounded"
                    value={editProfileData.name}
                    onChange={(e) =>
                      setEditProfileData({
                        ...editProfileData,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-2 p-2 border rounded"
                    value={editProfileData.email}
                    onChange={(e) =>
                      setEditProfileData({
                        ...editProfileData,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Avatar URL"
                    className="w-full mb-2 p-2 border rounded"
                    value={editProfileData.avatar}
                    onChange={(e) =>
                      setEditProfileData({
                        ...editProfileData,
                        avatar: e.target.value,
                      })
                    }
                  />
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-300 rounded"
                      onClick={() => setShowEditProfile(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-500 text-white rounded"
                      disabled={editProfileLoading}
                    >
                      {editProfileLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
      {/* ...existing code... */}
      {selectedTab === "shops" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardData?.shops?.map((shop, index) => (
            <ShopCard key={index} shop={shop} />
          ))}
        </div>
      )}
      {/* ...other tab content... */}
      {selectedTab === "products" && (
        <div className="bg-white dark:bg-gray-800 shadow-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              All Products
            </h3>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search by name or SKU..."
                className="w-full md:w-64 p-2 border rounded"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              <button
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2"
                onClick={() => setShowAddProduct(true)}
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {(dashboardData?.products || [])
                  .filter((product) => {
                    if (!productSearch.trim()) return true;
                    const term = productSearch.trim().toLowerCase();
                    return (
                      product.name.toLowerCase().includes(term) ||
                      product.sku.toLowerCase().includes(term)
                    );
                  })
                  .map((product) => (
                    <ProductRow key={product.id} product={product} />
                  ))}
              </tbody>
            </table>
          </div>
          {/* Add Product Modal */}
          {showAddProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add New Product</h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setAddProductLoading(true);
                    try {
                      const res = await fetch("/api/traders/products", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newProduct),
                      });
                      if (res.ok) {
                        setShowAddProduct(false);
                        setNewProduct({
                          name: "",
                          sku: "",
                          price: "",
                          stock: "",
                          image: "",
                        });
                        fetchDashboardData();
                      } else {
                        alert("Failed to add product");
                      }
                    } catch (err) {
                      alert("Error adding product");
                    } finally {
                      setAddProductLoading(false);
                    }
                  }}
                >
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full mb-2 p-2 border rounded"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="SKU"
                    className="w-full mb-2 p-2 border rounded"
                    value={newProduct.sku}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, sku: e.target.value })
                    }
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    className="w-full mb-2 p-2 border rounded"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    required
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    className="w-full mb-2 p-2 border rounded"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stock: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Image URL"
                    className="w-full mb-2 p-2 border rounded"
                    value={newProduct.image}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, image: e.target.value })
                    }
                  />
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-300 rounded"
                      onClick={() => setShowAddProduct(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-500 text-white rounded"
                      disabled={addProductLoading}
                    >
                      {addProductLoading ? "Adding..." : "Add Product"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Order History Tab for Trader (Checkout History) */}
      {selectedTab === "orderHistory" && (
        <div className="bg-white dark:bg-gray-800 shadow-card rounded-2xl overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Checkout History
            </h3>
          </div>
          <div className="overflow-x-auto">
            {orderHistoryLoading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {orderHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No checkout history found.
                      </td>
                    </tr>
                  ) : (
                    orderHistory.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4">{order.id}</td>
                        <td className="px-6 py-4">
                          {order.customerName || order.customerId}
                        </td>
                        <td className="px-6 py-4">₹{order.totalAmount}</td>
                        <td className="px-6 py-4">{order.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, change, color }) => {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card flex justify-between items-center"
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col justify-between flex-1">
        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
          {title}
        </h4>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {value}
        </p>
        {change && (
          <p
            className={`text-sm mt-1 ${
              change > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {change > 0 ? "+" : ""}
            {change}% from last month
          </p>
        )}
      </div>
      <div className={`p-3 rounded-2xl bg-${color}-100 dark:bg-${color}-900`}>
        <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
      </div>
    </motion.div>
  );
};

const ShopCard = ({ shop }) => {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-xl">
            <Store className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {shop.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {shop.products} products
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200">
          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Revenue
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ₹{shop.revenue.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full"
            style={{ width: `${(shop.products / 5) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {shop.products}/5 products used
        </p>
      </div>
    </motion.div>
  );
};

const ProductRow = ({ product }) => {
  return (
    <motion.tr
      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <img
            className="h-10 w-10 rounded-lg object-cover"
            src={product.image || "/api/placeholder/40x40"}
            alt={product.name}
          />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {product.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              SKU: {product.sku}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">
          ₹{product.price.toLocaleString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">
          {product.stock}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            product.isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {product.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleProductStatus(product.id, product.isActive)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            {product.isActive ? (
              <ToggleRight className="w-5 h-5" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
          </button>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
            <Eye className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ...existing code...

export default TraderDashboard;
