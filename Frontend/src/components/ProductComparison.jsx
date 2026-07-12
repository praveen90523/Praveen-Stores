import React, { useContext, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { X, ArrowUpDown, Star, ShoppingCart, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToLocalCart, addToDBCart } from "../redux/slices/cartSlice";
import { toast } from "react-toastify";

const ProductComparison = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { compareList, removeFromCompareList, clearCompareList } = useContext(ThemeContext);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddToCart = async (product) => {
    if (product.stock < 1) {
      toast.warning("Product out of stock");
      return;
    }

    try {
      console.log("[ProductComparison] addToCart clicked", { productId: product._id, product });
      if (isAuthenticated) {
        const resultAction = await dispatch(
          addToDBCart({ productId: product._id, quantity: 1 })
        ).unwrap();
        console.log("[ProductComparison] addToDBCart success", resultAction);
      } else {
        dispatch(addToLocalCart({ product, quantity: 1 }));
        console.log("[ProductComparison] addToLocalCart success", { product, quantity: 1 });
      }
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error("[ProductComparison] addToCart failed", error);
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to add product to cart"
      );
    }
  };

  if (compareList.length === 0) return null;

  return (
    <>
      {/* Bottom Sticky Dock Bar */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 py-3 px-4 shadow-2xl animate-fade-in-up">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ocean-primary/10 border border-ocean-primary/20 flex items-center justify-center text-ocean-primary">
              <ArrowUpDown size={18} />
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                Compare Products ({compareList.length}/4)
              </h5>
              <p className="text-[10px] text-slate-450 text-slate-400">
                Select up to 4 products to compare specs and values.
              </p>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex flex-wrap gap-2.5 items-center">
            {compareList.map((prod) => (
              <div
                key={prod._id}
                className="relative bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1 pr-6 flex items-center gap-2"
              >
                <img
                  src={prod.images?.[0] || "https://i.pinimg.com/1200x/09/b1/02/09b1022987a9ce464000a1777a6859f4.jpg"}
                  alt={prod.name}
                  className="w-8 h-8 object-cover rounded"
                />
                <span className="text-[10px] font-medium text-slate-800 dark:text-slate-250 truncate max-w-[80px]">
                  {prod.name}
                </span>
                <button
                  onClick={() => removeFromCompareList(prod._id)}
                  className="absolute right-1 top-2.5 text-slate-400 hover:text-rose-500 transition"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearCompareList}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium transition"
            >
              Clear All
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-ocean-primary hover:bg-ocean-secondary text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20"
            >
              Compare Now
            </button>
          </div>
        </div>
      </div>

      {/* Full Specs Comparison Overlay Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-slate-950 w-full max-w-5xl rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] shadow-2xl animate-scale-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ArrowUpDown size={18} className="text-ocean-primary" /> Product Comparison Matrix
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-slate-150 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-650 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Comparison Grid */}
            <div className="flex-grow overflow-x-auto p-6 scroll-smooth select-text">
              <table className="w-full min-w-[700px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="py-4 pr-4 font-bold text-slate-400 w-1/5">Specification</th>
                    {compareList.map((prod) => (
                      <th key={prod._id} className="py-4 px-4 w-1/4">
                        <div className="flex flex-col gap-2">
                          <img
                            src={prod.images?.[0] || "https://i.pinimg.com/1200x/fb/bb/c2/fbbbc25b5993a79392a64e68068e4cb1.jpg"}
                            alt={prod.name}
                            className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                          />
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
                            {prod.name}
                          </h4>
                          <span className="text-[9px] uppercase tracking-widest text-ocean-primary font-bold">
                            {prod.category?.name || "Catalog Item"}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {/* Price Row */}
                  <tr>
                    <td className="py-4 pr-4 font-bold text-slate-400">Price</td>
                    {compareList.map((prod) => (
                      <td key={prod._id} className="py-4 px-4 font-bold text-slate-900 dark:text-slate-50 text-sm">
                        ₹{prod.price.toLocaleString("en-IN")}
                      </td>
                    ))}
                  </tr>

                  {/* Rating Row */}
                  <tr>
                    <td className="py-4 pr-4 font-bold text-slate-400">Rating</td>
                    {compareList.map((prod) => (
                      <td key={prod._id} className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                fill={i < Math.round(prod.rating || 0) ? "#f59e0b" : "none"}
                                className="stroke-1"
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400">({prod.numOfReviews || 0})</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Availability Row */}
                  <tr>
                    <td className="py-4 pr-4 font-bold text-slate-400">Availability</td>
                    {compareList.map((prod) => (
                      <td key={prod._id} className="py-4 px-4">
                        {prod.stock > 0 ? (
                          <span className="text-emerald-500 font-semibold">{prod.stock} In Stock</span>
                        ) : (
                          <span className="text-rose-500 font-semibold">Out of Stock</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Description Row */}
                  <tr>
                    <td className="py-4 pr-4 font-bold text-slate-400">Description</td>
                    {compareList.map((prod) => (
                      <td key={prod._id} className="py-4 px-4 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-4">
                        {prod.description}
                      </td>
                    ))}
                  </tr>

                  {/* Actions Row */}
                  <tr>
                    <td className="py-4 pr-4 font-bold text-slate-400">Actions</td>
                    {compareList.map((prod) => (
                      <td key={prod._id} className="py-4 px-4">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleAddToCart(prod)}
                            disabled={prod.stock < 1}
                            className="bg-ocean-primary hover:bg-ocean-secondary text-white disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 text-[10px] font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            <ShoppingCart size={12} /> Add To Cart
                          </button>
                          <Link
                            to={`/products/${prod._id}`}
                            onClick={() => setModalOpen(false)}
                            className="text-center text-[10px] font-semibold text-ocean-primary hover:underline"
                          >
                            View Product Details
                          </Link>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
              <button
                onClick={() => {
                  clearCompareList();
                  setModalOpen(false);
                }}
                className="text-xs font-semibold text-rose-500 hover:underline px-4 py-2"
              >
                Clear All & Close
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-5 py-2.5 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductComparison;
