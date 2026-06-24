import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, deleteProduct, clearProductErrors } from "../../redux/slices/productSlice";
import { Plus, Edit3, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const ManageProducts = () => {
  const dispatch = useDispatch();
  const { products, loading, error, success } = useSelector((state) => state.products);

  useEffect(() => {
    // Fetch all products (passing limit=all to get all items)
    dispatch(fetchProducts("?limit=all"));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearProductErrors());
    }
    if (success) {
      toast.success("Product modified successfully!");
      dispatch(clearProductErrors());
    }
  }, [error, success, dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(id));
      toast.success("Product deleted successfully");
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="space-y-6">
        
        {/* Header Title */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-wider text-gray-900 dark:text-white uppercase">
              Manage Products
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Store catalog inventory items.
            </p>
          </div>

          <Link
            to="/admin/products/new"
            className="bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition duration-150 flex items-center gap-2 shadow-lg shadow-cyan-500/10"
          >
            <Plus size={16} /> Create Product
          </Link>
        </div>

        {/* Product Table grid */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                  <th className="py-4 px-4">Image</th>
                  <th className="py-4 px-4">Product Name</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4 text-right">Price</th>
                  <th className="py-4 px-4 text-center">Stock</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-slate-800/50 text-xs text-gray-700 dark:text-gray-300">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center justify-center gap-2">
                      <ShoppingBag size={32} />
                      <span>No products found. Add a product to get started.</span>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const imgUrl = product.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80";
                    return (
                      <tr key={product._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                        <td className="py-4 px-4">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 flex items-center justify-center">
                            <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-gray-800 dark:text-gray-200">{product.name}</td>
                        <td className="py-4 px-4">
                          <span className="bg-cyan-50 dark:bg-slate-900 border border-cyan-100 dark:border-slate-800 px-2.5 py-1 rounded-full text-[10px] text-cyan-600 dark:text-cyan-400">
                            {product.category?.name || "Uncategorized"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-gray-900 dark:text-gray-100">
                          ₹{product.price.toLocaleString("en-IN")}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`font-bold ${product.stock < 5 ? "text-red-500 dark:text-pink-500" : "text-green-600 dark:text-green-500"}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex gap-3 justify-end">
                            <Link
                              to={`/admin/products/edit/${product._id}`}
                              className="p-2 text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/5 rounded-lg border border-transparent hover:border-cyan-200 dark:hover:border-cyan-500/10 transition"
                            >
                              <Edit3 size={14} />
                            </Link>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-pink-500 hover:bg-red-50 dark:hover:bg-pink-500/5 rounded-lg border border-transparent hover:border-red-200 dark:hover:border-pink-500/10 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
};

export default ManageProducts;
