const express = require("express");
const { protect } = require("../middleware/auth");
const router = express.Router();

const cartController = require("../controllers/cartController");

// GET /api/cart
router.get("/", protect, cartController.getCart);

// POST /api/cart/sync
router.post("/sync", protect, cartController.syncCart);

module.exports = router;
