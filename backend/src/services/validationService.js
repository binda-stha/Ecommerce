/**
 * Validation Service for Business Rules
 */

class ValidationService {
  // REQ-01: Validate trader shop limit (max 2 shops)
  static validateShopLimit(traderId, currentShopCount) {
    if (currentShopCount >= 2) {
      return {
        valid: false,
        message: "Trader cannot have more than 2 shops",
        code: "SHOP_LIMIT_EXCEEDED",
      };
    }
    return { valid: true };
  }

  // REQ-02: Validate product limit per shop (max 5 products)
  static validateProductLimit(shopId, currentProductCount) {
    if (currentProductCount >= 5) {
      return {
        valid: false,
        message: "Shop cannot have more than 5 products",
        code: "PRODUCT_LIMIT_EXCEEDED",
      };
    }
    return { valid: true };
  }

  // REQ-03: Validate user role
  static validateUserRole(role) {
    const validRoles = ["admin", "trader", "customer"];
    if (!validRoles.includes(role)) {
      return {
        valid: false,
        message: "Invalid user role",
        code: "INVALID_ROLE",
      };
    }
    return { valid: true };
  }

  // REQ-04: Validate authentication for checkout
  static validateCheckoutAuth(userId) {
    if (!userId) {
      return {
        valid: false,
        message: "Authentication required for checkout",
        code: "AUTH_REQUIRED",
      };
    }
    return { valid: true };
  }

  // REQ-11: Process violation
  static processViolation(traderId, violationType, description) {
    return {
      violationId: "VIO_" + Date.now(),
      traderId,
      violationType,
      description,
      severity: this.getViolationSeverity(violationType),
      timestamp: new Date().toISOString(),
      status: "pending_review",
    };
  }

  static getViolationSeverity(type) {
    const severityMap = {
      fake_product: "high",
      poor_service: "medium",
      misleading_description: "high",
      delayed_shipping: "low",
      customer_complaint: "medium",
    };
    return severityMap[type] || "medium";
  }

  // REQ-12: Validate split invoice requirements
  static validateSplitInvoice(orderItems) {
    const traderGroups = {};

    orderItems.forEach((item) => {
      if (!traderGroups[item.traderId]) {
        traderGroups[item.traderId] = [];
      }
      traderGroups[item.traderId].push(item);
    });

    const traderCount = Object.keys(traderGroups).length;

    return {
      valid: traderCount > 0,
      requiresSplit: traderCount > 1,
      traderGroups,
      message:
        traderCount > 1
          ? "Multi-trader order requires split invoicing"
          : "Single trader order",
    };
  }
}

module.exports = ValidationService;
