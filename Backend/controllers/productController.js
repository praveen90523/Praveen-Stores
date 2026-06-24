const Product = require("../models/Product");
const APIFeatures = require("../utils/apiFeatures");

// Create Product (Admin Only)
const createProduct = async (req, res) => {
  try {
    req.body.user = req.user.id;

    if (req.body.images && Array.isArray(req.body.images)) {
      req.body.images = req.body.images.map((img) => {
        if (typeof img === "string") {
          return { url: img };
        }
        return img;
      });
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Products (Filtered, Sorted, Paginated)
const getProducts = async (req, res) => {
  try {
    const productsCount = await Product.countDocuments();
    const resPerPage = req.query.limit ? (req.query.limit === "all" ? productsCount || 1000 : Number(req.query.limit)) : 8;

    // Get count of filtered products before pagination
    const countFeatures = new APIFeatures(Product.find(), req.query)
      .search()
      .filter();
    const filteredProductsCount = await countFeatures.query.countDocuments();

    // Reset query for pagination
    const apiFeaturesPaginated = new APIFeatures(Product.find().populate("category"), req.query)
      .search()
      .filter()
      .sort()
      .pagination(resPerPage);

    const products = await apiFeaturesPaginated.query;

    const currentPage = Number(req.query.page) || 1;
    const totalPages = Math.ceil(filteredProductsCount / resPerPage) || 1;

    res.status(200).json({
      success: true,
      products,
      page: currentPage,
      pages: totalPages,
      totalProducts: filteredProductsCount,
      resPerPage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Product
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("reviews.user", "name email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Product (Admin Only)
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    if (req.body.images && Array.isArray(req.body.images)) {
      req.body.images = req.body.images.map((img) => {
        if (typeof img === "string") {
          return { url: img };
        }
        return img;
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Product (Admin Only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create or Update Product Review
const createProductReview = async (req, res) => {
  try {
    const { rating, comment, productId } = req.body;

    const review = {
      user: req.user.id,
      name: req.user.name || "Customer",
      rating: Number(rating),
      comment,
    };

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const isReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user.id.toString()
    );

    if (isReviewed) {
      product.reviews.forEach((r) => {
        if (r.user.toString() === req.user.id.toString()) {
          r.comment = comment;
          r.rating = rating;
        }
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }

    // Calculate overall rating
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Review submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Reviews of a Product
const getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.query.id).populate("reviews.user", "name email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Product Review
const deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.query.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );

    const numOfReviews = reviews.length;

    const rating =
      numOfReviews === 0
        ? 0
        : reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews;

    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        rating,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteReview,
};