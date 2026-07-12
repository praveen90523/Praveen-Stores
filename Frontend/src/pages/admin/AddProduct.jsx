import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { createProduct, fetchCategories, clearProductErrors } from "../../redux/slices/productSlice";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const AddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, success, categories } = useSelector((state) => state.products);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imagesInput: "",
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearProductErrors());
    }
    if (success) {
      toast.success("Product created successfully!");
      dispatch(clearProductErrors());
      navigate("/admin/products");
    }
  }, [error, success, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, description, price, stock, category, imagesInput } = formData;

    if (!name || !description || !price || !stock || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Split image URLs by comma and trim whitespaces
    const images = imagesInput
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url !== "");

    const productPayload = {
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      category,
      images: images.length > 0 ? images : ["https://i.pinimg.com/1200x/be/3c/58/be3c58f1bbd182e1e632f73bc4ba20db.jpg"],
    };

    dispatch(createProduct(productPayload));
  };

  return (
    <>
      {loading && <Loader />}
      <div className="max-w-2xl mx-auto">
        
        {/* Back Link */}
        <Link to="/admin/products" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white mb-6">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>

        {/* Form Container */}
        <div className="glass-card p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2 mb-6">
            <Plus size={22} className="text-cyan-600 dark:text-cyan-400" />
            <span>Create New Product</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 block">Product Name *</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Gravity Sneaker V1"
                value={formData.name}
                onChange={handleChange}
                className="w-full glass-input p-3 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 block">Description *</label>
              <textarea
                name="description"
                rows="4"
                placeholder="Product description and specifications..."
                value={formData.description}
                onChange={handleChange}
                className="w-full glass-input p-3 rounded-xl text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 block">Price (INR) *</label>
                <input
                  type="number"
                  name="price"
                  placeholder="e.g. 1999"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full glass-input p-3 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 block">Stock Inventory *</label>
                <input
                  type="number"
                  name="stock"
                  placeholder="e.g. 50"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full glass-input p-3 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 block">Product Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full glass-input p-3 rounded-xl text-sm focus:outline-none"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 block">Image URLs (Comma separated)</label>
              <input
                type="text"
                name="imagesInput"
                placeholder="e.g. https://domain.com/pic1.jpg, https://domain.com/pic2.jpg"
                value={formData.imagesInput}
                onChange={handleChange}
                className="w-full glass-input p-3 rounded-xl text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ocean-primary hover:bg-ocean-secondary text-white font-bold py-3.5 rounded-xl transition duration-250 shadow-lg shadow-cyan-500/10"
            >
              Add Product to Catalog
            </button>
          </form>
        </div>

      </div>
    </>
  );
};

export default AddProduct;
