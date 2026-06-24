import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { loginUser, logout } from "../redux/slices/authSlice";
import { toast } from "react-toastify";

const AdminLogin = () => {
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
        toast.error("Access Denied: Customer accounts cannot access the admin console.");
        dispatch(logout());
      }
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear any stale session first
    dispatch(logout());
    try {
      const response = await dispatch(loginUser({ ...formData, isAdminPortal: true })).unwrap();
      if (response?.user?.role !== "admin") {
        toast.error("Access Denied: Non-administrative accounts are not authorized.");
        dispatch(logout());
      } else {
        toast.success("Authorized: Welcome to Admin Console");
      }
    } catch (err) {
      toast.error(err || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FCFD] dark:bg-[#0F172A] flex items-center justify-center py-16 px-4 transition-colors duration-300">
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
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              Praveen Store
            </span>
          </Link>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 uppercase tracking-widest font-semibold">
            Admin Console
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
          {/* Admin badge */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Administrator Sign In
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Restricted to authorized admin accounts only
              </p>
            </div>
            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-500/20">
              <ShieldCheck size={11} />
              Secure
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@praveen.store"
                className="w-full glass-input py-3 px-4 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
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
              className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 disabled:from-slate-200 disabled:to-slate-355 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Authenticating...
                </>
              ) : (
                "Sign In to Console"
              )}
            </button>
          </form>

          {/* Notice */}
          <div className="mt-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
            <p className="text-[11px] text-amber-700 dark:text-amber-400 text-center leading-relaxed">
              🔒 This portal is restricted to system administrators. Unauthorized access attempts are logged.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
            <Link
              to="/login"
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline font-medium transition"
            >
              Not an administrator? Switch to Customer Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
