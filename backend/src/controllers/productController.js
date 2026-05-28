const { Product, Shop, Trader, User } = require("../models");
const { Op } = require("sequelize");

// Get all products with filtering, sorting, and pagination
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sortBy = "createdAt",
      sortOrder = "DESC",
      minPrice,
      maxPrice,
      inStock,
    } = req.query;

    // Build where clause
    const whereClause = {
      isActive: true,
      isViolated: false,
    };

    // Category filter
    if (category && category !== "all") {
      whereClause.category = {
        [Op.iLike]: `%${category}%`,
      };
    }

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } },
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock === "true") {
      whereClause.stock = { [Op.gt]: 0 };
    }

    // Build order clause
    let orderClause = [];
    switch (sortBy) {
      case "price-low":
        orderClause = [["price", "ASC"]];
        break;
      case "price-high":
        orderClause = [["price", "DESC"]];
        break;
      case "rating":
        orderClause = [["averageRating", "DESC"]];
        break;
      case "newest":
        orderClause = [["createdAt", "DESC"]];
        break;
      case "popular":
        orderClause = [["views", "DESC"]];
        break;
      default:
        orderClause = [[sortBy, sortOrder]];
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Query products with associations
    const { rows: products, count: totalProducts } =
      await Product.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Shop,
            attributes: ["id", "name", "description"],
            include: [
              {
                model: Trader,
                attributes: ["id"],
                include: [
                  {
                    model: User,
                    attributes: ["firstName", "lastName", "email"],
                  },
                ],
              },
            ],
          },
        ],
        order: orderClause,
        limit: parseInt(limit),
        offset: offset,
        distinct: true,
      });

    // Transform data for frontend
    const transformedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      originalPrice: product.originalPrice
        ? parseFloat(product.originalPrice)
        : null,
      category: product.category,
      subCategory: product.subCategory,
      image:
        product.images && product.images.length > 0
          ? product.images[0]
          : "/api/placeholder/300x300",
      images: product.images || [],
      rating: parseFloat(product.averageRating) || 4.0,
      reviews: product.totalReviews || 0,
      stock: product.stock,
      inStock: product.stock > 0,
      sku: product.sku,
      shop: product.Shop?.name || "Unknown Shop",
      trader: product.Shop?.Trader?.User
        ? `${product.Shop.Trader.User.firstName} ${product.Shop.Trader.User.lastName}`.trim()
        : "Unknown Trader",
      points: Math.ceil(parseFloat(product.price) / 100), // 1 point per ₹100
      discount: product.originalPrice
        ? Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) *
              100
          )
        : 0,
      features: product.specifications?.features || [],
      tags: product.tags || [],
      views: product.views || 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalProducts / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit),
        },
        filters: {
          category,
          search,
          sortBy,
          sortOrder,
          minPrice,
          maxPrice,
          inStock,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: {
        id,
        isActive: true,
        isViolated: false,
      },
      include: [
        {
          model: Shop,
          attributes: ["id", "name", "description"],
          include: [
            {
              model: Trader,
              attributes: ["id"],
              include: [
                {
                  model: User,
                  attributes: ["firstName", "lastName", "email"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Increment view count
    await product.increment("views");

    // Transform data for frontend
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      originalPrice: product.originalPrice
        ? parseFloat(product.originalPrice)
        : null,
      category: product.category,
      subCategory: product.subCategory,
      image:
        product.images && product.images.length > 0
          ? product.images[0]
          : "/api/placeholder/300x300",
      images: product.images || [],
      rating: parseFloat(product.averageRating) || 4.0,
      reviews: product.totalReviews || 0,
      stock: product.stock,
      inStock: product.stock > 0,
      sku: product.sku,
      shop: {
        id: product.Shop?.id,
        name: product.Shop?.name || "Unknown Shop",
        description: product.Shop?.description,
      },
      trader: product.Shop?.Trader?.User
        ? {
            name: `${product.Shop.Trader.User.firstName} ${product.Shop.Trader.User.lastName}`.trim(),
            email: product.Shop.Trader.User.email,
          }
        : { name: "Unknown Trader", email: null },
      points: Math.ceil(parseFloat(product.price) / 100),
      discount: product.originalPrice
        ? Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) *
              100
          )
        : 0,
      features: product.specifications?.features || [],
      specifications: product.specifications || {},
      tags: product.tags || [],
      views: product.views || 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    res.json({
      success: true,
      data: transformedProduct,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Get product categories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.findAll({
      attributes: [
        "category",
        [Product.sequelize.fn("COUNT", Product.sequelize.col("id")), "count"],
      ],
      where: {
        isActive: true,
        isViolated: false,
      },
      group: ["category"],
      order: [
        [Product.sequelize.fn("COUNT", Product.sequelize.col("id")), "DESC"],
      ],
    });

    const transformedCategories = categories.map((cat, index) => ({
      id: index + 1,
      name: cat.category,
      count: parseInt(cat.get("count")),
      // Add some default icons - you can customize these
      icon: getCategoryIcon(cat.category),
    }));

    res.json({
      success: true,
      data: transformedCategories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Helper function to get category icons
const getCategoryIcon = (category) => {
  const iconMap = {
    Electronics: "💻",
    Fashion: "👕",
    Home: "🏠",
    Kitchen: "🍽️",
    Health: "💊",
    Beauty: "💄",
    Sports: "⚽",
    Fitness: "🏋️",
    Books: "📚",
    Toys: "🧸",
    Automotive: "🚗",
    Garden: "🌱",
  };

  return iconMap[category] || "📦";
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
};
