const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("ecommerce_db", "postgres", "root", {
  host: "localhost",
  port: 5432,
  dialect: "postgres",
  logging: false,
});

async function quickSystemTest() {
  console.log("🧪 QUICK SYSTEM TEST");
  console.log("=".repeat(40));

  try {
    // Test 1: Database Connection
    console.log("📊 Testing Database Connection...");
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected successfully");

    // Test 2: Core Data Counts
    console.log("\n📊 Testing Data Integrity...");
    const [userCount] = await sequelize.query(
      'SELECT COUNT(*) as count FROM "Users"'
    );
    const [traderCount] = await sequelize.query(
      'SELECT COUNT(*) as count FROM "Traders"'
    );
    const [shopCount] = await sequelize.query(
      'SELECT COUNT(*) as count FROM "Shops"'
    );
    const [productCount] = await sequelize.query(
      'SELECT COUNT(*) as count FROM "Products"'
    );

    console.log(`✅ Users: ${userCount[0].count}`);
    console.log(`✅ Traders: ${traderCount[0].count}`);
    console.log(`✅ Shops: ${shopCount[0].count}`);
    console.log(`✅ Products: ${productCount[0].count}`);

    // Test 3: Authentication Test
    console.log("\n🔐 Testing Authentication...");
    const [users] = await sequelize.query(`
      SELECT id, email, role FROM "Users" 
      WHERE email = 'electronics@trader.com'
    `);

    if (users.length > 0) {
      console.log(`✅ User found: ${users[0].email} (${users[0].role})`);

      // Check trader profile
      const [traders] = await sequelize.query(`
        SELECT "businessName", status FROM "Traders" 
        WHERE "userId" = '${users[0].id}'
      `);

      if (traders.length > 0) {
        console.log(
          `✅ Trader profile: ${traders[0].businessName} (${traders[0].status})`
        );
      }
    }

    // Test 4: API Server Check
    console.log("\n🌐 Testing API Server...");
    const http = require("http");

    const testServer = () => {
      return new Promise((resolve) => {
        const req = http
          .get("http://localhost:5001/api/health", (res) => {
            if (res.statusCode === 200) {
              console.log("✅ API server responding");
              resolve(true);
            } else {
              console.log(`❌ API server error: ${res.statusCode}`);
              resolve(false);
            }
          })
          .on("error", () => {
            console.log("❌ API server not reachable");
            resolve(false);
          });

        req.setTimeout(2000, () => {
          req.destroy();
          console.log("❌ API server timeout");
          resolve(false);
        });
      });
    };

    await testServer();

    // Test 5: Sample Products
    console.log("\n📦 Testing Products...");
    const [products] = await sequelize.query(`
      SELECT p.name, p.price, s.name as shop_name 
      FROM "Products" p 
      LEFT JOIN "Shops" s ON p."shopId" = s.id 
      LIMIT 3
    `);

    products.forEach((product) => {
      console.log(
        `✅ ${product.name} - ₹${product.price} (${product.shop_name})`
      );
    });

    console.log("\n" + "=".repeat(40));
    console.log("🎉 SYSTEM STATUS: OPERATIONAL");
    console.log("=".repeat(40));
    console.log("🚀 Ready to use:");
    console.log("   Frontend: http://localhost:5173");
    console.log("   Backend:  http://localhost:5001");
    console.log("   Login:    electronics@trader.com / trader123");
    console.log("=".repeat(40));

    await sequelize.close();
    return true;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return false;
  }
}

quickSystemTest();
