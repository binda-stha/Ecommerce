const { Sequelize } = require("sequelize");
require("dotenv").config({ path: __dirname + "/.env" });

// Import the actual models
const { User, Trader, Shop, Product } = require("./src/models");

async function addTraderData() {
  console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
  try {
    console.log("🔧 Adding trader data to existing database...");

    // Test connection
    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
        logging: false,
      }
    );

    await sequelize.authenticate();
    console.log("✅ Connected to database");

    // Check current state
    const userCount = await User.count();
    const traderCount = await Trader.count();
    console.log(`Current state: ${userCount} users, ${traderCount} traders`);

    // Get trader users
    const traderUsers = await User.findAll({ where: { role: "trader" } });
    console.log(`Found ${traderUsers.length} trader users`);

    for (const traderUser of traderUsers) {
      // Check if trader profile exists
      const existingTrader = await Trader.findOne({
        where: { userId: traderUser.id },
      });

      if (!existingTrader) {
        // Determine business type based on email
        let businessType = "General";
        if (traderUser.email.includes("electronics"))
          businessType = "Electronics";
        else if (traderUser.email.includes("fashion")) businessType = "Fashion";
        else if (traderUser.email.includes("books")) businessType = "Books";

        // Create trader profile with all required fields
        const trader = await Trader.create({
          userId: traderUser.id,
          businessName: `${traderUser.firstName} ${businessType} Business`,
          businessType: businessType,
          businessAddress: `${businessType} Business Center, Kathmandu, Nepal`,
          businessPhone: `+977-98${Math.floor(Math.random() * 10000000)
            .toString()
            .padStart(8, "0")}`,
          businessEmail: traderUser.email,
          status: "active", // Change from pending to active
          violationCount: 0,
          violationHistory: [],
          isApproved: true,
          approvedAt: new Date(),
          totalSales: 0,
          totalOrders: 0,
          rating: 4.5,
          shopCount: 0,
        });
        console.log(`✅ Created trader profile for: ${traderUser.email}`);

        // Create 2 shops for each trader
        for (let j = 1; j <= 2; j++) {
          const shopName = `${traderUser.firstName} ${businessType} Shop ${j}`;
          const shop = await Shop.create({
            traderId: trader.id,
            name: shopName,
            description: `Premium ${businessType.toLowerCase()} products and accessories`,
            category: businessType,
            address: `Shop ${j} Address, Thamel, Kathmandu, Nepal`,
            phone: `+977-98${Math.floor(Math.random() * 10000000)
              .toString()
              .padStart(8, "0")}`,
            email: `${shopName.toLowerCase().replace(/\s+/g, "")}@shop.com`,
            isActive: true,
            totalProducts: 0,
            totalSales: 0,
            totalOrders: 0,
            rating: Math.random() * 1 + 4, // 4.0 - 5.0
            logo: `/logos/${businessType.toLowerCase()}-logo.png`,
            banner: `/banners/${businessType.toLowerCase()}-banner.jpg`,
            socialLinks: {
              facebook: `https://facebook.com/${shopName.replace(/\s+/g, "")}`,
              instagram: `https://instagram.com/${shopName.replace(
                /\s+/g,
                ""
              )}`,
            },
          });
          console.log(`✅ Created shop: ${shopName}`);

          // Create 5 products for each shop
          const productTemplates = {
            Electronics: [
              {
                name: "Smartphone Pro",
                price: 75000,
                description:
                  "Latest flagship smartphone with advanced features",
              },
              {
                name: "Wireless Earbuds",
                price: 8500,
                description: "Premium wireless earbuds with noise cancellation",
              },
              {
                name: "Gaming Laptop",
                price: 125000,
                description: "High-performance gaming laptop",
              },
              {
                name: "Smart Watch",
                price: 35000,
                description: "Feature-rich smartwatch with health monitoring",
              },
              {
                name: "Wireless Charger",
                price: 4500,
                description: "Fast wireless charging pad",
              },
            ],
            Fashion: [
              {
                name: "Designer T-Shirt",
                price: 2500,
                description: "Premium cotton designer t-shirt",
              },
              {
                name: "Denim Jeans",
                price: 4500,
                description: "Comfortable and stylish denim jeans",
              },
              {
                name: "Sports Sneakers",
                price: 7500,
                description: "High-performance sports sneakers",
              },
              {
                name: "Leather Jacket",
                price: 12000,
                description: "Genuine leather jacket",
              },
              {
                name: "Summer Dress",
                price: 3500,
                description: "Elegant summer dress for all occasions",
              },
            ],
            Books: [
              {
                name: "Programming Guide",
                price: 1200,
                description: "Comprehensive programming guide for beginners",
              },
              {
                name: "Mystery Novel",
                price: 800,
                description: "Bestselling mystery novel",
              },
              {
                name: "Business Strategy",
                price: 1500,
                description: "Essential business strategy book",
              },
              {
                name: "Science Fiction",
                price: 1000,
                description: "Award-winning science fiction novel",
              },
              {
                name: "Self-Help Guide",
                price: 900,
                description: "Life-changing self-help guide",
              },
            ],
            General: [
              {
                name: "Water Bottle",
                price: 1200,
                description: "Insulated stainless steel water bottle",
              },
              {
                name: "Travel Backpack",
                price: 3500,
                description: "Durable travel backpack",
              },
              {
                name: "Notebook Set",
                price: 800,
                description: "Premium notebook set",
              },
              {
                name: "Pen Collection",
                price: 1500,
                description: "Professional pen collection",
              },
              {
                name: "Desk Organizer",
                price: 2200,
                description: "Wooden desk organizer",
              },
            ],
          };

          const products =
            productTemplates[businessType] || productTemplates.General;

          for (let k = 0; k < 5; k++) {
            const template = products[k];
            const productName = `${template.name} - ${shopName}`;

            await Product.create({
              shopId: shop.id,
              name: productName,
              description: template.description,
              category: businessType,
              subCategory: template.name.split(" ")[0],
              price: template.price + (Math.random() * 1000 - 500), // Add some variation
              originalPrice: template.price + 500,
              currency: "NPR",
              stock: Math.floor(Math.random() * 50) + 10,
              sku: `${businessType.toUpperCase()}-${j}${k + 1}-${Date.now()}`,
              isActive: true,
              isViolated: false,
              images: [`/products/${businessType.toLowerCase()}-${k + 1}.jpg`],
              specifications: {
                brand: `${traderUser.firstName} Brand`,
                warranty: "1 year",
                origin: "Nepal",
              },
              tags: [
                businessType.toLowerCase(),
                traderUser.firstName.toLowerCase(),
              ],
              views: Math.floor(Math.random() * 1000),
              totalSales: Math.floor(Math.random() * 100),
              rating: Math.random() * 1 + 4, // 4.0 - 5.0
              reviewCount: Math.floor(Math.random() * 50),
              weight: Math.random() * 5 + 0.5,
              dimensions: { length: 10, width: 8, height: 5 },
              shippingClass: "standard",
              slug: productName
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
              metaTitle: productName,
              metaDescription: template.description,
            });
          }
          console.log(`✅ Created 5 products for: ${shopName}`);

          // Update shop product count
          await shop.update({ totalProducts: 5 });
        }

        // Update trader shop count
        await trader.update({ shopCount: 2 });
      } else {
        console.log(
          `ℹ️  Trader profile already exists for: ${traderUser.email}`
        );
      }
    }

    // Final summary
    const finalCounts = {
      users: await User.count(),
      traders: await Trader.count(),
      shops: await Shop.count(),
      products: await Product.count(),
    };

    console.log(`\n🎉 Database setup complete!`);
    console.log(`\n📊 Final counts:`);
    console.log(`- Users: ${finalCounts.users}`);
    console.log(`- Traders: ${finalCounts.traders}`);
    console.log(`- Shops: ${finalCounts.shops}`);
    console.log(`- Products: ${finalCounts.products}`);

    console.log(`\n👥 Test Accounts:`);
    console.log(`🔑 Admin: admin@bptrade.com / admin123`);
    console.log(`🏪 Trader: electronics@trader.com / trader123`);
    console.log(`🏪 Trader: fashion@trader.com / trader123`);
    console.log(`🏪 Trader: books@trader.com / trader123`);
    console.log(`👤 Customer: customer@test.com / customer123`);

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addTraderData();
