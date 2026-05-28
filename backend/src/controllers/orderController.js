// Basic order creation stub for POST /api/orders
const { Order, OrderItem, Product, User } = require("../models");

exports.createOrder = async (req, res) => {
  try {
    // Example: { items: [{ productId, quantity }], paymentMethod, shippingAddress }
    const { items, paymentMethod, shippingAddress } = req.body;
    const customerId = req.user.id;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items in order" });
    }
    if (!paymentMethod) {
      return res
        .status(400)
        .json({ success: false, message: "Payment method required" });
    }

    // Validate products and stock, calculate subtotal
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Product unavailable or insufficient stock: ${item.productId}`,
        });
      }
      subtotal += parseFloat(product.price) * item.quantity;
    }

    // Calculate totals (no tax/shipping for COD demo)
    const taxAmount = 0;
    const shippingAmount = 0;
    const discountAmount = 0;
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    // Use provided shippingAddress or default
    const address = shippingAddress || {
      name: req.user.firstName + " " + req.user.lastName,
      email: req.user.email,
      address: "Default Address",
      city: "Default City",
      country: "India",
      zip: "000000",
      phone: "0000000000",
    };

    // Create order
    let order = await Order.create({
      customerId,
      paymentMethod,
      status:
        paymentMethod === "paypal"
          ? "payment_confirmed"
          : paymentMethod === "cash_on_delivery"
          ? "pending"
          : "payment_pending",
      paymentStatus: paymentMethod === "paypal" ? "completed" : "pending",
      paymentId: paymentMethod === "paypal" ? "DUMMY_PAYPAL_TXN_ID" : null,
      paidAt: paymentMethod === "paypal" ? new Date() : null,
      subtotal,
      taxAmount,
      shippingAmount,
      discountAmount,
      totalAmount,
      shippingAddress: address,
    });
    for (const item of items) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
      });
      // Decrement product stock
      const product = await Product.findByPk(item.productId);
      product.stock -= item.quantity;
      await product.save();
    }

    // For PayPal, simulate payment confirmation
    if (paymentMethod === "paypal") {
      order = await order.reload();
    }

    res.json({
      success: true,
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      paymentId: order.paymentId,
      message:
        paymentMethod === "paypal"
          ? "Order placed and dummy PayPal payment confirmed."
          : "Order created successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: err.message,
    });
  }
};
