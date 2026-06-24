import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Zap, Lock } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_URL } from "../utils/constants";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
      if (res.data.success) {
        toast.success("Password reset successfully!");
        navigate("/login");
      } else {
        toast.error(res.data.message || "Reset failed.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
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
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl flex items-center justify-center shadow-sm">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Praveen Store</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
          <div className="mb-6">
            <div className="w-11 h-11 rounded-2xl bg-cyan-50 dark:bg-cyan-955/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4">
              <Lock size={20} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set new password</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create a strong new password for your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input py-3 px-4 rounded-xl text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 disabled:from-slate-200 disabled:to-slate-355 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Resetting...</> : "Reset Password"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
