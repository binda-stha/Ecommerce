const { Client } = require("pg");
require("dotenv").config();

// Import the actual models
const { User, Trader, Shop, Product } = require("./src/models");
const bcrypt = require("bcryptjs");

async function setupCompletePostgreSQL() {
  let client;

  try {
    console.log("🔧 Setting up PostgreSQL database with complete schema...");

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

    // Now use the actual models to sync
    console.log("🔧 Setting up tables with actual models...");

    // Import the sequelize instance from models
    const { sequelize } = require("./src/models");

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Connected to ecommerce_db with actual models");

    // Sync all models (create tables) - force: true to recreate
    await sequelize.sync({ force: true });
    console.log("✅ Database tables created with proper schema");

    // Create test users with the correct model structure
    console.log("🔧 Creating test users...");

    const users = [
      {
        firstName: "Admin",
        lastName: "User",
        email: "admin@bptrade.com",
        password: "admin123", // Will be hashed by the model hook
        role: "admin",
        isActive: true,
      },
      {
        firstName: "Electronics",
        lastName: "Trader",
        email: "electronics@trader.com",
        password: "trader123",
        role: "trader",
        isActive: true,
      },
      {
        firstName: "Fashion",
        lastName: "Trader",
        email: "fashion@trader.com",
        password: "trader123",
        role: "trader",
        isActive: true,
      },
      {
        firstName: "Books",
        lastName: "Trader",
        email: "books@trader.com",
        password: "trader123",
        role: "trader",
        isActive: true,
      },
      {
        firstName: "Test",
        lastName: "Customer",
        email: "customer@test.com",
        password: "customer123",
        role: "customer",
        isActive: true,
      },
    ];

    for (const userData of users) {
      await User.create(userData);
      console.log(`✅ Created user: ${userData.email}`);
    }

    // Create trader profiles for trader users
    console.log("🔧 Creating trader profiles...");
    const traderUsers = await User.findAll({ where: { role: "trader" } });

    for (const traderUser of traderUsers) {
      const trader = await Trader.create({
        userId: traderUser.id,
        businessName: `${traderUser.firstName} Business`,
        status: "approved",
        violationCount: 0,
      });

      console.log(`✅ Created trader profile for: ${traderUser.email}`);

      // Create shops for each trader
      for (let i = 1; i <= 2; i++) {
        const shop = await Shop.create({
          traderId: trader.id,
          name: `${traderUser.firstName} Shop ${i}`,
          description: `Shop ${i} by ${traderUser.firstName}`,
          isActive: true,
        });

        // Create products for each shop
        for (let j = 1; j <= 5; j++) {
          await Product.create({
            shopId: shop.id,
            name: `${traderUser.firstName} Product ${i}-${j}`,
            description: `Product ${j} from shop ${i}`,
            price: (Math.random() * 1000 + 50).toFixed(2),
            stock: Math.floor(Math.random() * 100) + 10,
            category: ["Electronics", "Fashion", "Books", "Home", "Sports"][
              Math.floor(Math.random() * 5)
            ],
            isActive: true,
          });
        }

        console.log(
          `✅ Created shop ${i} with 5 products for: ${traderUser.email}`
        );
      }
    }

    console.log("🎉 Complete PostgreSQL database setup finished!");
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

setupCompletePostgreSQL();
