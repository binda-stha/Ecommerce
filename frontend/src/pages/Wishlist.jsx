import React, { useEffect, useState } from "react";
import axios from "axios";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlist(res.data.wishlist || []);
      } catch (err) {
        setError("Failed to fetch wishlist");
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  if (loading) return <div className="p-4">Loading wishlist...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Wishlist</h2>
      {wishlist.length === 0 ? (
        <div>No wishlist items found.</div>
      ) : (
        <ul className="space-y-4">
          {wishlist.map((item) => (
            <li
              key={item.id}
              className="border p-4 rounded shadow flex items-center"
            >
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="w-16 h-16 object-cover mr-4"
              />
              <div>
                <div className="font-semibold">{item.productName}</div>
                <div>Price: ₹{item.price}</div>
                <div>Shop: {item.shopName}</div>
                <div>Trader: {item.traderName}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Wishlist;
