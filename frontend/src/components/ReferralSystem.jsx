import React, { useState, useEffect } from "react";
import { Users, Gift, ExternalLink, Copy, Check } from "lucide-react";

const ReferralSystem = ({ user }) => {
  const [referralCode, setReferralCode] = useState("");
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
  });
  const [referralHistory, setReferralHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [amazonProducts, setAmazonProducts] = useState([]);
  const [alibabaProducts, setAlibabaProducts] = useState([]);

  useEffect(() => {
    // Generate referral code based on user
    if (user) {
      const code = `BP${user.firstName.substring(0, 2).toUpperCase()}${
        user.id
      }${Date.now().toString().slice(-4)}`;
      setReferralCode(code);
      loadReferralData();
      loadExternalProducts();
    }
  }, [user]);

  const loadReferralData = async () => {
    try {
      // Mock data - replace with actual API call
      setReferralStats({
        totalReferrals: 5,
        activeReferrals: 3,
        totalEarnings: 2500,
        pendingEarnings: 750,
      });

      setReferralHistory([
        {
          id: 1,
          referredUser: "John Doe",
          joinDate: "2024-01-15",
          status: "Active",
          earning: 500,
          orders: 3,
        },
        {
          id: 2,
          referredUser: "Jane Smith",
          joinDate: "2024-01-20",
          status: "Active",
          earning: 750,
          orders: 5,
        },
      ]);
    } catch (error) {
      console.error("Error loading referral data:", error);
    }
  };

  const loadExternalProducts = async () => {
    // Mock external products - in real app, integrate with Amazon/Alibaba APIs
    setAmazonProducts([
      {
        id: "amz1",
        title: "Wireless Bluetooth Headphones",
        price: "$29.99",
        rating: 4.5,
        commission: "8%",
        image: "/api/placeholder/150/150",
        link: "https://amazon.com/product/1",
      },
      {
        id: "amz2",
        title: "Smart Fitness Tracker",
        price: "$49.99",
        rating: 4.3,
        commission: "6%",
        image: "/api/placeholder/150/150",
        link: "https://amazon.com/product/2",
      },
    ]);

    setAlibabaProducts([
      {
        id: "ali1",
        title: "LED Strip Lights 5m",
        price: "$12.99",
        rating: 4.2,
        commission: "10%",
        image: "/api/placeholder/150/150",
        link: "https://alibaba.com/product/1",
      },
      {
        id: "ali2",
        title: "Phone Case Set",
        price: "$8.99",
        rating: 4.4,
        commission: "12%",
        image: "/api/placeholder/150/150",
        link: "https://alibaba.com/product/2",
      },
    ]);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferralLink = (platform) => {
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    const message = `Join Binda Ecommerce using my referral code ${referralCode} and get special benefits!`;

    switch (platform) {
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            message + " " + referralLink
          )}`
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            referralLink
          )}`
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            message
          )}&url=${encodeURIComponent(referralLink)}`
        );
        break;
      default:
        break;
    }
  };

  const generateReferralLink = (productLink, platform) => {
    // Add referral tracking to external links
    const referralParam = `?ref=${referralCode}&source=bptrade&platform=${platform}`;
    return productLink + referralParam;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
            <p className="text-purple-100">
              Share Binda Ecommerce with friends and earn rewards from every
              purchase!
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              ₹{referralStats.totalEarnings}
            </div>
            <div className="text-purple-200 text-sm">Total Earnings</div>
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Gift className="w-6 h-6 mr-2 text-purple-600" />
          Your Referral Code
        </h2>

        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-mono font-bold text-purple-600">
              {referralCode}
            </div>
            <button
              onClick={copyReferralCode}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                copied
                  ? "bg-green-100 text-green-600"
                  : "bg-purple-100 text-purple-600 hover:bg-purple-200"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => shareReferralLink("whatsapp")}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Share on WhatsApp
            </button>
            <button
              onClick={() => shareReferralLink("facebook")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Share on Facebook
            </button>
            <button
              onClick={() => shareReferralLink("twitter")}
              className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
            >
              Share on Twitter
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {referralStats.totalReferrals}
          </div>
          <div className="text-gray-600">Total Referrals</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {referralStats.activeReferrals}
          </div>
          <div className="text-gray-600">Active Referrals</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            ₹{referralStats.totalEarnings}
          </div>
          <div className="text-gray-600">Total Earnings</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            ₹{referralStats.pendingEarnings}
          </div>
          <div className="text-gray-600">Pending Earnings</div>
        </div>
      </div>

      {/* Amazon Products */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <ExternalLink className="w-6 h-6 mr-2 text-orange-600" />
          Amazon Products
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {amazonProducts.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {product.title}
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-green-600">
                      {product.price}
                    </span>
                    <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-sm">
                      {product.commission} commission
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-yellow-500">
                      {"★".repeat(Math.floor(product.rating))} {product.rating}
                    </div>
                    <a
                      href={generateReferralLink(product.link, "amazon")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-orange-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-orange-700 transition-colors"
                    >
                      Share & Earn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alibaba Products */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <ExternalLink className="w-6 h-6 mr-2 text-blue-600" />
          Alibaba Products
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alibabaProducts.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {product.title}
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-green-600">
                      {product.price}
                    </span>
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm">
                      {product.commission} commission
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-yellow-500">
                      {"★".repeat(Math.floor(product.rating))} {product.rating}
                    </div>
                    <a
                      href={generateReferralLink(product.link, "alibaba")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Share & Earn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Users className="w-6 h-6 mr-2 text-green-600" />
          Referral History
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-semibold text-gray-700">
                  Referred User
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Join Date
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Orders
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Earnings
                </th>
              </tr>
            </thead>
            <tbody>
              {referralHistory.map((referral) => (
                <tr key={referral.id} className="border-b border-gray-100">
                  <td className="p-4 font-medium text-gray-800">
                    {referral.referredUser}
                  </td>
                  <td className="p-4 text-gray-600">{referral.joinDate}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        referral.status === "Active"
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {referral.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{referral.orders}</td>
                  <td className="p-4 font-semibold text-green-600">
                    ₹{referral.earning}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReferralSystem;
