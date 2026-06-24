const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Sum revenue from non-cancelled orders
    const completedOrders = await Order.find({
      orderStatus: { $ne: "Cancelled" },
    });
    
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort("-createdAt")
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
      },
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
