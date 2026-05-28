const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Orders",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
    },
    shopId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Shops",
        key: "id",
      },
    },
    traderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Traders",
        key: "id",
      },
    },
    // Product details at time of order (for history)
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productSku: {
      type: DataTypes.STRING,
    },
    productImage: {
      type: DataTypes.STRING,
    },
    // Pricing details
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // Discount applied to this item
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    // Item status (for split order tracking)
    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned"
      ),
      defaultValue: "pending",
    },
    // Trader-specific tracking
    traderNotes: {
      type: DataTypes.TEXT,
    },
    // Shipping details for this item
    trackingNumber: {
      type: DataTypes.STRING,
    },
    shippedAt: {
      type: DataTypes.DATE,
    },
    deliveredAt: {
      type: DataTypes.DATE,
    },
    // Commission/Revenue tracking
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2), // Platform commission percentage
      defaultValue: 5.0, // 5% platform fee
    },
    commissionAmount: {
      type: DataTypes.DECIMAL(10, 2),
    },
    traderRevenue: {
      type: DataTypes.DECIMAL(10, 2),
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (orderItem) => {
        // Calculate total price
        orderItem.totalPrice =
          orderItem.unitPrice * orderItem.quantity - orderItem.discountAmount;

        // Calculate commission and trader revenue
        orderItem.commissionAmount =
          (orderItem.totalPrice * orderItem.commissionRate) / 100;
        orderItem.traderRevenue =
          orderItem.totalPrice - orderItem.commissionAmount;
      },
      beforeUpdate: async (orderItem) => {
        if (
          orderItem.changed("unitPrice") ||
          orderItem.changed("quantity") ||
          orderItem.changed("discountAmount")
        ) {
          orderItem.totalPrice =
            orderItem.unitPrice * orderItem.quantity - orderItem.discountAmount;
          orderItem.commissionAmount =
            (orderItem.totalPrice * orderItem.commissionRate) / 100;
          orderItem.traderRevenue =
            orderItem.totalPrice - orderItem.commissionAmount;
        }
      },
    },
  }
);

// Instance methods
OrderItem.prototype.markAsShipped = async function (trackingNumber) {
  await this.update({
    status: "shipped",
    trackingNumber: trackingNumber,
    shippedAt: new Date(),
  });
};

OrderItem.prototype.markAsDelivered = async function () {
  await this.update({
    status: "delivered",
    deliveredAt: new Date(),
  });

  // Update trader revenue when item is delivered
  const Trader = require("./Trader");
  const trader = await Trader.findByPk(this.traderId);
  if (trader) {
    await trader.increment("totalSales", { by: this.traderRevenue });
    await trader.increment("totalOrders");
  }
};

module.exports = OrderItem;
