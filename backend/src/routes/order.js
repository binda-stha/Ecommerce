const express = require("express");
const { protect } = require("../middleware/auth");
const { createOrder } = require("../controllers/orderController");
const router = express.Router();

// GET /api/orders
const { Order, OrderItem, Product } = require("../models");

// GET /api/orders - Return real order history for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const customerId = req.user.id;
    // Find all orders for this user, include items and product details
    const orders = await Order.findAll({
      where: { customerId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "price", "image"],
            },
          ],
        },
      ],
    });
    res.json({ success: true, orders });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching orders",
        error: err.message,
      });
  }
});

// POST /api/orders - Create new order
router.post("/", protect, createOrder);

module.exports = router;
