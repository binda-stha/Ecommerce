const { Sequelize } = require("sequelize");
const bcrypt = require("bcryptjs");

const sequelize = new Sequelize("ecommerce_db", "postgres", "root", {
  host: "localhost",
  port: 5432,
  dialect: "postgres",
  logging: false,
});

async function testLogin() {
  try {
    console.log("🔍 Testing login for electronics@trader.com...\n");

    await sequelize.authenticate();
    console.log("✅ Database connection successful");

    // Test the correct query that should work
    const [users] = await sequelize.query(`
      SELECT id, "firstName", "lastName", email, password, role, "isActive"
      FROM "Users" 
      WHERE email = 'electronics@trader.com'
    `);

    if (users.length === 0) {
      console.log("❌ User not found!");
      return;
    }

    const user = users[0];
    console.log("✅ User found:", {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });

    // Test password verification
    const testPassword = "trader123";
    const isValidPassword = await bcrypt.compare(testPassword, user.password);

    console.log(`\n🔐 Password test:`);
    console.log(`- Input password: "${testPassword}"`);
    console.log(`- Hash in database: ${user.password.substring(0, 20)}...`);
    console.log(`- Password valid: ${isValidPassword ? "✅ YES" : "❌ NO"}`);

    if (isValidPassword) {
      // Get trader profile
      const [traders] = await sequelize.query(`
        SELECT id, "businessName", "businessType", status, "isApproved"
        FROM "Traders" 
        WHERE "userId" = '${user.id}'
      `);

      if (traders.length > 0) {
        const trader = traders[0];
        console.log(`\n🏪 Trader profile found:`, {
          id: trader.id,
          businessName: trader.businessName,
          businessType: trader.businessType,
          status: trader.status,
          isApproved: trader.isApproved,
        });

        console.log(`\n🎉 Login should work! User is valid trader.`);
      } else {
        console.log(`\n⚠️  No trader profile found for this user.`);
      }
    }

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testLogin();
