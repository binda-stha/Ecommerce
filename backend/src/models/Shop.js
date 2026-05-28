const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Shop = sequelize.define(
  "Shop",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    traderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Traders",
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
        len: [10, 1000],
      },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    // Shop status
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Shop metrics
    totalProducts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        max: 5, // Maximum 5 products per shop
      },
    },
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
    // Shop settings
    logo: {
      type: DataTypes.STRING, // URL to logo image
    },
    banner: {
      type: DataTypes.STRING, // URL to banner image
    },
    socialLinks: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    // Operating hours
    operatingHours: {
      type: DataTypes.JSON,
      defaultValue: {
        monday: { open: "09:00", close: "18:00", closed: false },
        tuesday: { open: "09:00", close: "18:00", closed: false },
        wednesday: { open: "09:00", close: "18:00", closed: false },
        thursday: { open: "09:00", close: "18:00", closed: false },
        friday: { open: "09:00", close: "18:00", closed: false },
        saturday: { open: "09:00", close: "18:00", closed: false },
        sunday: { open: "10:00", close: "16:00", closed: false },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Instance methods
Shop.prototype.canAddProduct = function () {
  return this.totalProducts < 5 && this.isActive;
};

Shop.prototype.addProduct = async function () {
  await this.increment("totalProducts");
};

Shop.prototype.removeProduct = async function () {
  if (this.totalProducts > 0) {
    await this.decrement("totalProducts");
  }
};

module.exports = Shop;
