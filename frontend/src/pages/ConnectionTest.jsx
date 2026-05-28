import React, { useState, useEffect } from "react";

const ConnectionTest = () => {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    testBackendConnection();
    fetchProducts();
  }, []);

  const testBackendConnection = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/health");
      if (response.ok) {
        const data = await response.json();
        setBackendStatus(`✅ Connected - ${data.message}`);
      } else {
        setBackendStatus(
          `❌ Backend responded with status: ${response.status}`
        );
      }
    } catch (error) {
      setBackendStatus(`❌ Cannot connect to backend: ${error.message}`);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      } else {
        setError(`Failed to fetch products: ${response.status}`);
      }
    } catch (error) {
      setError(`Error fetching products: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Backend Connection Test
          </h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Backend Status:</h2>
            <p className="text-lg font-mono bg-gray-100 p-3 rounded">
              {backendStatus}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-4">
              Products from Backend:
            </h2>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <h3 className="font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {product.description}
                    </p>
                    <p className="text-lg font-bold text-green-600 mt-2">
                      ₹{product.price}
                    </p>
                    <p className="text-sm text-gray-500">
                      Shop: {product.shop}
                    </p>
                    <p className="text-sm text-gray-500">
                      Category: {product.category}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No products loaded yet...</p>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={() => {
                testBackendConnection();
                fetchProducts();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              🔄 Refresh Connection Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;
