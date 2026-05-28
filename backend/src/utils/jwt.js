const jwt = require("jsonwebtoken");

// Generate JWT token
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // token expiry (e.g., 7 days)
  });
}

module.exports = { generateToken };
