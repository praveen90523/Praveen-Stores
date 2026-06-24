import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { loginUser, logout } from "../redux/slices/authSlice";
import { syncCartWithDB, fetchDBCart } from "../redux/slices/cartSlice";
import { toast } from "react-toastify";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle redirection based on updated Redux auth state (prevents race conditions)
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear any stale session first
    dispatch(logout());
    try {
      await dispatch(loginUser(formData)).unwrap();
      
      // Sync local cart to DB on successful login
      const localItems = JSON.parse(localStorage.getItem("cartItems")) || [];
      if (localItems.length > 0) {
        console.log("[Login] Syncing local items with DB:", localItems);
        await dispatch(syncCartWithDB(localItems)).unwrap();
      } else {
        console.log("[Login] Fetching DB cart (no local items).");
        await dispatch(fetchDBCart()).unwrap();
      }

      toast.success("Welcome back!");
    } catch (err) {
      toast.error(err || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FCFD] dark:bg-[#0F172A] flex items-center justify-center py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl flex items-center justify-center shadow-sm">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Praveen Store</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Sign In</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your customer account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="customer@example.com"
                className="w-full glass-input py-3 px-4 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full glass-input py-3 px-4 pr-11 rounded-xl text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 disabled:from-slate-200 disabled:to-slate-350 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-155 dark:border-gray-700 text-center space-y-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline">Create one</Link>
            </div>
            <div>
              <Link to="/admin/login" className="text-xs text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 hover:underline font-medium">
                Are you an Administrator? Access Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;