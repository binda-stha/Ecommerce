import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import ApiService from "../services/api";

const ProductsSimple = () => {
  const { cart, addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 30 dummy products for fallback
  const dummyProducts = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    name: `Mock Product ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    sku: `SKU${String(i + 1).padStart(3, "0")}`,
    shop: `Shop ${["Alpha", "Beta", "Gamma", "Delta", "Epsilon"][i % 5]}`,
    price: 499 + i * 10,
    status: i % 2 === 0 ? "active" : "disabled",
    images: [],
  }));

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ApiService.fetchProducts();
        const productsArr =
          response.products || response.data?.products || response.data || [];
        // If no products or fetch fails, use dummy
        if (!productsArr || productsArr.length === 0) {
          setProducts(dummyProducts);
        } else {
          setProducts(productsArr);
        }
      } catch (err) {
        setProducts(dummyProducts);
        setError(null); // Don't show error if using dummy
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Loading products...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
        <h2>Error: {error}</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "16px" }}>
        Products <span style={{ color: "#3182ce" }}>({products.length})</span>
      </h1>
      {products.length === 0 ? (
        <p style={{ fontSize: "1.2rem", color: "#888" }}>
          No products available
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "28px",
            marginTop: "20px",
          }}
        >
          {products.map((product) => {
            // Use Unsplash random endpoint with product category as keyword (fallback to 'product')
            let imageUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(
              product.category || "product"
            )}`;
            if (
              product.images &&
              product.images[0] &&
              (product.images[0].startsWith("http://") ||
                product.images[0].startsWith("https://"))
            ) {
              imageUrl = product.images[0];
            }
            return (
              <div
                key={product.id}
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  border: "1px solid #e2e8f0",
                }}
              >
                <img
                  src={imageUrl}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    marginBottom: "16px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80";
                  }}
                />
                <h3
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  {product.name}
                </h3>
                <p
                  style={{
                    color: "#666",
                    fontSize: "14px",
                    margin: "5px 0",
                    textAlign: "center",
                  }}
                >
                  {product.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                    margin: "8px 0",
                  }}
                >
                  <span
                    style={{
                      background: "#e2e8f0",
                      color: "#2d3748",
                      borderRadius: "12px",
                      padding: "4px 12px",
                      fontSize: "12px",
                    }}
                  >
                    Category: {product.category}
                  </span>
                  <span
                    style={{
                      background: "#f6ad55",
                      color: "#fff",
                      borderRadius: "12px",
                      padding: "4px 12px",
                      fontSize: "12px",
                    }}
                  >
                    Rating: {product.rating || "N/A"}
                  </span>
                </div>
                <p
                  style={{
                    color: "#333",
                    fontSize: "14px",
                    margin: "5px 0",
                    textAlign: "center",
                  }}
                >
                  <span style={{ color: "#3182ce", fontWeight: 500 }}>
                    Trader:
                  </span>{" "}
                  {product.traderName || "Binda Ecommerce"}
                  <span
                    style={{
                      color: "#666",
                      fontSize: "13px",
                      marginLeft: "10px",
                    }}
                  >
                    | Shop: {product.shopName || "Unknown Shop"}
                  </span>
                </p>
                <p
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.3rem",
                    color: "#e53e3e",
                    margin: "10px 0",
                    textAlign: "center",
                  }}
                >
                  ₹{product.price ? product.price.toLocaleString() : "N/A"}
                </p>
                <button
                  onClick={() => addToCart(product)}
                  style={{
                    background: "linear-gradient(90deg,#3182ce,#2563eb)",
                    color: "white",
                    border: "none",
                    padding: "10px 24px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer",
                    width: "100%",
                    marginTop: "8px",
                    fontSize: "1rem",
                    boxShadow: "0 1px 4px rgba(49,130,206,0.08)",
                    transition: "background 0.2s",
                  }}
                >
                  Add to Cart
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductsSimple;
