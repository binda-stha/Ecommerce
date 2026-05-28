const bcrypt = require("bcryptjs");

async function testPasswordHashing() {
  try {
    console.log("🔧 Testing password hashing...");

    // Test the exact same password hashing used in the model
    const plainPassword = "trader123";
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    console.log("Plain password:", plainPassword);
    console.log("Hashed password:", hashedPassword);

    // Test comparison
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    console.log("Password comparison result:", isValid);

    // Test with the User model
    const { User } = require("./src/models");

    // Find the electronics trader
    const user = await User.findOne({
      where: { email: "electronics@trader.com" },
    });
    if (user) {
      console.log("✅ User found in database");
      console.log("User email:", user.email);
      console.log("User role:", user.role);
      console.log("User isActive:", user.isActive);

      // Test password comparison using the model method
      const passwordMatch = await user.comparePassword("trader123");
      console.log("Password match with model method:", passwordMatch);

      if (passwordMatch) {
        console.log("🎉 LOGIN SHOULD WORK! Password verification successful.");
      } else {
        console.log("❌ Password verification failed");

        // Let's check what the stored password looks like
        console.log("Stored password hash length:", user.password.length);
        console.log(
          "Stored password starts with:",
          user.password.substring(0, 10)
        );
      }
    } else {
      console.log("❌ User not found in database");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
  process.exit(0);
}

testPasswordHashing();
