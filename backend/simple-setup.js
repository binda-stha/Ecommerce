const { Client } = require("pg");
const { Sequelize } = require("sequelize");
const bcrypt = require("bcryptjs");

async function setupPostgreSQL() {
  let client;

  try {
    console.log("🔧 Setting up PostgreSQL database...");

    // Connect to PostgreSQL server
    client = new Client({
      user: "postgres",
      password: "root",
      host: "localhost",
      port: 5432,
    });

    await client.connect();
    console.log("✅ Connected to PostgreSQL server");

    // Check if database exists
    const dbCheckResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname='ecommerce_db'"
    );

    // Create database if it doesn't exist
    if (dbCheckResult.rows.length === 0) {
      await client.query("CREATE DATABASE ecommerce_db");
      console.log("✅ Created database: ecommerce_db");
    } else {
      console.log("✅ Database ecommerce_db already exists");
    }

    await client.end();

    // Now connect to the ecommerce_db and create tables
    console.log("🔧 Setting up tables and data...");

    const sequelize = new Sequelize("ecommerce_db", "postgres", "root", {
      host: "localhost",
      port: 5432,
      dialect: "postgres",
      logging: console.log, // Enable logging to see what's happening
    });

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Connected to ecommerce_db");

    // Define User model directly
    const User = sequelize.define("User", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM("customer", "trader", "admin"),
        allowNull: false,
        defaultValue: "customer",
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      phone: Sequelize.STRING,
      address: Sequelize.TEXT,
      lastLogin: Sequelize.DATE,
    });

    // Sync the model
    await sequelize.sync({ force: true });
    console.log("✅ Database tables created");

    // Create test users
    console.log("🔧 Creating test users...");

    const users = [
      {
        firstName: "Admin",
        lastName: "User",
        email: "admin@bptrade.com",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
        isActive: true,
      },
      {
        firstName: "Electronics",
        lastName: "Trader",
        email: "electronics@trader.com",
        password: await bcrypt.hash("trader123", 10),
        role: "trader",
        isActive: true,
      },
      {
        firstName: "Fashion",
        lastName: "Trader",
        email: "fashion@trader.com",
        password: await bcrypt.hash("trader123", 10),
        role: "trader",
        isActive: true,
      },
      {
        firstName: "Books",
        lastName: "Trader",
        email: "books@trader.com",
        password: await bcrypt.hash("trader123", 10),
        role: "trader",
        isActive: true,
      },
      {
        firstName: "Test",
        lastName: "Customer",
        email: "customer@test.com",
        password: await bcrypt.hash("customer123", 10),
        role: "customer",
        isActive: true,
      },
    ];

    for (const userData of users) {
      await User.create(userData);
      console.log(`✅ Created user: ${userData.email}`);
    }

    console.log("🎉 PostgreSQL database setup complete!");
    console.log("\n📋 Test Accounts:");
    console.log("Admin: admin@bptrade.com / admin123");
    console.log("Trader: electronics@trader.com / trader123");
    console.log("Trader: fashion@trader.com / trader123");
    console.log("Trader: books@trader.com / trader123");
    console.log("Customer: customer@test.com / customer123");

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error setting up PostgreSQL:", error);
    if (client) {
      try {
        await client.end();
      } catch (e) {
        // Ignore error when closing client
      }
    }
    process.exit(1);
  }
}

setupPostgreSQL();
