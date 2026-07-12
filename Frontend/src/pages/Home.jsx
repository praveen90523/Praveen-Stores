import React, { useEffect, useState, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { ThemeContext } from "../context/ThemeContext";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_URL } from "../utils/constants";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Sparkles, Shield, Zap, Award, Star, Search, Clock, Heart, Package,
  ChevronRight, ChevronLeft, ShoppingBag, Gift, StarHalf, CheckCircle, ArrowUpRight,
  TrendingUp, Truck, CreditCard, RotateCcw, Headphones, Mail, AppWindow, Coffee
} from "lucide-react";
import logo from "../assets/logo.png";

// Premium category fallback images mappings
const categoryImages = {
  "groceries": "https://i.pinimg.com/1200x/0f/f4/63/0ff4634f8676ad579a89c4b31f4b220a.jpg",
  "beverages": "https://i.pinimg.com/1200x/83/27/0e/83270e3ef0526c259d396ae6fdd31224.jpg",
  "snacks": "https://i.pinimg.com/1200x/d0/ff/74/d0ff741fe074b3ad1a439d1e659c6516.jpg",
  "fruits": "https://i.pinimg.com/1200x/14/ca/87/14ca87a3e93efd788316edefb177baab.jpg",
  "vegetables": "https://i.pinimg.com/1200x/fa/94/e2/fa94e2ed4fdd80227f57db1e7ded1272.jpg",
  "dairy products": "https://i.pinimg.com/1200x/f7/ee/8e/f7ee8e44e91e9cb5ec57746c744a8b6c.jpg",
  "personal care": "https://i.pinimg.com/1200x/f6/15/50/f615508f7cad41c22bc66566b82cfb8d.jpg",
  "home essentials": "https://i.pinimg.com/1200x/7b/7f/e7/7b7fe70d48314737ded8b388a8bd718f.jpg",
  "cleaning products": "https://i.pinimg.com/1200x/4c/d8/4f/4cd84f0c71da71bd180ef95dd78d8c20.jpg",
  "kitchen items": "https://i.pinimg.com/1200x/49/4e/c2/494ec23861d90dfd26fac9a2ff94eb40.jpg",
  "electronics accessories": "https://i.pinimg.com/1200x/ea/7c/96/ea7c96bb6d43a787a9df56ad2204b928.jpg",
  "health & wellness": "https://i.pinimg.com/1200x/f1/1e/e3/f11ee304896854354d1660f39ac7c8c6.jpg",
  "fashion": "https://i.pinimg.com/1200x/1a/81/12/1a8112a55105cf0a636eea0f16bee1d4.jpg",
  "electronics": "https://i.pinimg.com/1200x/ef/8f/07/ef8f07df7ea00e1b30eace8f77297a40.jpg",
  "men fashion": "https://i.pinimg.com/1200x/16/89/45/168945d05672ae0db9a04d12c8fa8d8a.jpg",
  "women fashion": "https://i.pinimg.com/1200x/e6/05/8b/e6058bca156a5ddcf4af075840e0fbda.jpg",
  "shoes": "https://i.pinimg.com/1200x/40/23/f7/4023f7a6c1af6fee16437eb09ecf7b83.jpg",
  "watches": "https://i.pinimg.com/1200x/38/4d/18/384d1801f74887810b84b16a1c6fe610.jpg",
  "shirts": "https://i.pinimg.com/1200x/4b/bb/ce/4bbbce1ee54e1c39995cab25b48c191b.jpg",
  "t-shirts": "https://i.pinimg.com/1200x/23/23/42/2323426d6c478bb339349553aaaf2437.jpg",
  "jeans": "https://i.pinimg.com/1200x/1a/81/12/1a8112a55105cf0a636eea0f16bee1d4.jpg",
  "hoodies": "https://i.pinimg.com/1200x/f9/19/0e/f9190e5aa0a5063e6685feee500aec0d.jpg"
};

const getCategoryImage = (catName) => {
  return categoryImages[catName.toLowerCase()] || "https://i.pinimg.com/1200x/0f/f4/63/0ff4634f8676ad579a89c4b31f4b220a.jpg";
};

const Home = () => {
  const navigate = useNavigate();
  const { recentlyViewed } = useContext(ThemeContext);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const getDynamicImage = (categoryKeyword, fallbackUrl) => {
    if (!products || products.length === 0) return fallbackUrl;
    const match = products.find((p) => {
      const cat = p.category?.name?.toLowerCase() || "";
      return cat.includes(categoryKeyword.toLowerCase());
    });
    if (match && match.images && match.images[0]) {
      return match.images[0];
    }
    return fallbackUrl;
  };

  const getCategoryImage = (catName) => {
    if (!products || products.length === 0) {
      return categoryImages[catName.toLowerCase()] || "https://i.pinimg.com/1200x/0f/f4/63/0ff4634f8676ad579a89c4b31f4b220a.jpg";
    }
    const match = products.find(p => p.category?.name?.toLowerCase() === catName.toLowerCase());
    if (match && match.images && match.images[0]) {
      return match.images[0];
    }
    return categoryImages[catName.toLowerCase()] || "https://i.pinimg.com/1200x/0f/f4/63/0ff4634f8676ad579a89c4b31f4b220a.jpg";
  };
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  // Hero carousel state
  const [heroIndex, setHeroIndex] = useState(0);

  // Reviews/Testimonials carousel index state
  const [reviewIndex, setReviewIndex] = useState(0);

  // Flash deal countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/products?limit=100`),
          axios.get(`${API_URL}/categories`),
        ]);
        if (productsRes.data.success) setProducts(productsRes.data.products);
        if (categoriesRes.data.success) setCategories(categoriesRes.data.categories);
      } catch (err) {
        console.error("Failed to load homepage data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Timer effect for deals section
  useEffect(() => {
    const target = new Date();
    target.setHours(23, 59, 59, 999);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) {
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto sliding carousel effect for Hero Carousel
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setHeroIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [loading]);

  // Testimonials Auto-sliding carousel
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setReviewIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/subscribers`, { email });
      alert(res.data.message || "Subscribed successfully!");
      setEmail("");
    } catch (err) {
      alert(err.response?.data?.message || "Subscription failed");
    }
  };

  const getCategoryPath = (nameSubstring) => {
    if (!categories || !Array.isArray(categories)) return "/products";
    const matched = categories.find((c) =>
      c && c.name && c.name.toLowerCase().includes(nameSubstring.toLowerCase())
    );
    return matched ? `/products?category=${matched._id}` : "/products";
  };

  // Banner definitions
  const slides = useMemo(() => [
    {
      image: getDynamicImage("fashion", "https://i.pinimg.com/1200x/1a/81/12/1a8112a55105cf0a636eea0f16bee1d4.jpg"),
      badge: "Exclusive Launch",
      title: "The Fashion Showcase",
      desc: "Curated styles featuring premium fabrics and refined casual elegance. Flat 50% discount.",
      cta: "Shop Apparel",
      link: getCategoryPath("fashion")
    },
    {
      image: getDynamicImage("electronics", "https://i.pinimg.com/1200x/ef/8f/07/ef8f07df7ea00e1b30eace8f77297a40.jpg"),
      badge: "Tech Upgrade",
      title: "Electronics Showcase",
      desc: "Elevate your focus with active noise cancelling headphones and premium device chargers.",
      cta: "Explore Tech",
      link: getCategoryPath("electronics")
    },
    {
      image: getDynamicImage("home", "https://i.pinimg.com/736x/8c/d5/14/8cd5141a0e72d5b449921bddad0dda08.jpg"),
      badge: "Home Aesthetics",
      title: "Cozy Living Essentials",
      desc: "Soy wax aromatherapy candles, premium bath towels, and hand-painted ceramic vases.",
      cta: "Discover Decor",
      link: getCategoryPath("home")
    },
    {
      image: getDynamicImage("care", "https://i.pinimg.com/1200x/f6/15/50/f615508f7cad41c22bc66566b82cfb8d.jpg"),
      badge: "Glow Season",
      title: "Premium Beauty Rituals",
      desc: "Hydrating cold-pressed face drops and whipped organic body soufflés. Verified quality.",
      cta: "Explore Skincare",
      link: getCategoryPath("care")
    },
    {
      image: getDynamicImage("grocer", "https://i.pinimg.com/1200x/92/42/9f/92429fd666b26144ce3cc3e7ffe789af.jpg"),
      badge: "Daily Nutrition",
      title: "Healthy Organic Pantry",
      desc: "Organic white quinoa, cold-pressed extra virgin olive oils, and forest honey. In stock.",
      cta: "Browse Pantry",
      link: getCategoryPath("grocer")
    }
  ], [categories, products]);

  // Extract unique brand lists parsed dynamically from product models
  const uniqueBrands = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return [...new Set(products.map((p) => p && p.brand).filter(Boolean))].slice(0, 6);
  }, [products]);

  // Filters for distinct categories/sections
  const dealsProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return products.filter((p) => p && p.originalPrice > p.price).slice(0, 6);
  }, [products]);

  const bestSellers = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return products.filter((p) => p && p.rating >= 4.7).slice(0, 4);
  }, [products]);

  const newArrivals = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return [...products].reverse().slice(0, 4);
  }, [products]);

  const groceryProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return products.filter((p) => p && p.category?.name?.toLowerCase().includes("grocer")).slice(0, 4);
  }, [products]);

  const electronicsProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return products.filter((p) => p && p.category?.name?.toLowerCase().includes("electronics")).slice(0, 4);
  }, [products]);

  // Why Shop With Us features catalog list
  const shoppingFeatures = [
    { title: "Free Shipping", desc: "Enjoy completely free courier shipping for all order purchases above ₹999.", icon: Truck },
    { title: "Secure Payments", desc: "256-bit secure gateway layer protocols for safe card and UPI payments.", icon: CreditCard },
    { title: "Easy Returns", desc: "Hassle-free direct return policies within 7 days from successful delivery.", icon: RotateCcw },
    { title: "24/7 Support", desc: "Around-the-clock professional chat help for all orders and query issues.", icon: Headphones },
    { title: "Original Products", desc: "100% verified source standard from manufacturers and official sellers.", icon: Award },
    { title: "Fast Delivery", desc: "Express logistics tracking to deliver packages within 2-4 working days.", icon: Zap }
  ];

  // Testimonials catalog listings
  const testimonials = [
    { name: "Rahul Sharma", role: "Elite Buyer", initial: "RS", text: "Praveen Stores offers a premium, minimalist standard layout. The product catalog has authentic goods, and order items ship extremely fast.", bg: "from-sky-400 to-cyan-500" },
    { name: "Pooja Patel", role: "Verified Shopper", initial: "PP", text: "Extremely clean site view. I bought several organic food items and aromatherapy candles, and the quality is outstanding.", bg: "from-cyan-500 to-emerald-500" },
    { name: "Arjun Verma", role: "Frequent Customer", initial: "AV", text: "The tech selection has amazing fast charging items and audio accessories. Excellent interface and responsive support options.", bg: "from-indigo-500 to-sky-500" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center pt-20">
        {/* Elegant skeleton loading view */}
        <div className="w-16 h-16 border-4 border-slate-100 border-t-sky-500 rounded-full animate-spin mb-4" />
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">
          Loading Storefront...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 transition-colors duration-500 text-slate-800 dark:text-slate-100 overflow-x-hidden">

      {/* 1. HERO SLIDESHOW SECTION */}
      <section className="relative h-[550px] md:h-[620px] bg-slate-950 overflow-hidden w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIndex}
            initial={{ opacity: 0, scale: 1.01 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Dark tint background overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent z-10" />
            <img
              src={slides[heroIndex].image}
              alt={slides[heroIndex].title}
              className="absolute inset-0 w-full h-full object-cover opacity-75"
            />

            <div className="max-w-7xl mx-auto px-6 sm:px-8 h-full relative z-20 flex items-center">
              <div className="max-w-xl text-white">
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-sky-500 text-white text-[9px] font-extrabold px-3 py-1.5 rounded-lg shadow-sm tracking-widest uppercase inline-block mb-4"
                >
                  {slides[heroIndex].badge}
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-6xl font-black tracking-tight leading-none font-heading"
                >
                  {slides[heroIndex].title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xs md:text-sm mt-4 text-slate-300 leading-relaxed font-medium"
                >
                  {slides[heroIndex].desc}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8"
                >
                  <Link
                    to={slides[heroIndex].link}
                    className="bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-8 py-3.5 rounded-xl text-xs transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center gap-1.5"
                  >
                    {slides[heroIndex].cta} <ArrowUpRight size={13} />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel slide controls */}
        <button
          onClick={() => setHeroIndex((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition border border-white/5"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => setHeroIndex((prev) => (prev + 1) % slides.length)}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition border border-white/5"
        >
          <ChevronRight size={16} />
        </button>

        {/* Carousel slide indicator dots */}
        <div className="absolute bottom-6 left-1/2 -translate-y-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${heroIndex === i ? "w-6 bg-sky-400" : "w-2 bg-white/40 hover:bg-white/60"
                }`}
            />
          ))}
        </div>
      </section>

      {/* 2. CATEGORIES SHOWCASE GRID (Shop by Category) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col mb-10 text-center sm:text-left">
          <span className="text-[10px] text-sky-500 font-extrabold uppercase tracking-widest">
            Premium Offerings
          </span>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Shop By Category
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat._id}`}
              className="group flex flex-col bg-slate-50/60 dark:bg-slate-800/40 border border-slate-150/40 dark:border-slate-800 rounded-3xl p-4 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-350"
            >
              <div className="w-full h-32 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
                <img
                  src={getCategoryImage(cat.name)}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
                />
              </div>
              <h4 className="font-heading font-black text-xs text-slate-900 dark:text-white text-center mt-3 uppercase tracking-wider leading-none">
                {cat.name}
              </h4>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. TODAY'S DEALS SECTION (with Countdown Timer) */}
      {dealsProducts.length > 0 && (
        <section className="py-16 bg-slate-50/60 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header with timer */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
              <div>
                <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <Zap size={11} className="fill-red-500 text-red-500" /> Limited Time
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  Today's Deals
                </h2>
              </div>

              {/* Countdown panel */}
              <div className="flex items-center gap-2 bg-white dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 p-2.5 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5">
                  Ends In:
                </span>
                <div className="flex gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                  <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg text-red-500 min-w-[32px] text-center">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span>:</span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg min-w-[32px] text-center">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span>:</span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg min-w-[32px] text-center">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>

            {/* Products grid list */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {dealsProducts.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. PROMOTIONAL BANNER 1 (Fashion Sale - Interstitial banner) */}
      <section className="py-20 relative overflow-hidden bg-slate-950 w-full text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
        <img
          src={getDynamicImage("fashion", "https://i.pinimg.com/1200x/1a/81/12/1a8112a55105cf0a636eea0f16bee1d4.jpg")}
          alt="Fashion Sale"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-20 flex flex-col justify-center h-full">
          <div className="max-w-md">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">
              Style Showcase
            </span>
            <h3 className="text-3xl md:text-5xl font-black mt-2 leading-none font-heading">
              The Grand Fashion Carnival
            </h3>
            <p className="text-xs mt-4 text-slate-350 leading-relaxed font-medium">
              Explore exquisite cotton apparel, designer casual jackets, and modern footwear from top selected brands. Use code <span className="text-white font-bold">PRAVEEN50</span> for instant savings.
            </p>
            <div className="mt-8">
              <Link
                to={getCategoryPath("fashion")}
                className="bg-white hover:bg-slate-100 text-slate-950 font-bold px-7 py-3 rounded-xl text-xs transition shadow-lg inline-flex items-center gap-1.5"
              >
                Explore Sale <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VISUALLY DISTINCT PRODUCT SECTIONS */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

        {/* 🔥 SECTION A: BEST SELLERS (Grid with Gold Badging) */}
        {bestSellers.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <Award size={11} className="text-amber-500" /> Curated Collection
                </span>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  🔥 Best Sellers
                </h3>
              </div>
              <Link to="/products?sort=rating" className="text-xs font-bold text-sky-500 hover:underline flex items-center gap-0.5">
                View All <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((prod) => (
                <div key={prod._id} className="relative">
                  {/* Gold ribbon overlay badge */}
                  <span className="absolute top-3.5 right-12 z-10 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[8px] font-black px-2 py-0.5 rounded shadow-sm flex items-center gap-0.5 uppercase tracking-wider">
                    <Star size={8} fill="#0f172a" className="stroke-0" /> top rated
                  </span>
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. BRAND SHOWCASE PARTNERS */}
        {uniqueBrands.length > 0 && (
          <div className="py-8 bg-slate-50/20 dark:bg-slate-900/10 rounded-3xl">
            <div className="flex flex-col mb-8">
              <span className="text-[10px] text-sky-500 font-extrabold uppercase tracking-widest">
                Our Creators
              </span>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                Featured Brands
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {uniqueBrands.map((brand) => (
                <Link
                  key={brand}
                  to={`/products?keyword=${encodeURIComponent(brand)}`}
                  className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-6 rounded-2xl hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-sky-500/10 flex items-center justify-center mb-3">
                    <ShoppingBag size={16} className="text-white dark:text-sky-500" />
                  </div>
                  <h4 className="font-heading font-black text-xs tracking-wider text-slate-900 dark:text-white uppercase leading-none">
                    {brand}
                  </h4>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-2">
                    Official Store
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* PROMOTIONAL BANNER 2 (Electronics & Tech) */}
        <section className="py-20 relative overflow-hidden bg-slate-950 w-full text-white rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent z-10" />
          <img
            src={getDynamicImage("electronics", "https://i.pinimg.com/1200x/ef/8f/07/ef8f07df7ea00e1b30eace8f77297a40.jpg")}
            alt="Electronics Sale"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="max-w-7xl mx-auto px-8 relative z-20 flex flex-col justify-center h-full">
            <div className="max-w-md">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                Future Core
              </span>
              <h3 className="text-2xl md:text-4xl font-black mt-2 leading-none font-heading">
                Electronics Fest Upgrade
              </h3>
              <p className="text-xs mt-3 text-slate-350 leading-relaxed font-medium">
                Uncompromising sound fidelity headphones, premium wireless chargers, and ergonomic workspace tools. Elevate your production speed.
              </p>
              <div className="mt-6">
                <Link
                  to={getCategoryPath("electronics")}
                  className="bg-white hover:bg-slate-100 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition inline-flex items-center gap-1.5"
                >
                  Explore Tech <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ⭐ SECTION B: NEW ARRIVALS (Grid with New Ribbons) */}
        {newArrivals.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] text-sky-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <Sparkles size={11} className="text-sky-500" /> New Listings
                </span>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  ⭐ New Arrivals
                </h3>
              </div>
              <Link to="/products?sort=createdAt" className="text-xs font-bold text-sky-500 hover:underline flex items-center gap-0.5">
                View All <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((prod) => (
                <div key={prod._id} className="relative">
                  {/* New ribbon overlay */}
                  <span className="absolute top-3.5 right-12 z-10 bg-emerald-500 text-white text-[8px] font-extrabold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                    NEW
                  </span>
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. SPOTLIGHT COLLECTIONS (Swipeable collection list) */}
        <div>
          <div className="flex flex-col mb-8">
            <span className="text-[10px] text-sky-500 font-extrabold uppercase tracking-widest">
              Spotlight Campaigns
            </span>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Trending Collections
            </h3>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar snap-x">
            {[
              { title: "Festive Wardrobe", desc: "Handcrafted ethnic dress items and formal fits.", img: getDynamicImage("fashion", "https://i.pinimg.com/1200x/1a/81/12/1a8112a55105cf0a636eea0f16bee1d4.jpg"), link: getCategoryPath("fashion") },
              { title: "Organic Wellness", desc: "Gluten free adaptogens and cold-pressed botanical waters.", img: getDynamicImage("health", "https://i.pinimg.com/1200x/f1/1e/e3/f11ee304896854354d1660f39ac7c8c6.jpg"), link: getCategoryPath("health") },
              { title: "Smart Office", desc: "RGB mechanical keyboards and fast charging powerbanks.", img: getDynamicImage("electronics", "https://i.pinimg.com/1200x/ef/8f/07/ef8f07df7ea00e1b30eace8f77297a40.jpg"), link: getCategoryPath("electronics") },
            ].map((item, index) => (
              <div
                key={index}
                className="min-w-[300px] md:min-w-[380px] h-64 relative rounded-3xl overflow-hidden snap-start group border border-slate-200/50 dark:border-slate-800"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
                <img
                  src={item.img}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
                />
                <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end text-white">
                  <h4 className="text-lg font-heading font-black tracking-tight">{item.title}</h4>
                  <p className="text-[10px] text-slate-300 mt-1 leading-normal font-medium max-w-[90%]">{item.desc}</p>
                  <Link
                    to={item.link}
                    className="text-[10px] font-bold text-sky-400 hover:text-sky-300 mt-3 inline-flex items-center gap-1 hover:underline"
                  >
                    Explore Collection <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ⚡ SECTION C: FLASH DEALS (Grid with Stock Progress bar indicator) */}
        {dealsProducts.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <Zap size={11} className="fill-red-500 text-red-500" /> Fast Clearance
                </span>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  ⚡ Flash Clearance Deals
                </h3>
              </div>
              <Link to="/products" className="text-xs font-bold text-sky-500 hover:underline flex items-center gap-0.5">
                View All <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dealsProducts.slice(0, 4).map((prod) => {
                // Calculate pseudo stock progress percentage
                const percentageSold = Math.min(95, Math.max(50, 100 - (prod.stock || 0)));
                return (
                  <div key={prod._id} className="flex flex-col">
                    <ProductCard product={prod} />

                    {/* Stock tracker progress */}
                    <div className="mt-3 px-1">
                      <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                        <span>Sold: {percentageSold}%</span>
                        <span className="text-red-500">{prod.stock} units left</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full"
                          style={{ width: `${percentageSold}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PROMOTIONAL BANNER 3 (Beauty & Self-Care) */}
        <section className="py-20 relative overflow-hidden bg-slate-950 w-full text-white rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent z-10" />
          <img
            src={getDynamicImage("care", "https://i.pinimg.com/1200x/f6/15/50/f615508f7cad41c22bc66566b82cfb8d.jpg")}
            alt="Beauty Promotion"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="max-w-7xl mx-auto px-8 relative z-20 flex flex-col justify-center h-full">
            <div className="max-w-md">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                Daily Rituals
              </span>
              <h3 className="text-2xl md:text-4xl font-black mt-2 leading-none font-heading">
                Organic Skincare & Glow
              </h3>
              <p className="text-xs mt-3 text-slate-350 leading-relaxed font-medium">
                Indulge your skin with pure organic face washes, whipped shea butter body soufflés, and restorative botanical hair elixirs. Sourced with passion.
              </p>
              <div className="mt-6">
                <Link
                  to={getCategoryPath("care")}
                  className="bg-white hover:bg-slate-100 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition inline-flex items-center gap-1.5"
                >
                  Shop Beauty <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 🏠 SECTION D: HOME ESSENTIALS (Asymmetric Layout Side Poster Grid) */}
        {groceryProducts.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] text-sky-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <Coffee size={11} className="text-sky-500" /> Everyday Comforts
                </span>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  🏠 Grocery & Home Picks
                </h3>
              </div>
              <Link to="/products" className="text-xs font-bold text-sky-500 hover:underline flex items-center gap-0.5">
                View All <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Tall decorative card poster */}
              <div className="lg:col-span-1 h-[380px] lg:h-auto relative rounded-2xl overflow-hidden group border border-slate-200/50 dark:border-slate-800">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
                <img
                  src={getDynamicImage("grocer", "https://i.pinimg.com/1200x/0f/f4/63/0ff4634f8676ad579a89c4b31f4b220a.jpg")}
                  alt="Grocery Fresh"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end text-white">
                  <span className="bg-emerald-500 text-white text-[8px] font-extrabold px-2.5 py-1 rounded shadow-sm tracking-widest uppercase self-start mb-3">
                    Fresh Foods
                  </span>
                  <h4 className="text-xl font-heading font-black tracking-tight leading-snug">
                    Organic Kitchen & Pantry
                  </h4>
                  <p className="text-[10px] text-slate-300 mt-2 leading-relaxed font-medium">
                    Virgin oils, wild honeys, and organic seeds. Sourced directly from local farmers.
                  </p>
                </div>
              </div>

              {/* Mapped product grid (2 cols) */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {groceryProducts.slice(0, 4).map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>

            </div>
          </div>
        )}

        {/* 📱 SECTION E: ELECTRONICS & TECH (Grid layout with Tooltip specifications) */}
        {electronicsProducts.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] text-sky-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <TrendingUp size={11} className="text-sky-500" /> Digital Upgrades
                </span>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  📱 Electronics Showcase
                </h3>
              </div>
              <Link to="/products" className="text-xs font-bold text-sky-500 hover:underline flex items-center gap-0.5">
                View All <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {electronicsProducts.map((prod) => (
                <div key={prod._id} className="relative group/highlight">
                  <ProductCard product={prod} />

                  {/* Subtle technical specifications tooltip highlight on hover */}
                  <div className="absolute inset-x-0 bottom-16 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-sm p-3 border-t border-slate-800 text-[10px] text-slate-350 z-20 flex flex-col gap-1 opacity-0 pointer-events-none group-hover/highlight:opacity-100 transition-opacity duration-300 leading-normal rounded-t-xl mx-2 shadow-lg">
                    <span className="font-extrabold text-white text-xs mb-1 uppercase tracking-wider border-b border-slate-800 pb-1">
                      Specifications
                    </span>
                    <span className="truncate">Model: {prod.brand || "Premium Standard"}</span>
                    <span>Rating: {prod.rating} / 5.0 (Verified)</span>
                    <span className="text-sky-400 font-bold">Fast Dispatch Available</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 👕 SECTION F: SEASONAL SHOWCASE (Summer, Winter, Festival, Wedding) */}
        <div>
          <div className="flex flex-col mb-8">
            <span className="text-[10px] text-sky-500 font-extrabold uppercase tracking-widest">
              Style Catalogues
            </span>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Seasonal Outfits
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Summer Fresh", desc: "Light colors & premium floral fabrics.", img: "https://i.pinimg.com/736x/54/a4/c9/54a4c9f4d52aed100d019ee1c5f7a48f.jpg" },
              { title: "Cozy Winter", desc: "Heavy knit sweaters & dynamic layering jackets.", img: "https://i.pinimg.com/1200x/4a/4a/05/4a4a05cb018a70f125009fda13cb9319.jpg" },
              { title: "Festive Spark", desc: "Vivid textures & elegant traditional apparel.", img: "https://i.pinimg.com/736x/dd/6b/63/dd6b631899e8afb536ec9e249659985a.jpg" },
              { title: "Wedding Ritual", desc: "Stunning silhouettes & luxury standard fabrics.", img: "https://i.pinimg.com/1200x/57/6d/4d/576d4d81ec815f6a1f19f1ed4c8e1cc9.jpg" }
            ].map((item, index) => (
              <div
                key={index}
                className="h-96 relative rounded-2xl overflow-hidden group border border-slate-200/50 dark:border-slate-800"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent z-10" />
                <img
                  src={item.img}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                />
                <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end text-white">
                  <h4 className="text-base font-heading font-black tracking-tight">{item.title}</h4>
                  <p className="text-[9px] text-slate-300 mt-1 leading-relaxed font-semibold uppercase tracking-wider">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8. WHY SHOP WITH US SECTION (Replace old features layout) */}
        <div className="border-t border-slate-100 dark:border-slate-850 pt-16">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] text-sky-500 font-extrabold uppercase tracking-widest">
              Our Core Promises
            </span>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Why Shop With Us
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
            {shoppingFeatures.map((feat, index) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-6 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/80 rounded-2xl hover:shadow-md transition duration-300"
                >
                  <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center mb-4">
                    <IconComp size={16} className="text-sky-500" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    {feat.title}
                  </h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-medium leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 10. CUSTOMER REVIEWS (Rotating slideshow) */}
      <section className="py-16 bg-slate-50/70 dark:bg-slate-900/30 border-b border-slate-150 dark:border-slate-800/60">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="flex justify-center text-amber-400 mb-4 gap-0.5">
            {[...Array(5)].map((_, j) => (
              <Star key={j} size={15} fill="#f59e0b" className="stroke-0" />
            ))}
          </div>

          <div className="relative h-44 overflow-hidden mb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={reviewIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col justify-center items-center"
              >
                <p className="text-sm md:text-base font-semibold italic text-slate-700 dark:text-slate-200 leading-relaxed max-w-2xl">
                  "{testimonials[reviewIndex].text}"
                </p>

                <div className="flex items-center justify-center gap-3 mt-6">
                  {/* Customer initials inside visual gradient avatar */}
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-r ${testimonials[reviewIndex].bg} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                    {testimonials[reviewIndex].initial}
                  </div>
                  <div className="text-left">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white leading-none">
                      {testimonials[reviewIndex].name}
                    </h5>
                    <span className="text-[9px] text-emerald-500 font-extrabold uppercase tracking-widest flex items-center gap-0.5 mt-1">
                      <CheckCircle size={10} className="fill-emerald-500 text-white dark:text-slate-900" />
                      {testimonials[reviewIndex].role}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* reviewer indicators */}
          <div className="flex justify-center gap-1.5 mt-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setReviewIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${reviewIndex === i ? "w-4 bg-sky-500" : "w-1.5 bg-slate-300 dark:bg-slate-700"
                  }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 11. RECENTLY VIEWED (At the bottom, compact) */}
      {recentlyViewed && recentlyViewed.length > 0 && (
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Clock size={12} /> Recently Viewed Items
            </h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {recentlyViewed.length} items
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {recentlyViewed.slice(0, 5).map((prod) => (
              <Link
                key={prod._id}
                to={`/products/${prod._id}`}
                className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-800 rounded-xl transition min-w-[200px] flex-shrink-0"
              >
                <img
                  src={prod.images?.[0] || ""}
                  alt={prod.name}
                  className="w-10 h-10 object-cover rounded-lg border border-slate-200/50 dark:border-slate-700 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-850 dark:text-slate-100 truncate">
                    {prod.name}
                  </p>
                  <p className="text-[10px] text-sky-500 font-semibold mt-0.5">
                    ₹{prod.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}


      {/* 13. NEWSLETTER SUBSCRIPTION SECTION */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 shadow-md shadow-sky-500/20 flex items-center justify-center mx-auto mb-6">
            <Mail size={20} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Stay In The Loop
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-2.5 max-w-md mx-auto leading-relaxed">
            Get early access to exclusive catalog collections, flash sales discounts, and handpicked product listings straight to your email.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-8">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-950 focus:border-sky-500 focus:outline-none transition shadow-inner"
            />
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition shadow-md hover:shadow-lg"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
};

export default Home;