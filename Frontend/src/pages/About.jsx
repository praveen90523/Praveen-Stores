import React from "react";
import { Shield, Zap, Globe, Star } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Star,
    title: "Curated Premium",
    desc: "Every single product is inspected for quality, craftsmanship, and aesthetic value.",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-100 dark:border-cyan-900",
  },
  {
    icon: Shield,
    title: "Secure Gateway",
    desc: "Top-tier encryption and partnerships like Razorpay ensure risk-free transactions.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800",
  },
  {
    icon: Globe,
    title: "Global Shipping",
    desc: "Fast tracking, duty-free deliveries, and premium packaging for all orders.",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800",
  },
];

const About = () => {
  return (
    <>
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Zap size={12} />
            Our Story
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 font-heading">
            About{" "}
            <span className="text-gradient">Praveen Store</span>
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            A premium curated destination where minimal luxury meets modern elegance.
            We are dedicated to providing high-value accessories and products that elevate
            your workspace and lifestyle with style and precision.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-800 p-7 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${feat.bg} border flex items-center justify-center mb-5`}>
                  <Icon size={22} className={feat.color} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 bg-white dark:bg-slate-800 rounded-2xl p-10 border border-slate-100 dark:border-slate-700 shadow-sm"
        >
          <h2 className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-10">
            Platform Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Products", value: "500+" },
              { label: "Happy Customers", value: "10k+" },
              { label: "Countries Served", value: "25+" },
              { label: "Support Hours", value: "24/7" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-gradient mb-1">{stat.value}</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default About;
