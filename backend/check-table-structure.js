const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("ecommerce_db", "postgres", "root", {
  host: "localhost",
  port: 5432,
  dialect: "postgres",
  logging: false,
});

async function checkTableStructures() {
  try {
    console.log("🔍 Checking table structures...\n");

    await sequelize.authenticate();

    // Check Traders table structure
    const [traderCols] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Traders'
      ORDER BY ordinal_position
    `);

    console.log("📋 Traders table columns:");
    traderCols.forEach((col) =>
      console.log(`- ${col.column_name} (${col.data_type})`)
    );

    // Check Traders data
    const [traders] = await sequelize.query('SELECT * FROM "Traders" LIMIT 3');
    console.log(`\n🏪 Traders data (${traders.length} shown):`);
    traders.forEach((trader, index) => {
      console.log(`Trader ${index + 1}:`, JSON.stringify(trader, null, 2));
    });

    // Check Shops
    const [shops] = await sequelize.query('SELECT * FROM "Shops" LIMIT 3');
    console.log(`\n🏬 Shops data (${shops.length} shown):`);
    shops.forEach((shop, index) => {
      console.log(`Shop ${index + 1}:`, JSON.stringify(shop, null, 2));
    });

    // Check Products count
    const [productCount] = await sequelize.query(
      'SELECT COUNT(*) as count FROM "Products"'
    );
    console.log(`\n📦 Total Products: ${productCount[0].count}`);

    // Check Orders count
    const [orderCount] = await sequelize.query(
      'SELECT COUNT(*) as count FROM "Orders"'
    );
    console.log(`📋 Total Orders: ${orderCount[0].count}`);

    await sequelize.close();
    console.log("\n✅ Table structure check complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkTableStructures();
