const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteReview,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Public routes
router.get("/", getProducts);
router.get("/reviews", getProductReviews);
router.get("/:id", getProduct);

// User protected review routes
router.put("/review", protect, createProductReview);
router.delete("/review", protect, deleteReview);

// Admin only routes
router.post("/", protect, role("admin"), createProduct);
router.put("/:id", protect, role("admin"), updateProduct);
router.delete("/:id", protect, role("admin"), deleteProduct);

module.exports = router;