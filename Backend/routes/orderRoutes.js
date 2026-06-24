const express = require("express");
const router = express.Router();

const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// All routes here require login authentication
router.use(protect);

router.post("/pay", createRazorpayOrder);
router.post("/verify", verifyRazorpayPayment);
router.post("/new", createOrder);
router.get("/me", myOrders);
router.put("/cancel/:id", cancelOrder);
router.get("/:id", getSingleOrder);

// Admin-only order routes
router.get("/admin/all", role("admin"), getAllOrders);
router.put("/admin/:id", role("admin"), updateOrderStatus);

module.exports = router;
