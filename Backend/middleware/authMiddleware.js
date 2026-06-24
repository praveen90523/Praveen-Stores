const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      const user = await User.findById(decoded.id).select("-password");
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User no longer exists",
        });
      }

      if (user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: "Your account has been blocked. Please contact support.",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid Token",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No Token Found",
    });
  }
};

module.exports = protect;