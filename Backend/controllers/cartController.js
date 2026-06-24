const Cart = require("../models/Cart");

// Get or Create User Cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add Item to Cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity) || 1;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Product exists, increment quantity
      cart.items[itemIndex].quantity += qty;
    } else {
      // Product does not exist, add new item
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();
    const populatedCart = await cart.populate("items.product");

    res.status(200).json({
      success: true,
      cart: populatedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Cart Item Quantity
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = Number(quantity);
      await cart.save();
      const populatedCart = await cart.populate("items.product");

      return res.status(200).json({
        success: true,
        cart: populatedCart,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove Item from Cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product && item.product.toString() !== productId
    );

    await cart.save();
    const populatedCart = await cart.populate("items.product");

    res.status(200).json({
      success: true,
      cart: populatedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Clear Cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Merge local guest cart items with DB cart on login/signup
const syncCart = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Items must be an array",
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    for (const localItem of items) {
      const productId = localItem.product?._id || localItem.product || localItem.productId;
      const quantity = Number(localItem.quantity) || 1;

      if (!productId) continue;

      const itemIndex = cart.items.findIndex(
        (item) => item.product && item.product.toString() === productId.toString()
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();
    const populatedCart = await cart.populate("items.product");

    res.status(200).json({
      success: true,
      cart: populatedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
};
