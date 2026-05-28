const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Trader = sequelize.define(
  "Trader",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    businessType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    businessAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    businessPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    businessEmail: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    // Violation tracking system
    violationCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    violationHistory: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    // Status tracking
    status: {
      type: DataTypes.ENUM("pending", "active", "suspended", "banned"),
      defaultValue: "pending", // Requires admin approval
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    approvedAt: {
      type: DataTypes.DATE,
    },
    approvedBy: {
      type: DataTypes.UUID,
      references: {
        model: "Users",
        key: "id",
      },
    },
    // Business metrics
    totalSales: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    totalOrders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
    },
    // Shop limits (2 shops per trader)
    shopCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        max: 2,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Instance methods
Trader.prototype.addViolation = async function (
  violationType,
  description,
  adminId
) {
  const violation = {
    type: violationType,
    description: description,
    date: new Date(),
    adminId: adminId,
  };

  const violations = this.violationHistory || [];
  violations.push(violation);

  const newCount = this.violationCount + 1;

  // Violation system: 1st = warning, 2nd = ban
  let newStatus = this.status;
  if (newCount === 1) {
    newStatus = "suspended"; // First violation - temporary suspension
  } else if (newCount >= 2) {
    newStatus = "banned"; // Second violation - permanent ban
  }

  await this.update({
    violationCount: newCount,
    violationHistory: violations,
    status: newStatus,
  });

  return {
    violationCount: newCount,
    status: newStatus,
    action: newCount === 1 ? "suspended" : "banned",
  };
};

Trader.prototype.approve = async function (adminId) {
  await this.update({
    isApproved: true,
    status: "active",
    approvedAt: new Date(),
    approvedBy: adminId,
  });
};

Trader.prototype.canCreateShop = function () {
  return this.shopCount < 2 && this.status === "active";
};

module.exports = Trader;
