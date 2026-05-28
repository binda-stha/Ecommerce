const express = require("express");
const { protect } = require("../middleware/auth");
const router = express.Router();

// GET /api/admin/transactions
router.get("/", protect, (req, res) => {
  res.json({ success: true, transactions: [] });
});

module.exports = router;
