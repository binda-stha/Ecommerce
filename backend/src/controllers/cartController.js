const { Cart, CartItem } = require("../models/Cart");
const Product = require("../models/Product");

// Sync cart from localStorage to DB after login
exports.syncCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = req.body.items || [];
    if (!Array.isArray(items))
      return res
        .status(400)
        .json({ success: false, message: "Invalid cart items" });

    // Find or create cart for user
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) cart = await Cart.create({ userId });

    // Remove old cart items
    await CartItem.destroy({ where: { cartId: cart.id } });

    // Add new items
    for (const item of items) {
      if (!item.id || !item.quantity) continue;
      // Validate product exists
      const product = await Product.findByPk(item.id);
      if (!product) continue;
      await CartItem.create({
        cartId: cart.id,
        productId: item.id,
        quantity: item.quantity,
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Cart sync error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get cart for logged-in user
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({
      where: { userId },
      include: [{ model: CartItem }],
    });
    if (!cart) return res.json({ success: true, cart: [] });
    return res.json({ success: true, cart: cart.CartItems });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
