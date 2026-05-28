const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Points = sequelize.define(
  "Points",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: true, // Null for manual adjustments by admin
      references: {
        model: "Orders",
        key: "id",
      },
    },
    // Transaction details
    type: {
      type: DataTypes.ENUM(
        "earned", // Points earned from purchase
        "redeemed", // Points used for discount
        "bonus", // Admin bonus points
        "penalty", // Admin penalty/deduction
        "expired" // Points expired
      ),
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notZero: function (value) {
          if (value === 0) {
            throw new Error("Points value cannot be zero");
          }
        },
      },
    },
    // For earned points: amount spent that generated these points
    orderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    // Description/reason for the transaction
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Admin who made manual adjustment (for bonus/penalty)
    adminId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    // Points expiry
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true, // null means never expires
    },
    isExpired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (pointsRecord) => {
        // Set expiry date for earned points (1 year from now)
        if (pointsRecord.type === "earned" && !pointsRecord.expiresAt) {
          const expiryDate = new Date();
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          pointsRecord.expiresAt = expiryDate;
        }
      },
    },
  }
);

// Static methods
Points.calculatePointsFromAmount = function (amount) {
  // 1 point for every ₹100 spent
  return Math.floor(amount / 100);
};

Points.awardPointsForOrder = async function (customerId, orderId, orderAmount) {
  const pointsToAward = this.calculatePointsFromAmount(orderAmount);

  if (pointsToAward > 0) {
    await this.create({
      customerId,
      orderId,
      type: "earned",
      points: pointsToAward,
      orderAmount,
      description: `Points earned from order (₹${orderAmount})`,
    });
  }

  return pointsToAward;
};

Points.getCustomerBalance = async function (customerId) {
  const { Op } = require("sequelize");

  // Get all non-expired points transactions
  const pointsTransactions = await this.findAll({
    where: {
      customerId,
      [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }],
      isExpired: false,
    },
  });

  const totalPoints = pointsTransactions.reduce((sum, transaction) => {
    return sum + transaction.points;
  }, 0);

  return Math.max(0, totalPoints); // Ensure non-negative balance
};

Points.redeemPoints = async function (
  customerId,
  pointsToRedeem,
  description = "Points redeemed"
) {
  const currentBalance = await this.getCustomerBalance(customerId);

  if (currentBalance < pointsToRedeem) {
    throw new Error("Insufficient points balance");
  }

  // Create redemption record (negative points)
  await this.create({
    customerId,
    type: "redeemed",
    points: -pointsToRedeem,
    description,
  });

  return true;
};

Points.expireOldPoints = async function () {
  const { Op } = require("sequelize");

  // Find all earned points that have expired
  const expiredPoints = await this.findAll({
    where: {
      type: "earned",
      expiresAt: { [Op.lt]: new Date() },
      isExpired: false,
    },
  });

  for (const pointsRecord of expiredPoints) {
    // Mark as expired
    await pointsRecord.update({ isExpired: true });

    // Create expiry record (negative points)
    await this.create({
      customerId: pointsRecord.customerId,
      type: "expired",
      points: -pointsRecord.points,
      description: `Points expired from ${pointsRecord.createdAt.toDateString()}`,
    });
  }

  return expiredPoints.length;
};

Points.addBonusPoints = async function (
  customerId,
  points,
  description,
  adminId
) {
  await this.create({
    customerId,
    type: "bonus",
    points,
    description,
    adminId,
  });
};

Points.deductPoints = async function (
  customerId,
  points,
  description,
  adminId
) {
  await this.create({
    customerId,
    type: "penalty",
    points: -points,
    description,
    adminId,
  });
};

// Instance methods
Points.prototype.canExpire = function () {
  return this.type === "earned" && this.expiresAt && !this.isExpired;
};

module.exports = Points;
