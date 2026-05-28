const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    // Order totals
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    shippingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // Order status
    status: {
      type: DataTypes.ENUM(
        "pending", // Just created
        "payment_pending", // Waiting for payment
        "payment_confirmed", // Payment received
        "processing", // Being prepared
        "shipped", // Shipped to customer
        "delivered", // Delivered successfully
        "cancelled", // Cancelled by customer/admin
        "refunded" // Money refunded
      ),
      defaultValue: "pending",
    },
    // Payment details
    paymentMethod: {
      type: DataTypes.ENUM("paypal", "stripe", "cash_on_delivery"),
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
      defaultValue: "pending",
    },
    paymentId: {
      type: DataTypes.STRING, // PayPal/Stripe transaction ID
    },
    paidAt: {
      type: DataTypes.DATE,
    },
    // Shipping details
    shippingAddress: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    billingAddress: {
      type: DataTypes.JSON,
    },
    shippingMethod: {
      type: DataTypes.STRING,
      defaultValue: "standard",
    },
    trackingNumber: {
      type: DataTypes.STRING,
    },
    shippedAt: {
      type: DataTypes.DATE,
    },
    deliveredAt: {
      type: DataTypes.DATE,
    },
    // Customer details
    customerNotes: {
      type: DataTypes.TEXT,
    },
    // Admin/Internal notes
    internalNotes: {
      type: DataTypes.TEXT,
    },
    // Points earned (1 point = ₹100 spent)
    pointsEarned: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Discount/Promo codes
    promoCode: {
      type: DataTypes.STRING,
    },
    promoDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (order) => {
        // Generate unique order number
        if (!order.orderNumber) {
          const timestamp = Date.now();
          const random = Math.random().toString(36).substr(2, 6).toUpperCase();
          order.orderNumber = `ORD-${timestamp}-${random}`;
        }

        // Calculate points earned (1 point per ₹100 spent)
        order.pointsEarned = Math.floor(order.totalAmount / 100);
      },
    },
  }
);

// Instance methods
Order.prototype.confirmPayment = async function (paymentId) {
  await this.update({
    paymentStatus: "completed",
    paymentId: paymentId,
    paidAt: new Date(),
    status: "payment_confirmed",
  });

  // Award points to customer
  const User = require("./User");
  const customer = await User.findByPk(this.customerId);
  if (customer) {
    await customer.increment("totalPoints", { by: this.pointsEarned });
  }
};

Order.prototype.markAsShipped = async function (trackingNumber) {
  await this.update({
    status: "shipped",
    trackingNumber: trackingNumber,
    shippedAt: new Date(),
  });
};

Order.prototype.markAsDelivered = async function () {
  await this.update({
    status: "delivered",
    deliveredAt: new Date(),
  });
};

Order.prototype.cancel = async function (reason) {
  await this.update({
    status: "cancelled",
    internalNotes: `Cancelled: ${reason}`,
  });

  // If payment was completed, initiate refund
  if (this.paymentStatus === "completed") {
    // TODO: Implement refund logic with PayPal/Stripe
    await this.update({ paymentStatus: "refunded" });
  }
};

module.exports = Order;
