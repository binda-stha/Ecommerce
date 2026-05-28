import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";
import { Toaster } from "react-hot-toast";

// Components
import Navbar from "./components/Navbar";
import Home from "./pages/NewHome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import TraderDashboard from "./pages/TraderDashboard";
import FeatureTest from "./pages/FeatureTest";
import UIDebug from "./pages/UIDebug";
import ConnectionTest from "./pages/ConnectionTest";
import SimpleTest from "./pages/SimpleTest";
import ProductsApiTest from "./pages/ProductsApiTest";
import ProductsSimple from "./pages/ProductsSimple";
import RegistrationTest from "./pages/RegistrationTest";
import SimpleRegister from "./pages/SimpleRegister";
import MinimalRegister from "./pages/MinimalRegister";
import OrderHistory from "./pages/OrderHistory";
import Wishlist from "./pages/Wishlist";

// Context for authentication
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <Navbar />
          <Toaster position="top-right" />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />

              {/* Customer/Trader Authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/simple-register" element={<SimpleRegister />} />
              <Route path="/minimal-register" element={<MinimalRegister />} />

              {/* Admin Authentication */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              {/* Main Application Routes */}
              <Route path="/products" element={<ProductsSimple />} />
              <Route path="/products-full" element={<Products />} />
              <Route path="/products-test" element={<ProductsApiTest />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/dashboard/*" element={<Dashboard />} />

              {/* Order History & Wishlist */}
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/wishlist" element={<Wishlist />} />

              {/* Test Routes */}
              <Route path="/test" element={<FeatureTest />} />
              <Route path="/ui-debug" element={<UIDebug />} />
              <Route path="/connection-test" element={<ConnectionTest />} />
              <Route path="/simple-test" element={<SimpleTest />} />
              <Route path="/registration-test" element={<RegistrationTest />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
