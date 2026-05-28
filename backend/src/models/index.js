const { sequelize } = require("../config/database");

// Import all models
const User = require("./User");
const Trader = require("./Trader");
const Shop = require("./Shop");
const Product = require("./Product");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Points = require("./Points");
const { Cart, CartItem } = require("./Cart");

// Define associations

// User associations
User.hasOne(Trader, {
  foreignKey: "userId",
  as: "traderProfile",
  onDelete: "CASCADE",
});

User.hasOne(Cart, {
  foreignKey: "userId",
  as: "cart",
  onDelete: "CASCADE",
});
Cart.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Order, {
  foreignKey: "customerId",
  as: "orders",
  onDelete: "CASCADE",
});

User.hasMany(Points, {
  foreignKey: "customerId",
  as: "pointsHistory",
  onDelete: "CASCADE",
});

// Trader associations
Trader.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Trader.hasMany(Shop, {
  foreignKey: "traderId",
  as: "shops",
  onDelete: "CASCADE",
});

Trader.hasMany(OrderItem, {
  foreignKey: "traderId",
  as: "orderItems",
});

// Shop associations
Shop.belongsTo(Trader, {
  foreignKey: "traderId",
  as: "trader",
});

Shop.hasMany(Product, {
  foreignKey: "shopId",
  as: "products",
  onDelete: "CASCADE",
});

Shop.hasMany(OrderItem, {
  foreignKey: "shopId",
  as: "orderItems",
});

// Product associations
Product.belongsTo(Shop, {
  foreignKey: "shopId",
  as: "shop",
});

Product.hasMany(OrderItem, {
  foreignKey: "productId",
  as: "orderItems",
});

// Order associations
Order.belongsTo(User, {
  foreignKey: "customerId",
  as: "customer",
});

Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "items",
  onDelete: "CASCADE",
});

Order.hasMany(Points, {
  foreignKey: "orderId",
  as: "pointsRecords",
});

// OrderItem associations
OrderItem.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

OrderItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

OrderItem.belongsTo(Shop, {
  foreignKey: "shopId",
  as: "shop",
});

OrderItem.belongsTo(Trader, {
  foreignKey: "traderId",
  as: "trader",
});

// Points associations
Points.belongsTo(User, {
  foreignKey: "customerId",
  as: "customer",
});

Points.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

Points.belongsTo(User, {
  foreignKey: "adminId",
  as: "admin",
});

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  Trader,
  Shop,
  Product,
  Order,
  OrderItem,
  Points,
};

// Utility function to sync all models
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log("✅ Database synced successfully");
  } catch (error) {
    console.error("❌ Database sync failed:", error);
    throw error;
  }
};

module.exports.syncDatabase = syncDatabase;
