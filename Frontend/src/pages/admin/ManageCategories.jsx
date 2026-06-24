import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_URL } from "../../utils/constants";
import { FolderTree, Plus, Trash2, Edit3, X } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const ManageCategories = () => {
  const { token } = useSelector((state) => state.auth);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/categories`);
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/categories`,
        { name: categoryName.trim() },
        getHeaders()
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setCategoryName("");
        fetchCategories();
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || "Creation failed");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put(
        `${API_URL}/categories/${editId}`,
        { name: editName.trim() },
        getHeaders()
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setEditId(null);
        setEditName("");
        fetchCategories();
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      setLoading(true);
      const res = await axios.delete(
        `${API_URL}/categories/${id}`,
        getHeaders()
      );
      if (res.data.success) {
        toast.success(res.data.message);
        fetchCategories();
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="space-y-6">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-gray-900 dark:text-white uppercase">
            Manage Categories
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Product organizational categories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Create / Edit Form card */}
          <div className="glass-card p-6 rounded-2xl h-fit space-y-4">
            {editId ? (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Edit Category</h3>
                  <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <input
                    type="text"
                    placeholder="New category name..."
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full glass-input p-3 rounded-xl text-sm"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-ocean-primary hover:bg-ocean-secondary text-white font-bold py-2.5 rounded-xl transition"
                  >
                    Save Updates
                  </button>
                </form>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Create Category</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Category name..."
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full glass-input p-3 rounded-xl text-sm"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-ocean-primary hover:bg-ocean-secondary text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Plus size={16} /> Create Category
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Categories Grid Table */}
          <div className="md:col-span-2 glass-card p-6 rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4">Slug (URL link)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-gray-800/50 text-xs text-gray-700 dark:text-gray-300">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center justify-center gap-1">
                        <FolderTree size={28} />
                        <span>No categories found.</span>
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20">
                        <td className="py-3.5 px-4 font-semibold text-gray-800 dark:text-gray-200">{cat.name}</td>
                        <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 font-mono">{cat.slug}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setEditId(cat._id);
                                setEditName(cat.name);
                              }}
                              className="p-2 text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(cat._id)}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-pink-500 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </>
  );
};

export default ManageCategories;
