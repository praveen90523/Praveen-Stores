import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { addToLocalCart, addToDBCart } from "../redux/slices/cartSlice";
import { addToWishlist, removeFromWishlist } from "../redux/slices/wishlistSlice";
import { Star, ShoppingCart, Heart, ArrowUpDown, Eye } from "lucide-react";
import { toast } from "react-toastify";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { compareList, addToCompareList, removeFromCompareList } = useContext(ThemeContext);

  const isWishlisted = wishlistItems.some((item) => item._id === product._id);
  const isCompared = compareList.some((item) => item._id === product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock < 1) {
      toast.warning("Product out of stock");
      return;
    }
    if (isAuthenticated) {
      dispatch(addToDBCart({ productId: product._id, quantity: 1 }));
    } else {
      dispatch(addToLocalCart({ product, quantity: 1 }));
    }
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
      toast.info(`${product.name} removed from wishlist`);
    } else {
      dispatch(addToWishlist(product));
      toast.success(`${product.name} added to wishlist!`);
    }
  };

  const handleCompareToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompareList(product._id);
      toast.info(`${product.name} removed from comparison`);
    } else {
      addToCompareList(product);
      toast.success(`${product.name} added to compare list!`);
    }
  };

  const displayImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://i.pinimg.com/1200x/be/3c/58/be3c58f1bbd182e1e632f73bc4ba20db.jpg";

  // Calculate discount dynamically based on db data, fallback to rating-based estimate
  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : (product.price > 10000 ? 20 : product.price > 3000 ? 15 : 10);

  const originalPrice =
    product.originalPrice > product.price
      ? product.originalPrice
      : Math.round(product.price / (1 - discountPercent / 100));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden flex flex-col relative group border border-slate-100 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-350 h-[380px]">
      
      {/* Top Banner Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        <span className="bg-slate-900/90 dark:bg-sky-500/95 text-white text-[8px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-widest shadow-sm">
          -{discountPercent}% OFF
        </span>
        {product.rating >= 4.7 && (
          <span className="bg-amber-400/95 text-slate-900 text-[8px] font-extrabold px-2 py-0.5 rounded-md tracking-wider flex items-center gap-0.5 shadow-sm">
            ★ HOT
          </span>
        )}
      </div>

      {/* Product Image Portion */}
      <div className="relative overflow-hidden h-[210px] bg-slate-50 dark:bg-slate-900 border-b border-slate-50 dark:border-slate-800">
        <Link to={`/products/${product._id}`} className="block h-full w-full">
          <img
            src={displayImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
        </Link>

        {/* Out of Stock Overlay */}
        {product.stock < 1 && (
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/80 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-slate-900/95 dark:bg-slate-800 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-md">
              Sold Out
            </span>
          </div>
        )}

        {/* Hover Actions Bar (Slides up from the bottom of image container) */}
        {product.stock > 0 && (
          <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent flex justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
            
            {/* Wishlist Toggle Button */}
            <button
              onClick={handleWishlistToggle}
              className={`p-2.5 rounded-full border shadow-sm transition duration-200 ${
                isWishlisted
                  ? "bg-red-500 border-red-500 text-white"
                  : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
              title="Add to Wishlist"
            >
              <Heart size={13} fill={isWishlisted ? "#ffffff" : "none"} />
            </button>

            {/* Quick View Link */}
            <Link
              to={`/products/${product._id}`}
              className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm transition duration-200"
              title="Quick View"
            >
              <Eye size={13} />
            </Link>

            {/* Compare Toggle Button */}
            <button
              onClick={handleCompareToggle}
              className={`p-2.5 rounded-full border shadow-sm transition duration-200 ${
                isCompared
                  ? "bg-sky-500 border-sky-500 text-white"
                  : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
              title={isCompared ? "Remove from Compare" : "Compare Specs"}
            >
              <ArrowUpDown size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Card Content details */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        
        <div>
          {/* Brand & Category Details */}
          <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
            <span className="text-sky-500 font-semibold">{product.brand || "Stores Selection"}</span>
            <span>{product.category?.name || "Premium"}</span>
          </div>

          {/* Product Name */}
          <Link to={`/products/${product._id}`}>
            <h3 className="font-bold text-slate-800 dark:text-white text-xs md:text-sm leading-snug line-clamp-1 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Star Rating details */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  fill={i < Math.round(product.rating || 0) ? "#f59e0b" : "none"}
                  className={i < Math.round(product.rating || 0) ? "stroke-0" : "stroke-1"}
                />
              ))}
            </div>
            <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold">
              {product.rating ? product.rating.toFixed(1) : "4.5"} ({product.numOfReviews || 12} reviews)
            </span>
          </div>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 mt-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through font-semibold">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white leading-none mt-0.5">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock < 1}
            className="flex items-center justify-center w-8.5 h-8.5 rounded-full bg-slate-900 hover:bg-sky-500 disabled:bg-slate-100 dark:bg-slate-700 dark:hover:bg-sky-500 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 transition-all duration-200 shadow-sm hover:shadow"
            title="Add to Cart"
          >
            <ShoppingCart size={13} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;