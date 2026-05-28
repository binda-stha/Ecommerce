const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("ecommerce_db", "postgres", "root", {
  host: "localhost",
  port: 5432,
  dialect: "postgres",
  logging: false,
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection successful");

    const [results] = await sequelize.query('SELECT email, role FROM "Users"');
    console.log("Users found:");
    results.forEach((user) =>
      console.log("- " + user.email + " (" + user.role + ")")
    );

    await sequelize.close();
    console.log("\n🎉 PostgreSQL database is ready!");
    console.log("Now you can test trader login with:");
    console.log("- electronics@trader.com / trader123");
    console.log("- fashion@trader.com / trader123");
    console.log("- books@trader.com / trader123");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testConnection();
