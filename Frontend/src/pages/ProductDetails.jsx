import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductDetails, addProductReview, clearProductErrors } from "../redux/slices/productSlice";
import { addToLocalCart, addToDBCart } from "../redux/slices/cartSlice";
import { addToWishlist, removeFromWishlist } from "../redux/slices/wishlistSlice";
import { ThemeContext } from "../context/ThemeContext";
import { Star, ShoppingCart, Heart, Plus, Minus, Send, AlertTriangle, ArrowUpDown, Sparkles, Zap, Check } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import axios from "axios";
import { API_URL } from "../utils/constants";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Settings & Theme Context
  const {
    addRecentlyViewed,
    compareList,
    addToCompareList,
    removeFromCompareList
  } = useContext(ThemeContext);

  const { product, loading, error, reviewSuccess } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Mock Variant Selections
  const [selectedColor, setSelectedColor] = useState("Ocean Blue");
  const [selectedSize, setSelectedSize] = useState("M");

  const colors = ["Ocean Blue", "Cloud White", "Sandy Grey"];
  const sizes = ["S", "M", "L", "XL"];

  const isWishlisted = wishlistItems.some((item) => item._id === id);
  const isCompared = compareList.some((item) => item._id === id);

  useEffect(() => {
    dispatch(fetchProductDetails(id));
  }, [id, dispatch]);

  // Set default active image and fetch related items when details load
  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
      setActiveImage(
        product.images && product.images.length > 0
          ? product.images[0]
          : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
      );
      
      if (product.category?._id) {
        axios
          .get(`${API_URL}/products?category=${product.category._id}`)
          .then((res) => {
            const items = res.data.products.filter((p) => p._id !== id);
            setRelatedProducts(items.slice(0, 4));
          })
          .catch((err) => console.error(err));
      }
    }
  }, [product, id]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearProductErrors());
    }
    if (reviewSuccess) {
      toast.success("Review submitted successfully!");
      setComment("");
      setRating(5);
      dispatch(clearProductErrors());
      dispatch(fetchProductDetails(id));
    }
  }, [error, reviewSuccess, id, dispatch]);

  const handleQtyChange = (action) => {
    if (action === "inc") {
      if (quantity >= product.stock) {
        toast.warning(`Only ${product.stock} items left in stock`);
        return;
      }
      setQuantity((q) => q + 1);
    } else {
      setQuantity((q) => Math.max(1, q - 1));
    }
  };

  const handleAddToCart = async () => {
    if (product.stock < 1) {
      toast.error("Product out of stock");
      return;
    }

    try {
      console.log("[ProductDetails] addToCart clicked", { productId: product._id, quantity });
      if (isAuthenticated) {
        const resultAction = await dispatch(
          addToDBCart({ productId: product._id, quantity })
        ).unwrap();
        console.log("[ProductDetails] addToDBCart success", resultAction);
      } else {
        dispatch(addToLocalCart({ product, quantity }));
        console.log("[ProductDetails] addToLocalCart success", { product, quantity });
      }
      toast.success(`${quantity} ${product.name} added to cart!`);
    } catch (error) {
      console.error("[ProductDetails] addToCart failed", error);
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to add product to cart"
      );
    }
  };

  const handleBuyNow = async () => {
    if (product.stock < 1) {
      toast.error("Product out of stock");
      return;
    }

    try {
      console.log("[ProductDetails] buyNow clicked", { productId: product._id, quantity });
      if (isAuthenticated) {
        const resultAction = await dispatch(
          addToDBCart({ productId: product._id, quantity })
        ).unwrap();
        console.log("[ProductDetails] addToDBCart success on buyNow", resultAction);
      } else {
        dispatch(addToLocalCart({ product, quantity }));
        console.log("[ProductDetails] addToLocalCart success on buyNow", { product, quantity });
      }
      navigate("/cart");
    } catch (error) {
      console.error("[ProductDetails] buyNow failed", error);
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to add product to cart"
      );
    }
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      dispatch(removeFromWishlist(id));
      toast.info("Removed from wishlist");
    } else {
      dispatch(addToWishlist(product));
      toast.success("Added to wishlist!");
    }
  };

  const handleCompareToggle = () => {
    if (isCompared) {
      removeFromCompareList(product._id);
      toast.info("Removed from comparison");
    } else {
      addToCompareList(product);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please add a comment");
      return;
    }
    dispatch(addProductReview({ rating, comment, productId: id }));
  };

  if (loading || !product) {
    return <Loader />;
  }

  const loyaltyPointsEarned = Math.round(product.price / 10);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 transition-colors duration-300">
        
        {/* Core Product Summary Grid with massive spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-8 mb-20 select-text">
          
          {/* Images Gallery */}
          <div className="space-y-4">
            <div className="glass-card rounded-3xl overflow-hidden h-[480px] bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 relative group">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain p-6 transition-transform duration-500 hover:scale-105 cursor-zoom-in"
              />
              <span className="absolute bottom-4 left-4 bg-white/70 dark:bg-slate-950/65 backdrop-blur px-2.5 py-1 rounded-lg text-[9px] font-bold text-slate-500 uppercase tracking-widest pointer-events-none select-none">
                🔍 Hover to zoom
              </span>
            </div>
            
            {/* Gallery thumbnails */}
            {product.images && product.images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2 select-none">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden glass-card flex-shrink-0 border-2 transition ${
                      activeImage === img ? "border-ocean-primary scale-95" : "border-transparent opacity-65 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Specs */}
          <div className="flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              
              {/* Category & Title */}
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-ocean-primary">
                  {product.category?.name || "Premium Catalog"}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 mt-1.5 mb-2 tracking-tight">
                  {product.name}
                </h1>
                
                {/* Rating score */}
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < Math.round(product.rating || 0) ? "#f59e0b" : "none"}
                        className="stroke-1"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {product.rating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({product.numOfReviews || 0} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="border-y border-slate-200 dark:border-slate-800 py-4">
                <span className="text-3xl font-black text-slate-900 dark:text-slate-50">
                  ₹{product.price?.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Details</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Mock Variants - Clean White Pills */}
              <div className="space-y-4 pt-2">
                {/* Color option */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Color: {selectedColor}</span>
                  <div className="flex gap-2 select-none">
                    {colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition font-semibold ${
                          selectedColor === c
                            ? "border-ocean-primary bg-ocean-primary/5 text-ocean-primary"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size options */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Size: {selectedSize}</span>
                  <div className="flex gap-2 select-none">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`w-9 h-9 rounded-xl border text-xs font-bold flex items-center justify-center transition ${
                          selectedSize === s
                            ? "border-ocean-primary bg-ocean-primary/5 text-ocean-primary"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Availability:</span>
                {product.stock > 0 ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">
                    In Stock ({product.stock} units)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/10">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Actions triggers */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800 select-none">
              {product.stock > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantity:</span>
                  <div className="flex items-center glass-card border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleQtyChange("dec")}
                      className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQtyChange("inc")}
                      className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              )}

              {/* Buttons: Add To Cart (Gradient) and Buy Now (White with blue border) */}
              <div className="flex flex-wrap gap-3.5">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock < 1}
                  className="flex-grow md:flex-grow-0 md:w-56 flex items-center justify-center gap-1.5 bg-gradient-ocean hover:opacity-95 text-white font-extrabold text-xs py-3.5 px-6 rounded-xl transition shadow shadow-cyan-500/10"
                >
                  <ShoppingCart size={14} />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock < 1}
                  className="flex-grow md:flex-grow-0 md:w-56 flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 dark:bg-slate-900 border border-ocean-primary text-ocean-primary hover:border-ocean-secondary hover:text-ocean-secondary font-extrabold text-xs py-3.5 px-6 rounded-xl transition"
                >
                  <Zap size={14} />
                  <span>Buy Now</span>
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3.5 rounded-xl flex items-center justify-center border transition ${
                    isWishlisted
                      ? "border-rose-500/20 bg-rose-500/5 text-rose-500"
                      : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart size={16} fill={isWishlisted ? "#ec4899" : "none"} />
                </button>

                {/* Compare Button */}
                <button
                  onClick={handleCompareToggle}
                  className={`p-3.5 rounded-xl flex items-center justify-center border transition ${
                    isCompared
                      ? "border-ocean-primary/20 bg-ocean-primary/5 text-ocean-primary"
                      : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  }`}
                  title={isCompared ? "Remove from Compare" : "Compare Specs"}
                >
                  <ArrowUpDown size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12 mb-20 pt-12 border-t border-slate-200 dark:border-slate-800 select-text">
          
          {/* Review Score */}
          <div className="space-y-6">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Customer Ratings</h2>
            
            <div className="glass-card p-6 rounded-3xl flex items-center gap-6 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <div className="text-center">
                <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                  {product.rating?.toFixed(1) || "0.0"}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">out of 5.0</p>
              </div>
              <div className="flex-1">
                <div className="flex text-yellow-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < Math.round(product.rating || 0) ? "#f59e0b" : "none"}
                      className="stroke-1"
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Based on {product.numOfReviews || 0} reviews</p>
              </div>
            </div>

            {/* Review form */}
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="glass-card p-6 rounded-3xl space-y-4 border border-slate-200 dark:border-slate-800 bg-white">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">Submit your feedback</h3>
                
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Score</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-yellow-400 hover:scale-110 transition duration-100"
                      >
                        <Star size={20} fill={star <= rating ? "#f59e0b" : "none"} className="stroke-1" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Review Comment</label>
                  <textarea
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your review here..."
                    className="w-full glass-input p-3 rounded-xl text-xs outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-ocean-primary hover:bg-ocean-secondary text-white font-semibold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-1"
                >
                  <Send size={12} /> Submit Review
                </button>
              </form>
            ) : (
              <div className="glass-card p-6 rounded-3xl text-center border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <AlertTriangle size={20} className="text-yellow-500 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Please{" "}
                  <Link to="/login" className="text-ocean-primary hover:underline font-bold">
                    Login
                  </Link>{" "}
                  to write a review.
                </p>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Reviews ({product.reviews?.length || 0})</h2>
            
            {product.reviews && product.reviews.length === 0 ? (
              <div className="glass-card p-8 rounded-3xl text-center text-slate-400 text-xs border border-slate-200 dark:border-slate-800">
                No reviews yet. Be the first to share your experience!
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {product.reviews?.map((rev) => (
                  <div key={rev._id} className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{rev.name}</h4>
                        <span className="text-[9px] text-slate-500 dark:text-slate-500">
                          {new Date(rev.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < rev.rating ? "#f59e0b" : "none"}
                            className="stroke-1"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-20 select-text">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-8 border-l-2 border-ocean-primary pl-2.5">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <div key={p._id} className="glass-card rounded-3xl overflow-hidden flex flex-col group border border-slate-200 dark:border-slate-800">
                  <Link to={`/products/${p._id}`} className="block h-40 overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <img
                      src={p.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="p-4 flex-grow flex flex-col justify-between space-y-2">
                    <Link to={`/products/${p._id}`}>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs line-clamp-1 group-hover:text-ocean-primary transition">
                        {p.name}
                      </h4>
                    </Link>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-300">
                      ₹{p.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default ProductDetails;
