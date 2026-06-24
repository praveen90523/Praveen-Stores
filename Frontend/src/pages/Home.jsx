import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { ThemeContext } from "../context/ThemeContext";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_URL } from "../utils/constants";
import { motion } from "framer-motion";
import {
  ArrowRight, Sparkles, Shield, Zap, Award, Star, Search, Clock, Heart, Package, ChevronRight,
} from "lucide-react";
import logo from "../assets/logo.png";


const Home = () => {
  const navigate = useNavigate();
  const { recentlyViewed, setAiAssistantOpen } = useContext(ThemeContext);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/products?limit=100`),
          axios.get(`${API_URL}/categories`),
        ]);
        if (productsRes.data.success) setProducts(productsRes.data.products);
        if (categoriesRes.data.success) setCategories(categoriesRes.data.categories.slice(0, 4));
      } catch (err) {
        console.error("Failed to load homepage data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = products
        .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, products]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/products");
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${API_URL}/subscribers`,
        { email }
      );

      alert(res.data.message);
      setEmail("");
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Subscription failed"
      );
    }
  };

  const features = [
    { title: "Free Express Delivery", desc: "Complimentary express delivery on all orders over ₹999.", icon: Zap },
    { title: "Secure Payments", desc: "256-bit SSL encryption on every transaction. Shop safely.", icon: Shield },
    { title: "Premium Quality", desc: "Every product verified for quality and craftsmanship.", icon: Award },
  ];

  const featuredItems = products.slice(0, 4);
  const bestSellers = products.filter((p) => p.rating >= 4.5).slice(0, 4);
  const newArrivals = [...products].reverse().slice(0, 4);
  const trendingItems = products.slice(2, 6);

  const SectionHeader = ({ title, link }) => (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#082F49] dark:text-white font-heading tracking-tight">
          {title}
        </h2>

        <div className="relative mt-3">
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-cyan-600 rounded-full" />
          <div className="absolute inset-0 w-16 h-1 bg-cyan-400/50 blur-sm rounded-full" />
        </div>
      </div>

      <Link
        to={link || "/products"}
        className="
      group
      text-sm
      font-semibold
      text-cyan-700
      dark:text-cyan-300
      hover:text-sky-600
      dark:hover:text-cyan-200
      flex
      items-center
      gap-1
      transition-all
      duration-300
    "
      >
        View All

        <ChevronRight
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </Link>
    </div>
  );

  return (
    <>
      <div className="bg-gradient-to-br from-cyan-50/60 via-sky-50/40 to-cyan-100/50 dark:from-[#0F172A] dark:via-[#082F49] dark:to-[#0F172A] transition-all duration-500">
        {/* ===== HERO SECTION ===== */}
        <section className="relative overflow-hidden min-h-[92vh] bg-gradient-to-b from-cyan-50/80 via-sky-100/50 to-cyan-200/40 dark:from-[#0F172A] dark:via-[#082F49] dark:to-[#0c1e35] pt-10 pb-32 md:pb-40">
          {/* ── Ambient Light Orbs ── */}
          <div
            className="ambient-orb w-[600px] h-[600px] bg-cyan-400/[0.08] blur-[180px] -top-40 left-[-100px]"
            style={{ "--orb-duration": "25s", "--orb-delay": "0s" }}
          />

          <div
            className="ambient-orb w-[500px] h-[500px] bg-sky-500/[0.06] blur-[160px] top-20 right-[-120px]"
            style={{ "--orb-duration": "28s", "--orb-delay": "4s" }}
          />

          <div
            className="ambient-orb w-[450px] h-[450px] bg-cyan-300/[0.05] blur-[140px] bottom-20 left-1/3"
            style={{ "--orb-duration": "20s", "--orb-delay": "2s" }}
          />

          <div
            className="ambient-orb w-[350px] h-[350px] bg-cyan-600/[0.05] blur-[150px] bottom-10 right-1/4"
            style={{ "--orb-duration": "30s", "--orb-delay": "5s" }}
          />

          {/* ── Subtle Dot Texture ── */}
          <div
            className="absolute inset-0 opacity-[0.015] dark:opacity-[0.008]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #06b6d4 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* ── Premium Ocean Particles ── */}

          <div
            className="ocean-particle w-2 h-2 bg-cyan-400/40 blur-[1px] top-[12%] left-[8%]"
            style={{ "--duration": "12s", "--delay": "0s" }}
          />

          <div
            className="ocean-particle w-3 h-3 bg-sky-300/30 blur-[2px] top-[22%] left-[88%]"
            style={{ "--duration": "16s", "--delay": "3s" }}
          />

          <div
            className="ocean-particle w-4 h-4 bg-cyan-300/20 blur-[3px] top-[65%] left-[15%]"
            style={{ "--duration": "18s", "--delay": "2s" }}
          />

          <div
            className="ocean-particle w-2 h-2 bg-cyan-300/40 blur-[1px] top-[38%] left-[78%]"
            style={{ "--duration": "14s", "--delay": "5s" }}
          />

          <div
            className="ocean-particle w-1.5 h-1.5 bg-sky-400/35 blur-[1px] top-[72%] left-[58%]"
            style={{ "--duration": "17s", "--delay": "4s" }}
          />

          <div
            className="ocean-particle w-5 h-5 bg-cyan-400/15 blur-[5px] top-[48%] left-[42%]"
            style={{ "--duration": "22s", "--delay": "1s" }}
          />

          <div
            className="ocean-particle w-2 h-2 bg-cyan-200/30 blur-[2px] top-[18%] left-[50%]"
            style={{ "--duration": "15s", "--delay": "6s" }}
          />

          <div
            className="ocean-particle w-3 h-3 bg-cyan-200/20 blur-[3px] top-[82%] left-[80%]"
            style={{ "--duration": "20s", "--delay": "3s" }}
          />

          <div
            className="ocean-particle w-1 h-1 bg-cyan-300/50 blur-[1px] top-[58%] left-[92%]"
            style={{ "--duration": "13s", "--delay": "7s" }}
          />

          <div
            className="ocean-particle w-4 h-4 bg-sky-300/15 blur-[6px] top-[30%] left-[30%]"
            style={{ "--duration": "24s", "--delay": "2s" }}
          />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[250px] h-full bg-gradient-to-b from-cyan-300/10 via-transparent to-transparent blur-3xl rotate-12" />

            <div className="absolute top-0 right-1/4 w-[300px] h-full bg-gradient-to-b from-cyan-300/10 via-transparent to-transparent blur-3xl -rotate-12" />
          </div>
          {/* ── Main Content (3D perspective space) ── */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 hero-3d-space">
            <div className="text-center max-w-4xl mx-auto">

              {/* ── Center ambient glow ── */}
              <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-cyan-400/[0.06] to-transparent rounded-full blur-[100px] pointer-events-none" />

              {/* ── Logo — 3D Floating Circle ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="flex justify-center mb-10"
              >
                <div className="logo-3d-container">
                  {/* Pulsing glow behind everything */}
                  <div className="absolute inset-[-20px] logo-glow" />

                  {/* Rotating orbit ring */}
                  <div className="logo-orbit-ring">
                    <div className="logo-orbit-dot" />
                  </div>

                  {/* Gradient border ring */}
                  <div className="logo-circle" />

                  {/* Inner background circle */}
                  <div className="logo-circle-bg" />

                  {/* Logo image — clipped to circle */}
                  <img
                    src={logo}
                    alt="Praveen Stores"
                    className="relative z-10 w-[72%] h-[72%] object-contain rounded-full"
                  />
                </div>
              </motion.div>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="inline-flex items-center gap-2 trust-badge text-[#0284C7] dark:text-cyan-300 px-5 py-2 rounded-full text-xs font-semibold mb-8 tracking-wide"
              >
                <Sparkles size={12} className="animate-pulse" />
                Premium Shopping Experience
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-[#082F49] dark:text-white"
              >
                Everything You Need,
                <br />
                <span className="text-ocean-shimmer">
                  All in One Store.
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-lg text-[#0284C7]/80 dark:text-cyan-300/70 max-w-xl mx-auto leading-relaxed mb-10"
              >
                Shop quality products at affordable prices. Fast delivery, secure payments, and trusted service.
              </motion.p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="max-w-md mx-auto relative mb-10"
              >
                <form onSubmit={handleSearchSubmit} className="relative">
                  <div className="hero-search-glass rounded-2xl">
                    <input
                      type="text"
                      placeholder="Search premium products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="w-full bg-transparent text-gray-900 dark:text-gray-100 py-4 pl-5 pr-12 rounded-2xl text-sm outline-none placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <button type="submit" className="absolute right-4 top-4 text-[#0EA5E9]/60 hover:text-[#06B6D4] transition">
                      <Search size={18} />
                    </button>
                  </div>
                </form>

                {/* Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 w-full mt-2 bg-white dark:bg-[#082F49] border border-cyan-100 dark:border-cyan-900/50 rounded-2xl shadow-xl shadow-cyan-500/10 py-2 z-50 overflow-hidden">
                    <span className="text-[10px] text-[#0284C7] dark:text-cyan-400 font-semibold uppercase tracking-wider px-4 py-1.5 block">Suggestions</span>
                    {suggestions.map((prod) => (
                      <Link key={prod._id} to={`/products/${prod._id}`}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition">
                        <img src={prod.images?.[0] || ""} alt={prod.name} className="w-9 h-9 object-cover rounded-lg border border-cyan-100 dark:border-cyan-800" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#082F49] dark:text-cyan-100 truncate">{prod.name}</p>
                          <p className="text-xs text-[#0284C7]/70 dark:text-cyan-400/70">₹{prod.price.toLocaleString("en-IN")}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-wrap justify-center gap-4"
              >
                <Link
                  to="/products"
                  className="hero-cta-primary text-white font-semibold px-8 py-3.5 rounded-2xl flex items-center gap-2 text-sm"
                >
                  Shop Now <ArrowRight size={16} />
                </Link>
                <button
                  onClick={() => navigate("/products")}
                  className="hero-cta-glass text-gray-800 dark:text-gray-200 font-semibold px-8 py-3.5 rounded-2xl text-sm"
                >
                  Explore Categories
                </button>
              </motion.div>

            </div>
          </div>

          {/* ── Ocean Mist Layer ── */}
          <div className="ocean-mist bottom-[160px] md:bottom-[200px] z-[1]" />

          {/* ── Animated Wave Layers ── */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-[2]">
            {/* Wave Layer 1 — lightest, back */}
            <svg
              viewBox="0 0 1440 320"
              className="w-full h-[100px] md:h-[160px] wave-layer-1"
              preserveAspectRatio="none"
            >
              <path
                fill="#a5f3fc"
                fillOpacity="0.25"
                d="M0,192L60,186.7C120,181,240,171,360,181.3C480,192,600,224,720,229.3C840,235,960,213,1080,208C1200,203,1320,213,1380,218.7L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
              />
            </svg>
            {/* Wave Layer 2 — medium */}
            <svg
              viewBox="0 0 1440 320"
              className="absolute bottom-0 left-0 w-full h-[90px] md:h-[140px] wave-layer-2"
              preserveAspectRatio="none"
            >
              <path
                fill="#67e8f9"
                fillOpacity="0.18"
                d="M0,256L80,245.3C160,235,320,213,480,202.7C640,192,800,192,960,208C1120,224,1280,256,1360,272L1440,288L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
              />
            </svg>
            {/* Wave Layer 3 — deepest, front */}
            <svg
              viewBox="0 0 1440 320"
              className="absolute bottom-0 left-0 w-full h-[70px] md:h-[120px] wave-layer-3"
              preserveAspectRatio="none"
            >
              <path
                fill="#22d3ee"
                fillOpacity="0.14"
                d="M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,245.3C672,256,768,256,864,234.7C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              />
            </svg>
            {/* Wave Layer 4 — bottom solid blend */}
            <svg
              viewBox="0 0 1440 320"
              className="absolute bottom-0 left-0 w-full h-[50px] md:h-[80px]"
              preserveAspectRatio="none"
            >
              <path
                fill="#0EA5E9"
                fillOpacity="0.10"
                d="M0,288L60,282.7C120,277,240,267,360,261.3C480,256,600,256,720,266.7C840,277,960,299,1080,293.3C1200,288,1320,256,1380,240L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
              />
            </svg>
          </div>
        </section>

        {/* ===== FEATURE HIGHLIGHTS ===== */}
        <section className="bg-gradient-to-r from-cyan-50/80 via-sky-50/60 to-cyan-50/80 dark:bg-gradient-to-r dark:from-[#082F49]/80 dark:via-[#0F172A] dark:to-[#082F49]/80 py-14 border-y border-cyan-100/60 dark:border-cyan-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div key={idx} className="card-3d-tilt bg-white/90 dark:bg-[#082F49]/60 rounded-2xl p-6 border border-cyan-100 dark:border-cyan-900/40 shadow-sm shadow-cyan-100 dark:shadow-cyan-900/20 flex items-start gap-4 hover:shadow-md hover:shadow-cyan-200/50 dark:hover:shadow-cyan-900/40 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-sky-500/20 dark:from-cyan-500/20 dark:to-sky-600/20 border border-cyan-200 dark:border-cyan-800/50 flex items-center justify-center text-[#06B6D4] dark:text-cyan-400 flex-shrink-0">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#082F49] dark:text-cyan-50 mb-1">{feat.title}</h3>
                      <p className="text-xs text-[#0284C7]/70 dark:text-cyan-300/60 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== PERSONALIZED: RECENTLY VIEWED & WISHLIST ===== */}
        {(recentlyViewed.length > 0 || wishlistItems.length > 0) && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="bg-white/90 dark:bg-[#082F49]/50 rounded-3xl border border-cyan-100 dark:border-cyan-900/40 p-8 shadow-sm shadow-cyan-100/50 dark:shadow-cyan-900/20">
              <h2 className="text-lg font-bold text-[#082F49] dark:text-cyan-50 mb-6 flex items-center gap-2">
                <Sparkles size={18} className="text-[#06B6D4]" /> Your Dashboard
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {recentlyViewed.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-[#0284C7]/70 dark:text-cyan-400/80 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Clock size={12} /> Recently Viewed
                    </h3>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto">
                      {recentlyViewed.slice(0, 3).map((prod) => (
                        <Link key={prod._id} to={`/products/${prod._id}`}
                          className="flex items-center gap-3 p-2.5 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-xl transition border border-transparent hover:border-cyan-100 dark:hover:border-cyan-800">
                          <img src={prod.images?.[0] || ""} alt={prod.name} className="w-10 h-10 object-cover rounded-lg border border-cyan-100 dark:border-cyan-800" />
                          <div className="min-w-0 flex-grow">
                            <p className="text-sm font-semibold text-[#082F49] dark:text-cyan-100 truncate">{prod.name}</p>
                            <p className="text-xs text-[#0284C7]/70 dark:text-cyan-400/70">₹{prod.price.toLocaleString("en-IN")}</p>
                          </div>
                          <ChevronRight size={14} className="text-[#06B6D4]/50 dark:text-cyan-600 flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {wishlistItems.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-[#0284C7]/70 dark:text-cyan-400/80 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Heart size={12} className="text-red-400" /> Saved Items
                    </h3>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto">
                      {wishlistItems.slice(0, 3).map((prod) => (
                        <Link key={prod._id} to={`/products/${prod._id}`}
                          className="flex items-center gap-3 p-2.5 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-xl transition border border-transparent hover:border-cyan-100 dark:hover:border-cyan-800">
                          <img src={prod.images?.[0] || ""} alt={prod.name} className="w-10 h-10 object-cover rounded-lg border border-cyan-100 dark:border-cyan-800" />
                          <div className="min-w-0 flex-grow">
                            <p className="text-sm font-semibold text-[#082F49] dark:text-cyan-100 truncate">{prod.name}</p>
                            <p className="text-xs text-[#0284C7]/70 dark:text-cyan-400/70">₹{prod.price.toLocaleString("en-IN")}</p>
                          </div>
                          <ChevronRight size={14} className="text-[#06B6D4]/50 dark:text-cyan-600 flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ===== CATEGORIES ===== */}
        {categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <SectionHeader title="Popular Categories" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {categories.map((cat) => (
                <Link key={cat._id} to={`/products?category=${cat._id}`}
                  className="bg-white/90 dark:bg-[#082F49]/50 rounded-2xl border border-cyan-100 dark:border-cyan-900/40 p-6 flex flex-col items-center justify-center text-center hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-md hover:shadow-cyan-200/40 dark:hover:shadow-cyan-900/40 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-sky-500/20 dark:from-cyan-500/20 dark:to-[#0284C7]/20 border border-cyan-200 dark:border-cyan-800/50 flex items-center justify-center text-[#06B6D4] dark:text-cyan-400 group-hover:scale-110 transition-transform duration-300 mb-3">
                    <Package size={20} />
                  </div>
                  <h3 className="text-sm font-semibold text-[#082F49] dark:text-cyan-100 group-hover:text-[#06B6D4] dark:group-hover:text-cyan-300 transition uppercase tracking-wide">{cat.name}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ===== PRODUCT SECTIONS ===== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 pb-20">

          {featuredItems.length > 0 && (
            <div>
              <SectionHeader title="Featured Products" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredItems.map((prod) => <ProductCard key={prod._id} product={prod} />)}
              </div>
            </div>
          )}

          {bestSellers.length > 0 && (
            <div>
              <SectionHeader title="Best Sellers" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {bestSellers.map((prod) => <ProductCard key={prod._id} product={prod} />)}
              </div>
            </div>
          )}

          {newArrivals.length > 0 && (
            <div>
              <SectionHeader title="New Arrivals" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {newArrivals.map((prod) => <ProductCard key={prod._id} product={prod} />)}
              </div>
            </div>
          )}

          {trendingItems.length > 0 && (
            <div>
              <SectionHeader title="Trending Now" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingItems.map((prod) => <ProductCard key={prod._id} product={prod} />)}
              </div>
            </div>
          )}
        </div>

        {/* ===== CUSTOMER REVIEWS ===== */}
        <section className="bg-gradient-to-br from-cyan-50/70 via-sky-50/50 to-cyan-50/70 dark:from-[#082F49]/60 dark:via-[#0F172A] dark:to-[#082F49]/60 py-16 border-y border-cyan-100/60 dark:border-cyan-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-[#082F49] dark:text-white font-heading">What Customers Say</h2>
              <p className="text-[#0284C7]/70 dark:text-cyan-300/60 text-sm mt-2">Trusted by thousands of happy shoppers</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {[
                { text: "\"Praveen Store has completely redefined premium shopping for me. The products are exceptional and delivery was lightning fast.\"", name: "Alex Rivera", role: "Digital Designer" },
                { text: "\"Clean design, intuitive experience, and genuinely premium products. I've become a loyal customer within my first visit.\"", name: "Sarah Chen", role: "Software Architect" },
              ].map((review, i) => (
                <div key={i} className="bg-white/90 dark:bg-[#082F49]/60 rounded-2xl p-6 border border-cyan-100 dark:border-cyan-900/40 shadow-sm shadow-cyan-100/50 dark:shadow-cyan-900/20 hover:shadow-md hover:shadow-cyan-200/40 dark:hover:shadow-cyan-900/30 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all duration-300">
                  <div className="flex text-amber-400 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#f59e0b" className="stroke-0" />)}
                  </div>
                  <p className="text-sm text-[#082F49]/70 dark:text-cyan-200/80 leading-relaxed italic mb-5">{review.text}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400/20 to-sky-500/20 dark:from-cyan-500/20 dark:to-[#0284C7]/20 border border-cyan-200 dark:border-cyan-800/50 flex items-center justify-center text-xs font-bold text-[#06B6D4] dark:text-cyan-400">
                      {review.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#082F49] dark:text-cyan-100">{review.name}</h4>
                      <p className="text-xs text-[#0284C7]/60 dark:text-cyan-400/60">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== NEWSLETTER CTA ===== */}
        <section className="py-16 bg-white/80 dark:bg-[#0F172A]">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#06B6D4] to-[#0284C7] shadow-lg shadow-cyan-500/30 flex items-center justify-center mx-auto mb-5">
              <Sparkles size={22} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#082F49] dark:text-white font-heading mb-3">Stay in the Loop</h2>
            <p className="text-[#0284C7]/70 dark:text-cyan-300/60 text-sm mb-8">Get early access to new collections, exclusive deals, and curated picks — delivered to your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex gap-3 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 glass-input py-3 px-4 rounded-xl text-sm border border-cyan-200 dark:border-cyan-800 focus:border-[#06B6D4] dark:focus:border-cyan-500 outline-none"
              />
              <button type="submit" className="bg-gradient-to-r from-[#06B6D4] to-[#0284C7] hover:from-[#0EA5E9] hover:to-[#06B6D4] text-white font-semibold px-5 py-3 rounded-xl text-sm transition shadow-md shadow-cyan-500/30 hover:shadow-cyan-500/50">
                Subscribe
              </button>
            </form>
          </div>
        </section>

        {/* ===== BRAND PARTNERS ===== */}
        <section className="bg-gradient-to-r from-cyan-50/60 via-sky-50/40 to-cyan-50/60 dark:from-[#082F49]/50 dark:via-[#0F172A] dark:to-[#082F49]/50 py-10 border-t border-cyan-100 dark:border-cyan-900/30">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-[10px] font-semibold text-[#0284C7]/50 dark:text-cyan-500/50 tracking-widest uppercase mb-6">Trusted by Global Creators</p>
            <div className="flex flex-wrap justify-center items-center gap-10 opacity-30 dark:opacity-20 select-none">
              {["Alex Morgan", "Sarah Chen", "David Park", "Michael Lee", "Emily Wang", "Jessica Garcia"].map((brand) => (
                <span key={brand} className="text-base font-black tracking-tight text-[#0284C7] dark:text-cyan-300">{brand}</span>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default Home;