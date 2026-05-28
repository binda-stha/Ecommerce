const express = require("express");
const app = express();
const PORT = 5001;

app.get("/test", (req, res) => {
  res.json({ message: "Simple test server is working!" });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});

// Dummy /api/orders endpoint for order placement (COD/PayPal)
app.post("/api/orders", (req, res) => {
  const { paymentMethod } = req.body;
  if (paymentMethod === "paypal") {
    return res.json({
      success: true,
      message: "Order placed with dummy PayPal payment.",
      paymentStatus: "paid",
      transactionId: "DUMMY_PAYPAL_TXN_123456",
    });
  }
  return res.json({
    success: true,
    message: "Order placed with Cash on Delivery.",
    paymentStatus: "pending",
  });
});
