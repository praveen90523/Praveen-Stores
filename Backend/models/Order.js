const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      pinCode: { type: String, required: true },
      phoneNo: { type: String, required: true },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, default: "" },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
    paymentInfo: {
      id: { type: String, required: true },
      status: { type: String, required: true },
    },
    paidAt: {
      type: Date,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
