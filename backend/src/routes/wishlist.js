const express = require("express");
const { protect } = require("../middleware/auth");
const router = express.Router();

// GET /api/wishlist
router.get("/", protect, (req, res) => {
  res.json({ success: true, wishlist: [] });
});

module.exports = router;
