import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { registerUser } from "../redux/slices/authSlice";
import { syncCartWithDB, fetchDBCart } from "../redux/slices/cartSlice";
import { toast } from "react-toastify";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await dispatch(registerUser({ name: formData.name, email: formData.email, password: formData.password })).unwrap();
      
      // Sync local cart to DB on successful signup
      const localItems = JSON.parse(localStorage.getItem("cartItems")) || [];
      if (localItems.length > 0) {
        console.log("[Signup] Syncing local items with DB:", localItems);
        await dispatch(syncCartWithDB(localItems)).unwrap();
      } else {
        console.log("[Signup] Fetching DB cart (no local items).");
        await dispatch(fetchDBCart()).unwrap();
      }

      toast.success("Account created! Welcome!");
      navigate("/");
    } catch (err) {
      toast.error(err || "Registration failed.");
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create account</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join Praveen Store today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full glass-input py-3 px-4 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full glass-input py-3 px-4 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full glass-input py-3 px-4 pr-11 rounded-xl text-sm"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full glass-input py-3 px-4 pr-11 rounded-xl text-sm"
                  required
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 disabled:from-slate-200 disabled:to-slate-350 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline">Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;