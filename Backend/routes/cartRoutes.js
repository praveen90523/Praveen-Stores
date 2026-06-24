const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
} = require("../controllers/cartController");

const protect = require("../middleware/authMiddleware");

// All cart routes require user authorization
router.use(protect);

router.get("/", getCart);

// Support both standard RESTful paths and original explicit paths
router.post("/", addToCart);
router.post("/add", addToCart);

router.put("/", updateCartItem);
router.put("/update", updateCartItem);

router.delete("/clear", clearCart);
router.delete("/", clearCart);

router.delete("/remove/:productId", removeFromCart);
router.delete("/:productId", removeFromCart);

router.post("/sync", syncCart);

module.exports = router;
