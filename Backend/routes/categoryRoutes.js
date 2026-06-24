const express = require("express");
const router = express.Router();

const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const protect = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Public routes
router.get("/", getCategories);

// Admin only routes
router.post("/", protect, role("admin"), createCategory);
router.put("/:id", protect, role("admin"), updateCategory);
router.delete("/:id", protect, role("admin"), deleteCategory);

module.exports = router;
