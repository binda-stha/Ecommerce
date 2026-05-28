const { Client } = require("pg");
const { Sequelize } = require("sequelize");
const bcrypt = require("bcryptjs");

// PostgreSQL connection config
const pgConfig = {
  user: "postgres",
  password: "root",
  host: "localhost",
  port: 5432,
};

async function setupPostgreSQL() {
  let client;

  try {
    console.log("🔧 Setting up PostgreSQL database...");

    // Connect to PostgreSQL server
    client = new Client(pgConfig);
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
      logging: false,
    });

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Connected to ecommerce_db");

    // Import models to create tables
    const {
      User,
      Trader,
      Shop,
      Product,
      Order,
      OrderItem,
      Points,
    } = require("./src/models");

    // Sync all models (create tables)
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

    // Create trader profiles
    const traderUsers = await User.findAll({ where: { role: "trader" } });

    for (let i = 0; i < traderUsers.length; i++) {
      const traderUser = traderUsers[i];
      const trader = await Trader.create({
        userId: traderUser.id,
        businessName: `${traderUser.firstName} Business`,
        status: "approved",
        violationCount: 0,
      });

      // Create shops for each trader
      for (let j = 1; j <= 2; j++) {
        const shop = await Shop.create({
          traderId: trader.id,
          name: `${traderUser.firstName} Shop ${j}`,
          description: `Shop ${j} by ${traderUser.firstName}`,
          isActive: true,
        });

        // Create products for each shop
        for (let k = 1; k <= 5; k++) {
          await Product.create({
            shopId: shop.id,
            name: `${traderUser.firstName} Product ${j}-${k}`,
            description: `Product ${k} from shop ${j}`,
            price: (Math.random() * 1000 + 50).toFixed(2),
            stock: Math.floor(Math.random() * 100) + 10,
            category: ["Electronics", "Fashion", "Books", "Home", "Sports"][
              Math.floor(Math.random() * 5)
            ],
            isActive: true,
          });
        }
      }

      console.log(
        `✅ Created trader profile, shops, and products for: ${traderUser.email}`
      );
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
      await client.end();
    }
    process.exit(1);
  }
}

setupPostgreSQL();
