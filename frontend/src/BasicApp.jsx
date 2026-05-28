import React from "react";

const BasicApp = () => {
  const [currentPage, setCurrentPage] = React.useState("home");

  const navStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "1rem",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const linkStyle = {
    color: "white",
    textDecoration: "none",
    margin: "0 10px",
    cursor: "pointer",
    padding: "5px 10px",
    borderRadius: "5px",
  };

  const pageStyle = {
    padding: "2rem",
    minHeight: "80vh",
    fontFamily: "Arial, sans-serif",
  };

  const HomePage = () => (
    <div style={pageStyle}>
      <div
        style={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          padding: "3rem",
          borderRadius: "20px",
          color: "white",
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ fontSize: "3rem", margin: "0 0 1rem 0" }}>
          🛒 Binda Trade
        </h1>
        <p style={{ fontSize: "1.5rem", margin: 0 }}>
          Multi-Vendor E-commerce Platform
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            border: "1px solid #e0e0e0",
          }}
        >
          <h3 style={{ color: "#333", marginTop: 0 }}>🛍️ Shop Products</h3>
          <p style={{ color: "#666" }}>Browse thousands of products</p>
          <button
            onClick={() => setCurrentPage("products")}
            style={{
              background: "#007bff",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Browse Products
          </button>
        </div>

        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            border: "1px solid #e0e0e0",
          }}
        >
          <h3 style={{ color: "#333", marginTop: 0 }}>🛒 Shopping Cart</h3>
          <p style={{ color: "#666" }}>Review your items</p>
          <button
            onClick={() => setCurrentPage("cart")}
            style={{
              background: "#28a745",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            View Cart
          </button>
        </div>

        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            border: "1px solid #e0e0e0",
          }}
        >
          <h3 style={{ color: "#333", marginTop: 0 }}>👤 Account</h3>
          <p style={{ color: "#666" }}>Login to your account</p>
          <button
            onClick={() => setCurrentPage("login")}
            style={{
              background: "#6f42c1",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );

  const ProductsPage = () => (
    <div style={pageStyle}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>🛍️ Products</h1>
      <div
        style={{
          background: "#f8f9fa",
          padding: "2rem",
          borderRadius: "15px",
          textAlign: "center",
          border: "1px solid #e0e0e0",
        }}
      >
        <h3>Products Coming Soon!</h3>
        <p>Backend connection needed to display products</p>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            marginTop: "2rem",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "1rem",
              borderRadius: "10px",
              width: "200px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                background: "#ddd",
                height: "120px",
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            ></div>
            <h4>Sample Product 1</h4>
            <p>$99.99</p>
          </div>
          <div
            style={{
              background: "white",
              padding: "1rem",
              borderRadius: "10px",
              width: "200px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                background: "#ddd",
                height: "120px",
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            ></div>
            <h4>Sample Product 2</h4>
            <p>$149.99</p>
          </div>
        </div>
      </div>
    </div>
  );

  const CartPage = () => (
    <div style={pageStyle}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
        🛒 Shopping Cart
      </h1>
      <div
        style={{
          background: "#f8f9fa",
          padding: "2rem",
          borderRadius: "15px",
          textAlign: "center",
          border: "1px solid #e0e0e0",
        }}
      >
        <h3>Your cart is empty</h3>
        <p>Add some products to get started!</p>
        <button
          onClick={() => setCurrentPage("products")}
          style={{
            background: "#28a745",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Shop Now
        </button>
      </div>
    </div>
  );

  const LoginPage = () => (
    <div
      style={{
        padding: "2rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "3rem",
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
          border: "1px solid #e0e0e0",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>👤 Login</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="email"
            placeholder="Email"
            style={{
              padding: "1rem",
              border: "2px solid #e9ecef",
              borderRadius: "10px",
              fontSize: "1rem",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            style={{
              padding: "1rem",
              border: "2px solid #e9ecef",
              borderRadius: "10px",
              fontSize: "1rem",
            }}
          />
          <button
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              padding: "1rem",
              border: "none",
              borderRadius: "10px",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </div>
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          Don't have an account?{" "}
          <span style={{ color: "#667eea", cursor: "pointer" }}>Sign up</span>
        </p>
      </div>
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case "products":
        return <ProductsPage />;
      case "cart":
        return <CartPage />;
      case "login":
        return <LoginPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <nav style={navStyle}>
        <h1 style={{ margin: 0 }}>Binda Trade</h1>
        <div>
          <span onClick={() => setCurrentPage("home")} style={linkStyle}>
            Home
          </span>
          <span onClick={() => setCurrentPage("products")} style={linkStyle}>
            Products
          </span>
          <span onClick={() => setCurrentPage("cart")} style={linkStyle}>
            Cart
          </span>
          <span onClick={() => setCurrentPage("login")} style={linkStyle}>
            Login
          </span>
        </div>
      </nav>
      {renderPage()}
    </div>
  );
};

export default BasicApp;
