import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, Zap, CheckCircle } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_URL } from "../utils/constants";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      if (res.data.success) {
        setSent(true);
        toast.success("Password reset link sent!");
      } else {
        toast.error(res.data.message || "Failed to send reset email.");
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
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                We've sent a password reset link to <strong className="text-gray-700 dark:text-gray-300">{email}</strong>
              </p>
              <Link to="/login" className="text-sm text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center justify-center gap-1.5">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-11 h-11 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4">
                  <Mail size={20} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot password?</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your email and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full glass-input py-3 px-4 rounded-xl text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 disabled:from-slate-200 disabled:to-slate-355 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl transition shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center justify-center gap-1.5 transition">
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
