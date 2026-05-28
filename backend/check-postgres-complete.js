const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("ecommerce_db", "postgres", "root", {
  host: "localhost",
  port: 5432,
  dialect: "postgres",
  logging: false,
});

async function checkPostgreSQLSetup() {
  try {
    console.log("🔍 Checking PostgreSQL setup...\n");

    await sequelize.authenticate();
    console.log("✅ Database connection successful");

    // Check all tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log("\n📋 Tables found:");
    tables.forEach((table) => console.log(`- ${table.table_name}`));

    // Check Users
    const [users] = await sequelize.query('SELECT email, role FROM "Users"');
    console.log(`\n👥 Users (${users.length} total):`);
    users.forEach((user) => console.log(`- ${user.email} (${user.role})`));

    // Check Traders
    const [traders] = await sequelize.query(
      'SELECT "userId", "businessName", status FROM "Traders"'
    );
    console.log(`\n🏪 Traders (${traders.length} total):`);
    traders.forEach((trader) =>
      console.log(`- ${trader.businessName} (${trader.status})`)
    );

    // Check Shops
    const [shops] = await sequelize.query(
      'SELECT name, "traderId" FROM "Shops"'
    );
    console.log(`\n🏬 Shops (${shops.length} total):`);
    shops.forEach((shop) =>
      console.log(`- ${shop.name} (Trader ID: ${shop.traderId})`)
    );

    // Check Products
    const [products] = await sequelize.query(
      'SELECT name, price, "shopId" FROM "Products"'
    );
    console.log(`\n📦 Products (${products.length} total):`);
    products
      .slice(0, 10)
      .forEach((product) =>
        console.log(
          `- ${product.name} - ₹${product.price} (Shop ID: ${product.shopId})`
        )
      );
    if (products.length > 10) {
      console.log(`... and ${products.length - 10} more products`);
    }

    // Check Orders
    const [orders] = await sequelize.query(
      'SELECT id, "customerId", "totalAmount", status FROM "Orders"'
    );
    console.log(`\n📋 Orders (${orders.length} total):`);
    orders.forEach((order) =>
      console.log(
        `- Order #${order.id} - ₹${order.totalAmount} (${order.status})`
      )
    );

    await sequelize.close();

    console.log("\n🎉 PostgreSQL is completely set up!");
    console.log("\n✅ Summary:");
    console.log(`- ${tables.length} tables created`);
    console.log(`- ${users.length} users (admin, traders, customers)`);
    console.log(`- ${traders.length} traders with shops`);
    console.log(`- ${shops.length} shops`);
    console.log(`- ${products.length} products`);
    console.log(`- ${orders.length} orders`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (
      error.message.includes("database") &&
      error.message.includes("does not exist")
    ) {
      console.log("\n🔧 Database not found. Run setup first:");
      console.log("node setup-postgres.js");
    } else if (error.message.includes("connect")) {
      console.log("\n🔧 PostgreSQL server not running. Please:");
      console.log("1. Install PostgreSQL if not installed");
      console.log("2. Start PostgreSQL service");
      console.log("3. Ensure user 'postgres' with password 'root' exists");
    }
    process.exit(1);
  }
}

checkPostgreSQLSetup();
