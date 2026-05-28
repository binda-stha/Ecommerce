import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ReferralSystem from "../components/ReferralSystem";
import ViolationManagement from "../components/ViolationManagement";
import PointsDisplay from "../components/PointsDisplay";
import {
  Users,
  ShoppingBag,
  Gift,
  AlertTriangle,
  TrendingUp,
  Star,
  Award,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Fetch real stats for customer overview
  React.useEffect(() => {
    if (activeTab === "overview" && user?.role === "customer") {
      setLoadingStats(true);
      const token = localStorage.getItem("token");
      fetch("/api/customer/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.stats) setStats(data.stats);
          else setStats(null);
        })
        .catch(() => setStats(null))
        .finally(() => setLoadingStats(false));
    }
  }, [activeTab, user]);

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "referrals", label: "Referrals", icon: Users },
    { id: "violations", label: "Reports", icon: AlertTriangle },
    { id: "profile", label: "Profile", icon: Award },
    { id: "editProfile", label: "Edit Profile", icon: Users },
    { id: "orderHistory", label: "Order History", icon: ShoppingBag },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "referrals":
        return <ReferralSystem user={user} />;
      case "violations":
        return <ViolationManagement userRole={user?.role} userId={user?.id} />;
      case "profile":
        return (
          <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl mt-8 border border-blue-200">
            <div className="flex items-center mb-6">
              <div className="bg-blue-600 rounded-full w-14 h-14 flex items-center justify-center mr-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.121 17.804A9.001 9.001 0 0112 15c2.21 0 4.21.805 5.879 2.146M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-blue-700">
                Profile Details
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 shadow flex items-center">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="font-semibold">Name:</span>
                <span className="ml-2">
                  {user?.name || `${user?.firstName} ${user?.lastName}`}
                </span>
              </div>
              <div className="bg-white rounded-xl p-4 shadow flex items-center">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 12v1a4 4 0 01-8 0v-1m8 0V8a4 4 0 00-8 0v4m8 0H8"
                  />
                </svg>
                <span className="font-semibold">Email:</span>
                <span className="ml-2">{user?.email}</span>
              </div>
              <div className="bg-white rounded-xl p-4 shadow flex items-center">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18V6a2 2 0 012-2h8a2 2 0 012 2v12"
                  />
                </svg>
                <span className="font-semibold">Role:</span>
                <span className="ml-2">{user?.role}</span>
              </div>
              {user?.phone && (
                <div className="bg-white rounded-xl p-4 shadow flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5h2a2 2 0 012 2v10a2 2 0 01-2 2H3m0-14h18m-18 0v14m18-14v14"
                    />
                  </svg>
                  <span className="font-semibold">Phone:</span>
                  <span className="ml-2">{user.phone}</span>
                </div>
              )}
              {user?.address && (
                <div className="bg-white rounded-xl p-4 shadow flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a2 2 0 00-2-2h-3m-4 0H7a2 2 0 00-2 2v2h5m0-2v2"
                    />
                  </svg>
                  <span className="font-semibold">Address:</span>
                  <span className="ml-2">{user.address}</span>
                </div>
              )}
              <div className="bg-white rounded-xl p-4 shadow flex items-center">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2z"
                  />
                </svg>
                <span className="font-semibold">Account ID:</span>
                <span className="ml-2">{user?.id}</span>
              </div>
            </div>
          </div>
        );
      case "editProfile":
        return (
          <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg mt-8">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">
              Edit Profile
            </h2>
            {/* Simple form for editing profile info */}
            <form className="space-y-4">
              <div>
                <label className="font-semibold">Name:</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  defaultValue={
                    user?.name || `${user?.firstName} ${user?.lastName}`
                  }
                />
              </div>
              <div>
                <label className="font-semibold">Email:</label>
                <input
                  type="email"
                  className="border rounded px-2 py-1 w-full"
                  defaultValue={user?.email}
                />
              </div>
              <div>
                <label className="font-semibold">Phone:</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  defaultValue={user?.phone || ""}
                />
              </div>
              <div>
                <label className="font-semibold">Address:</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  defaultValue={user?.address || ""}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save Changes
              </button>
            </form>
          </div>
        );
      case "orderHistory":
        // Real order history fetch and display
        const [orders, setOrders] = React.useState([]);
        const [ordersLoading, setOrdersLoading] = React.useState(false);
        React.useEffect(() => {
          setOrdersLoading(true);
          const token = localStorage.getItem("token");
          fetch("/api/orders", {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success && Array.isArray(data.orders))
                setOrders(data.orders);
              else setOrders([]);
            })
            .catch(() => setOrders([]))
            .finally(() => setOrdersLoading(false));
        }, []);
        return (
          <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg mt-8">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">
              Order History
            </h2>
            <div className="overflow-x-auto">
              {ordersLoading ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : orders.length === 0 ? (
                <div className="bg-gray-100 p-4 rounded text-center text-gray-500">
                  No orders found.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4">{order.id}</td>
                        <td className="px-6 py-4">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-6 py-4">₹{order.totalAmount}</td>
                        <td className="px-6 py-4">{order.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      default:
        return (
          <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.firstName}!
                  </h1>
                  <p className="text-blue-100">
                    Here's what's happening with your Binda Ecommerce account
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 rounded-xl p-4">
                    <Award className="w-8 h-8 mb-2" />
                    <div className="text-xl font-bold">{user?.role}</div>
                    <div className="text-blue-200 text-sm">Account Type</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid - Real Data */}
            {user?.role === "customer" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {loadingStats ? (
                  <div className="col-span-4 text-center text-gray-500">
                    Loading stats...
                  </div>
                ) : stats ? (
                  <>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {stats.totalOrders}
                          </div>
                          <div className="text-gray-600 text-sm">
                            Total Orders
                          </div>
                        </div>
                        <ShoppingBag className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            ₹{stats.totalSpent}
                          </div>
                          <div className="text-gray-600 text-sm">
                            Total Spent
                          </div>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {stats.referrals}
                          </div>
                          <div className="text-gray-600 text-sm">Referrals</div>
                        </div>
                        <Users className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-orange-600">
                            {stats.rating}
                          </div>
                          <div className="text-gray-600 text-sm">Rating</div>
                        </div>
                        <Star className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="col-span-4 text-center text-gray-500">
                    No stats found.
                  </div>
                )}
              </div>
            )}

            {/* Points Display */}
            <PointsDisplay />

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab("referrals")}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 rounded-xl hover:shadow-lg transition-all text-left"
                >
                  <Gift className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-1">Referral Program</h3>
                  <p className="text-sm text-purple-100">
                    Share and earn rewards
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab("violations")}
                  className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-xl hover:shadow-lg transition-all text-left"
                >
                  <AlertTriangle className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-1">Report Issues</h3>
                  <p className="text-sm text-red-100">Report violations</p>
                </button>

                <button
                  onClick={() => (window.location.href = "/products")}
                  className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6 rounded-xl hover:shadow-lg transition-all text-left"
                >
                  <ShoppingBag className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-1">Shop Now</h3>
                  <p className="text-sm text-green-100">Browse products</p>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default Dashboard;
