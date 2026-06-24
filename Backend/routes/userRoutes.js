const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  forgotPassword,
  resetPassword,
  getUsers,
  deleteUser,
  blockUser,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Profile routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/password", protect, updateUserPassword);

// Password recovery
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:token", resetPassword);

// Admin-only user management routes
router.get("/admin", protect, role("admin"), getUsers);
router.delete("/admin/:id", protect, role("admin"), deleteUser);
router.put("/admin/block/:id", protect, role("admin"), blockUser);

module.exports = router;
