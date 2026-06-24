const Order = require("../models/Order");
const Product = require("../models/Product");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

// 1. Create Razorpay Order
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body; // Amount in INR

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise (integers only)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Verify Razorpay Payment Signature
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret")
      .update(body.toString())
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (isSignatureValid) {
      res.status(200).json({
        success: true,
        message: "Payment signature verified successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid signature verification",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. Create New Order in DB
const createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalAmount,
    } = req.body;

    const order = await Order.create({
      shippingAddress,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalAmount,
      paidAt: Date.now(),
      user: req.user.id,
    });

    // Update stock for each product in the order
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save({ validateBeforeSave: false });
      }
    }

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Get Single Order Details
const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "No order found with this ID",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 5. Get Logged In User's Orders
const myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort("-createdAt");

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 6. Get All Orders (Admin Only)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort("-createdAt");

    let totalAmount = 0;
    orders.forEach((order) => {
      totalAmount += order.totalAmount;
    });

    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 7. Update Order Status (Admin Only)
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "No order found with this ID",
      });
    }

    if (order.orderStatus === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "You have already delivered this order",
      });
    }

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 8. Cancel Order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "No order found with this ID",
      });
    }

    // Check permissions: either admin or order owner
    const isOwner = order.user.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to cancel this order",
      });
    }

    if (order.orderStatus === "Delivered" || order.orderStatus === "Shipped") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order that is already ${order.orderStatus.toLowerCase()}`,
      });
    }

    order.orderStatus = "Cancelled";
    await order.save();

    // Revert product stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save({ validateBeforeSave: false });
      }
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
