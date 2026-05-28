import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const RegistrationTest = () => {
  const { register } = useAuth();
  const [testData, setTestData] = useState({
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    password: "password123",
    confirmPassword: "password123",
    role: "customer",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log("🧪 Testing registration with data:", {
        ...testData,
        password: "[HIDDEN]",
        confirmPassword: "[HIDDEN]",
      });

      const response = await register(testData);
      setResult(response);
      console.log("📋 Registration result:", response);
    } catch (error) {
      console.error("❌ Test error:", error);
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setTestData({
      ...testData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Registration Test</h1>

      <div style={{ marginBottom: "20px" }}>
        <h3>Test Data:</h3>
        <div style={{ display: "grid", gap: "10px" }}>
          <input
            name="firstName"
            placeholder="First Name"
            value={testData.firstName}
            onChange={handleInputChange}
            style={{ padding: "8px", border: "1px solid #ccc" }}
          />
          <input
            name="lastName"
            placeholder="Last Name"
            value={testData.lastName}
            onChange={handleInputChange}
            style={{ padding: "8px", border: "1px solid #ccc" }}
          />
          <input
            name="email"
            placeholder="Email"
            value={testData.email}
            onChange={handleInputChange}
            style={{ padding: "8px", border: "1px solid #ccc" }}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={testData.password}
            onChange={handleInputChange}
            style={{ padding: "8px", border: "1px solid #ccc" }}
          />
          <select
            name="role"
            value={testData.role}
            onChange={handleInputChange}
            style={{ padding: "8px", border: "1px solid #ccc" }}
          >
            <option value="customer">Customer</option>
            <option value="trader">Trader</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleTest}
        disabled={loading}
        style={{
          padding: "12px 24px",
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Testing..." : "Test Registration"}
      </button>

      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: result.success ? "#d4edda" : "#f8d7da",
          }}
        >
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
        }}
      >
        <h3>Instructions:</h3>
        <ol>
          <li>Modify the test data above</li>
          <li>Click "Test Registration"</li>
          <li>Check browser console for detailed logs</li>
          <li>Check the result below</li>
        </ol>
        <p>
          <strong>Note:</strong> Make sure the email is unique for each test!
        </p>
      </div>
    </div>
  );
};

export default RegistrationTest;
