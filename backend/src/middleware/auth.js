const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token is not valid. User not found.",
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated.",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid.",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. User not authenticated.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

// Check if user is trader and owns the resource
const isOwner = (resourceKey = "userId") => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Access denied. User not authenticated.",
        });
      }

      // Admin can access all resources
      if (req.user.role === "admin") {
        return next();
      }

      // For traders, check if they own the resource
      if (req.user.role === "trader") {
        const resourceUserId =
          req.params[resourceKey] ||
          req.body[resourceKey] ||
          req.query[resourceKey];

        if (resourceUserId && resourceUserId !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: "Access denied. You can only access your own resources.",
          });
        }
      }

      next();
    } catch (error) {
      console.error("Owner check error:", error);
      res.status(500).json({
        success: false,
        message: "Server error in ownership check",
      });
    }
  };
};

module.exports = {
  protect,
  authorize,
  isOwner,
};
