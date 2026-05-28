const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    shopId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Shops",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 2000],
      },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subCategory: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    originalPrice: {
      type: DataTypes.DECIMAL(10, 2), // For showing discounts
      validate: {
        min: 0.01,
      },
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "INR",
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    sku: {
      type: DataTypes.STRING,
      unique: true,
    },
    // Product status
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isViolated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    violationReason: {
      type: DataTypes.TEXT,
    },
    // Product attributes
    images: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    specifications: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    // Product metrics
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalSales: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Shipping
    weight: {
      type: DataTypes.DECIMAL(8, 2), // in kg
    },
    dimensions: {
      type: DataTypes.JSON, // {length, width, height}
      defaultValue: {},
    },
    shippingClass: {
      type: DataTypes.STRING,
      defaultValue: "standard",
    },
    // SEO
    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
    metaTitle: {
      type: DataTypes.STRING,
    },
    metaDescription: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (product) => {
        // Generate SKU if not provided
        if (!product.sku) {
          product.sku = `PRD-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
        }

        // Generate slug from name
        if (!product.slug) {
          product.slug =
            product.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "") +
            "-" +
            Date.now();
        }
      },
    },
  }
);

// Instance methods
Product.prototype.applyDiscount = function (percentage) {
  if (!this.originalPrice) {
    this.originalPrice = this.price;
  }
  this.price = this.originalPrice * (1 - percentage / 100);
  return this.save();
};

Product.prototype.removeDiscount = function () {
  if (this.originalPrice) {
    this.price = this.originalPrice;
    this.originalPrice = null;
  }
  return this.save();
};

Product.prototype.updateStock = async function (
  quantity,
  operation = "subtract"
) {
  if (operation === "subtract") {
    this.stock = Math.max(0, this.stock - quantity);
  } else {
    this.stock += quantity;
  }
  return this.save();
};

Product.prototype.markAsViolated = async function (reason, adminId) {
  await this.update({
    isActive: false,
    isViolated: true,
    violationReason: reason,
  });

  // Also mark in trader's violation history
  const shop = await this.getShop({ include: ["Trader"] });
  if (shop && shop.Trader) {
    await shop.Trader.addViolation(
      "product_violation",
      `Product "${this.name}" violated: ${reason}`,
      adminId
    );
  }
};

Product.prototype.getDiscountPercentage = function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  }
  return 0;
};

module.exports = Product;
