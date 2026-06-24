import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { addToLocalCart, addToDBCart } from "../redux/slices/cartSlice";
import { addToWishlist, removeFromWishlist } from "../redux/slices/wishlistSlice";
import { Star, ShoppingCart, Heart, ArrowUpDown } from "lucide-react";
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
    e.stopPropagation();
    if (isCompared) {
      removeFromCompareList(product._id);
      toast.info(`${product.name} removed from comparison`);
    } else {
      addToCompareList(product);
    }
  };

  const displayImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80";

  const discountPercent = product.price > 10000 ? 20 : product.price > 3000 ? 15 : 10;
  const originalPrice = Math.round(product.price / (1 - discountPercent / 100));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden flex flex-col relative group border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">

      {/* Discount Badge */}
      <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-cyan-500 to-sky-600 text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
        -{discountPercent}%
      </span>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-gray-400 hover:text-red-500 shadow-sm transition-all duration-200"
      >
        <Heart size={14} fill={isWishlisted ? "#ef4444" : "none"} className={isWishlisted ? "text-red-500" : ""} />
      </button>

      {/* Compare Button */}
      <button
        onClick={handleCompareToggle}
        className={`absolute top-12 right-3 z-10 p-2 rounded-full border shadow-sm transition-all duration-200 ${
          isCompared
            ? "bg-cyan-600 text-white border-cyan-600"
            : "bg-white dark:bg-slate-700 border-slate-100 dark:border-slate-600 text-gray-400 hover:text-cyan-600"
        }`}
        title={isCompared ? "Remove from Compare" : "Add to Compare"}
      >
        <ArrowUpDown size={14} />
      </button>

      {/* Product Image */}
      <Link to={`/products/${product._id}`} className="block overflow-hidden h-52 bg-slate-50 dark:bg-slate-700 relative">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.stock < 1 && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Out of stock
            </span>
          </div>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <span className="text-[9px] uppercase font-semibold tracking-widest text-cyan-600 dark:text-cyan-400">
            {product.category?.name || "Premium"}
          </span>
          <Link to={`/products/${product._id}`}>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mt-1 mb-2 hover:text-cyan-600 dark:hover:text-cyan-400 transition line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  fill={i < Math.round(product.rating || 0) ? "#f59e0b" : "none"}
                  className="stroke-1"
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">
              ({product.numOfReviews || 0})
            </span>
          </div>
        </div>

        {/* Price + Cart */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-700">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-300 dark:text-slate-500 line-through">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
            <span className="text-base font-bold text-gray-900 dark:text-white">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock < 1}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 disabled:from-slate-200 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-800 disabled:text-slate-400 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ShoppingCart size={13} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;