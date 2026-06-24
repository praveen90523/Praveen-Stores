const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      max: [99999999, "Price cannot exceed 8 figures"],
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    brand: {
      type: String,
      default: "",
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Transform images array of objects to array of strings when serialized to JSON/object
const transformProduct = (doc, ret) => {
  if (ret.images && Array.isArray(ret.images)) {
    ret.images = ret.images.map((img) => (img && typeof img === "object" && img.url ? img.url : img));
  }
  return ret;
};

productSchema.set("toJSON", { transform: transformProduct, virtuals: true });
productSchema.set("toObject", { transform: transformProduct, virtuals: true });

module.exports = mongoose.model("Product", productSchema);