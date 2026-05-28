import { Routes, Route } from "react-router-dom";
import "./App.css";

// Simple test components first
import SimpleTest from "./pages/SimpleTest";
import ConnectionTest from "./pages/ConnectionTest";

// Try a very simple navbar
const SimpleNavbar = () => {
  return (
    <nav
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "1rem",
        color: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>Binda Trade</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <a href="/" style={{ color: "white", textDecoration: "none" }}>
            Home
          </a>
          <a
            href="/products"
            style={{ color: "white", textDecoration: "none" }}
          >
            Products
          </a>
          <a href="/cart" style={{ color: "white", textDecoration: "none" }}>
            Cart
          </a>
          <a href="/login" style={{ color: "white", textDecoration: "none" }}>
            Login
          </a>
          <a
            href="/simple-test"
            style={{ color: "white", textDecoration: "none" }}
          >
            Test
          </a>
          <a
            href="/connection-test"
            style={{ color: "white", textDecoration: "none" }}
          >
            Connection
          </a>
        </div>
      </div>
    </nav>
  );
};

// Simple home component
const SimpleHome = () => {
  return (
    <div style={{ padding: "2rem", minHeight: "80vh" }}>
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
          marginTop: "2rem",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: "#333", marginTop: 0 }}>🛍️ Shop Products</h3>
          <p style={{ color: "#666" }}>
            Browse thousands of products from multiple vendors
          </p>
          <a
            href="/products"
            style={{
              background: "#007bff",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Browse Products
          </a>
        </div>

        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: "#333", marginTop: 0 }}>🛒 Shopping Cart</h3>
          <p style={{ color: "#666" }}>
            Review your selected items and checkout
          </p>
          <a
            href="/cart"
            style={{
              background: "#28a745",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            View Cart
          </a>
        </div>

        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: "#333", marginTop: 0 }}>👤 Account</h3>
          <p style={{ color: "#666" }}>
            Login to your account or create a new one
          </p>
          <a
            href="/login"
            style={{
              background: "#6f42c1",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

// Simple products component
const SimpleProducts = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>🛍️ Products</h1>
      <div
        style={{
          background: "#f8f9fa",
          padding: "2rem",
          borderRadius: "15px",
          textAlign: "center",
        }}
      >
        <h3>Products Loading...</h3>
        <p>Backend connection needed to display products</p>
        <a
          href="/connection-test"
          style={{
            background: "#007bff",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          Test Backend Connection
        </a>
      </div>
    </div>
  );
};

// Simple cart component
const SimpleCart = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
        🛒 Shopping Cart
      </h1>
      <div
        style={{
          background: "#f8f9fa",
          padding: "2rem",
          borderRadius: "15px",
          textAlign: "center",
        }}
      >
        <h3>Your cart is empty</h3>
        <p>Add some products to get started!</p>
        <a
          href="/products"
          style={{
            background: "#28a745",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          Shop Now
        </a>
      </div>
    </div>
  );
};

// Simple login component
const SimpleLogin = () => {
  return (
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
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>👤 Login</h2>
        <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
            type="submit"
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
        </form>
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          Don't have an account?{" "}
          <a href="/register" style={{ color: "#667eea" }}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App" style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <SimpleNavbar />
      <main>
        <Routes>
          <Route path="/" element={<SimpleHome />} />
          <Route path="/products" element={<SimpleProducts />} />
          <Route path="/cart" element={<SimpleCart />} />
          <Route path="/login" element={<SimpleLogin />} />
          <Route path="/simple-test" element={<SimpleTest />} />
          <Route path="/connection-test" element={<ConnectionTest />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
