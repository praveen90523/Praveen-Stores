import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const contactDetails = [
  {
    icon: Mail,
    label: "Gmail",
    value: "d.praveen2026@gmial.com",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-100 dark:border-cyan-900",
  },
  {
    icon: Phone,
    label: "Phone Support",
    value: "+91 9052339291",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "Visakhapatnam, Andhra Pradesh, 530022, India",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800",
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill out all required fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Thank you! We'll respond within 12 hours.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  return (
    <>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 dark:bg-cyan-955/20 border border-cyan-100 dark:border-cyan-900 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-5">
            <MessageCircle size={12} />
            Get In Touch
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3 font-heading">
            Contact Our <span className="text-gradient">Team</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Have questions about orders, payments, or products? We're here to help.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                We're here to help
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                Our dedicated support team responds to all inquiries within 12 business hours.
              </p>
            </div>

            <div className="space-y-5">
              {contactDetails.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl ${item.bg} border flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} className={item.color} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-0.5">{item.label}</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Response time badge */}
            <div className="mt-8 flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                Average response time: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Under 12 hours</span>
              </p>
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Send a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your Name"
                    className="w-full glass-input py-2.5 px-3 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your Email"
                    className="w-full glass-input py-2.5 px-3 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Order inquiry, Product question..."
                  className="w-full glass-input py-2.5 px-3 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows="5"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your question or concern in detail..."
                  className="w-full glass-input py-2.5 px-3 rounded-xl text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 disabled:from-slate-200 disabled:to-slate-355 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send size={16} />
                    Send Inquiry
                  </span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Contact;
