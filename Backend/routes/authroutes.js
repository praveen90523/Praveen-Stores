const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

router.post("/signup", registerUser);

router.post("/login", loginUser);

router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

module.exports = router;