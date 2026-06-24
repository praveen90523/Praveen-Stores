const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../controllers/adminController");
const protect = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/dashboard", protect, role("admin"), getDashboardStats);

module.exports = router;