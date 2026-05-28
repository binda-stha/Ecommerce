const express = require("express");
const { protect } = require("../middleware/auth");
const router = express.Router();

// GET /api/user/profile
router.get("/profile", protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
