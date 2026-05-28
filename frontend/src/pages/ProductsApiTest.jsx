import React, { useState, useEffect } from "react";

const ProductsApiTest = () => {
  const [status, setStatus] = useState("Loading...");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log("🔍 Testing API connection...");
        const response = await fetch("http://localhost:5001/api/products");
        console.log("📡 Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📦 API Response:", data);

        if (data.success && data.data && data.data.products) {
          setProducts(data.data.products);
          setStatus(`✅ Success: ${data.data.products.length} products loaded`);
        } else {
          setStatus("⚠️ API responded but no products found");
        }
      } catch (err) {
        console.error("❌ API Error:", err);
        setError(err.message);
        setStatus("❌ API connection failed");
      }
    };

    testApi();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Products API Test</h1>
      <div style={{ marginBottom: "20px" }}>
        <strong>Status:</strong> {status}
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {products.length > 0 && (
        <div>
          <h2>Products ({products.length}):</h2>
          <div style={{ display: "grid", gap: "10px" }}>
            {products.slice(0, 5).map((product, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                <strong>{product.name}</strong> - ₹{product.price}
                <div style={{ fontSize: "12px", color: "#666" }}>
                  Category: {product.category}
                </div>
              </div>
            ))}
            {products.length > 5 && (
              <div style={{ color: "#666" }}>
                ... and {products.length - 5} more products
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsApiTest;
