const { Sequelize } = require("sequelize");
const bcrypt = require("bcryptjs");

const sequelize = new Sequelize("ecommerce_db", "postgres", "root", {
  host: "localhost",
  port: 5432,
  dialect: "postgres",
  logging: false,
});

async function comprehensiveTest() {
  console.log("🧪 COMPREHENSIVE E-COMMERCE SYSTEM TEST");
  console.log("=".repeat(50));

  let allTestsPassed = true;
  const testResults = [];

  try {
    // Test 1: Database Connection
    console.log("\n📊 Test 1: Database Connection...");
    await sequelize.authenticate();
    console.log("✅ Database connection successful");
    testResults.push({ test: "Database Connection", status: "PASS" });

    // Test 2: User Authentication
    console.log("\n🔐 Test 2: User Authentication...");
    const testLogins = [
      { email: "admin@bptrade.com", password: "admin123", role: "admin" },
      {
        email: "electronics@trader.com",
        password: "trader123",
        role: "trader",
      },
      { email: "fashion@trader.com", password: "trader123", role: "trader" },
      { email: "books@trader.com", password: "trader123", role: "trader" },
      { email: "customer@test.com", password: "customer123", role: "customer" },
    ];

    for (const login of testLogins) {
      const [users] = await sequelize.query(`
        SELECT id, "firstName", "lastName", email, password, role, "isActive"
        FROM "Users" WHERE email = '${login.email}'
      `);

      if (users.length > 0) {
        const user = users[0];
        const isValidPassword = await bcrypt.compare(
          login.password,
          user.password
        );

        if (isValidPassword && user.role === login.role) {
          console.log(`  ✅ ${login.email} (${login.role}) - Login valid`);
        } else {
          console.log(`  ❌ ${login.email} - Login failed`);
          allTestsPassed = false;
        }
      } else {
        console.log(`  ❌ ${login.email} - User not found`);
        allTestsPassed = false;
      }
    }
    testResults.push({
      test: "User Authentication",
      status: allTestsPassed ? "PASS" : "FAIL",
    });

    // Test 3: Database Schema Validation
    console.log("\n📋 Test 3: Database Schema...");
    const expectedTables = [
      "Users",
      "Traders",
      "Shops",
      "Products",
      "Orders",
      "OrderItems",
      "Points",
    ];
    const [tables] = await sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);

    const foundTables = tables.map((t) => t.table_name);
    let schemaValid = true;

    for (const expectedTable of expectedTables) {
      if (foundTables.includes(expectedTable)) {
        console.log(`  ✅ Table ${expectedTable} exists`);
      } else {
        console.log(`  ❌ Table ${expectedTable} missing`);
        schemaValid = false;
      }
    }
    testResults.push({
      test: "Database Schema",
      status: schemaValid ? "PASS" : "FAIL",
    });

    // Test 4: Data Integrity
    console.log("\n📊 Test 4: Data Integrity...");
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

    const expectedCounts = { users: 5, traders: 3, shops: 6, products: 30 };
    const actualCounts = {
      users: parseInt(userCount[0].count),
      traders: parseInt(traderCount[0].count),
      shops: parseInt(shopCount[0].count),
      products: parseInt(productCount[0].count),
    };

    let dataIntegrityValid = true;
    for (const [key, expected] of Object.entries(expectedCounts)) {
      const actual = actualCounts[key];
      if (actual >= expected) {
        console.log(`  ✅ ${key}: ${actual} (expected: ≥${expected})`);
      } else {
        console.log(`  ❌ ${key}: ${actual} (expected: ≥${expected})`);
        dataIntegrityValid = false;
      }
    }
    testResults.push({
      test: "Data Integrity",
      status: dataIntegrityValid ? "PASS" : "FAIL",
    });

    // Test 5: Business Logic Validation
    console.log("\n🏪 Test 5: Business Logic...");

    // Check trader-shop relationship (2 shops per trader)
    const [traderShops] = await sequelize.query(`
      SELECT t.id, t."businessName", COUNT(s.id) as shop_count
      FROM "Traders" t LEFT JOIN "Shops" s ON t.id = s."traderId"
      GROUP BY t.id, t."businessName"
    `);

    let businessLogicValid = true;
    for (const trader of traderShops) {
      if (trader.shop_count === 2) {
        console.log(`  ✅ ${trader.businessName}: ${trader.shop_count} shops`);
      } else {
        console.log(
          `  ❌ ${trader.businessName}: ${trader.shop_count} shops (expected: 2)`
        );
        businessLogicValid = false;
      }
    }

    // Check shop-product relationship (5 products per shop)
    const [shopProducts] = await sequelize.query(`
      SELECT s.name, COUNT(p.id) as product_count
      FROM "Shops" s LEFT JOIN "Products" p ON s.id = p."shopId"
      GROUP BY s.id, s.name
    `);

    for (const shop of shopProducts) {
      if (shop.product_count === 5) {
        console.log(`  ✅ ${shop.name}: ${shop.product_count} products`);
      } else {
        console.log(
          `  ❌ ${shop.name}: ${shop.product_count} products (expected: 5)`
        );
        businessLogicValid = false;
      }
    }
    testResults.push({
      test: "Business Logic",
      status: businessLogicValid ? "PASS" : "FAIL",
    });

    // Test 6: API Endpoints
    console.log("\n🌐 Test 6: API Endpoints...");
    const fetch = require("node-fetch");

    try {
      // Test health endpoint
      const healthResponse = await fetch("http://localhost:5001/api/health");
      if (healthResponse.ok) {
        console.log("  ✅ Health endpoint responding");
      } else {
        console.log("  ❌ Health endpoint failed");
        allTestsPassed = false;
      }

      // Test login endpoint
      const loginResponse = await fetch(
        "http://localhost:5001/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "electronics@trader.com",
            password: "trader123",
          }),
        }
      );

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        if (loginData.success && loginData.token) {
          console.log("  ✅ Login endpoint working");

          // Test products endpoint
          const productsResponse = await fetch(
            "http://localhost:5001/api/products"
          );
          if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            if (productsData.success && productsData.products.length > 0) {
              console.log(
                `  ✅ Products endpoint: ${productsData.products.length} products`
              );
            } else {
              console.log("  ❌ Products endpoint: no products returned");
              allTestsPassed = false;
            }
          } else {
            console.log("  ❌ Products endpoint failed");
            allTestsPassed = false;
          }
        } else {
          console.log("  ❌ Login endpoint: invalid response");
          allTestsPassed = false;
        }
      } else {
        console.log("  ❌ Login endpoint failed");
        allTestsPassed = false;
      }

      testResults.push({
        test: "API Endpoints",
        status: allTestsPassed ? "PASS" : "FAIL",
      });
    } catch (apiError) {
      console.log("  ❌ API tests failed:", apiError.message);
      testResults.push({ test: "API Endpoints", status: "FAIL" });
      allTestsPassed = false;
    }

    // Final Results
    console.log("\n" + "=".repeat(50));
    console.log("📊 TEST RESULTS SUMMARY");
    console.log("=".repeat(50));

    testResults.forEach((result) => {
      const status = result.status === "PASS" ? "✅ PASS" : "❌ FAIL";
      console.log(`${status} - ${result.test}`);
    });

    console.log("\n" + "=".repeat(50));
    if (allTestsPassed) {
      console.log("🎉 ALL TESTS PASSED - SYSTEM FULLY OPERATIONAL!");
      console.log("\n✅ Ready for use:");
      console.log("   Frontend: http://localhost:5173");
      console.log("   Backend:  http://localhost:5001");
      console.log("   Login:    electronics@trader.com / trader123");
    } else {
      console.log("⚠️  SOME TESTS FAILED - CHECK ABOVE FOR DETAILS");
    }
    console.log("=".repeat(50));

    await sequelize.close();
  } catch (error) {
    console.error("❌ Test suite error:", error.message);
    allTestsPassed = false;
  }

  return allTestsPassed;
}

// Run if called directly
if (require.main === module) {
  comprehensiveTest();
}

module.exports = comprehensiveTest;
