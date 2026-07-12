import { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { ThemeContext } from "../context/ThemeContext";
import { fetchCategories, fetchProducts } from "../redux/slices/productSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  Search,
  ShieldCheck,
  Sun,
  Moon,
  Accessibility,
  Bell,
  MessageSquare,
  Trash2,
  CheckCheck,
  Zap,
  Package,
  ChevronDown,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Tag,
  AppWindow,
  Star,
  Info,
} from "lucide-react";
import logo from "../assets/logo.png";
import axios from "axios";
import { API_URL } from "../utils/constants";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { categories, products } = useSelector((state) => state.products);

  const {
    theme,
    setTheme,
    readingMode,
    setReadingMode,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    notifications,
    markAllNotificationsRead,
    clearNotifications,
    setAiAssistantOpen,
  } = useContext(ThemeContext);

  const [keyword, setKeyword] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [accessDropdownOpen, setAccessDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  
  // Navigation Megamenu Hover States
  const [activeMegamenu, setActiveMegamenu] = useState(null); // 'categories' | 'brands' | null
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchRef = useRef(null);

  const totalCartQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  // Extract unique brands from products list
  const uniqueBrands = [...new Set((products || []).map((p) => p && p.brand).filter(Boolean))].slice(0, 8);

  useEffect(() => {
    // Fetch categories on component mount if not loaded
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dispatch, categories]);

  // Live suggestions logic using debounced backend API queries
  useEffect(() => {
    if (keyword.trim().length > 0) {
      const delayDebounceFn = setTimeout(async () => {
        try {
          const res = await axios.get(`${API_URL}/products?keyword=${encodeURIComponent(keyword)}&limit=5`);
          setSearchSuggestions(res.data.products || []);
          setShowSearchSuggestions(true);
        } catch (err) {
          console.error("Suggestions fetch error:", err);
        }
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchSuggestions([]);
      setShowSearchSuggestions(false);
    }
  }, [keyword]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(keyword)}`);
    } else {
      navigate("/products");
    }
    setShowSearchSuggestions(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const iconBtnCls =
    "relative text-gray-700 dark:text-gray-300 hover:text-sky-500 dark:hover:text-sky-400 p-2 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-full transition-all duration-200";

  // Category Icon Mapping helper
  const getCategoryIcon = (catName) => {
    if (!catName) return <Sparkles size={15} />;
    const name = catName.toLowerCase();
    if (name.includes("grocery") || name.includes("fruit") || name.includes("veg")) return <Zap size={15} />;
    if (name.includes("beverage") || name.includes("snack")) return <Tag size={15} />;
    if (name.includes("fashion") || name.includes("clothing") || name.includes("men") || name.includes("women")) return <Package size={15} />;
    if (name.includes("elec") || name.includes("tech")) return <TrendingUp size={15} />;
    if (name.includes("home") || name.includes("kitchen") || name.includes("clean")) return <AppWindow size={15} />;
    return <Sparkles size={15} />;
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-md py-2 border-b border-gray-200/50 dark:border-slate-800/50"
          : "bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800/40 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="relative group">
              <div className="absolute inset-[-4px] bg-gradient-to-r from-sky-400 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-300" />
              <img
                src={logo}
                alt="Praveen Stores"
                className="h-10 w-10 object-contain rounded-full bg-white p-0.5 border border-gray-200/50"
              />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                PRAVEEN <span className="text-sky-500">STORES</span>
              </h1>
              <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                Luxury Standard
              </p>
            </div>
          </Link>

          {/* Navigation Links — Desktop (Mega Menu hover triggers) */}
          <div className="hidden lg:flex items-center gap-6 ml-8">
            {/* Categories Link */}
            <div
              className="relative"
              onMouseEnter={() => setActiveMegamenu("categories")}
              onMouseLeave={() => setActiveMegamenu(null)}
            >
              <button className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-sky-500 dark:hover:text-sky-400 transition py-2">
                Categories <ChevronDown size={14} className={`transition-transform duration-200 ${activeMegamenu === "categories" ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {activeMegamenu === "categories" && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 mt-2 w-[560px] bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-slate-700 z-50 grid grid-cols-2 gap-6"
                  >
                    <div>
                      <h4 className="font-bold text-xs uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3">
                        Shop By Categories
                      </h4>
                      <div className="space-y-1">
                        {categories.map((cat) => (
                          <Link
                            key={cat._id}
                            to={`/products?category=${cat._id}`}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-sky-500 dark:hover:text-sky-400 transition"
                          >
                            <span className="flex items-center gap-2 font-medium">
                              <span className="text-sky-500/80">{getCategoryIcon(cat.name)}</span>
                              {cat.name}
                            </span>
                            <ChevronRight size={12} className="opacity-0 hover:opacity-100" />
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    {/* Visual Megamenu Promo Block */}
                    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-5 flex flex-col justify-between border border-gray-100 dark:border-slate-800">
                      <div>
                        <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                          Trending Spot
                        </span>
                        <h5 className="font-bold text-base text-slate-900 dark:text-white mt-3 leading-snug">
                          Organic & Fresh Grocery Picks
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                          Elevate your lifestyle with our premium handpicked wellness foods.
                        </p>
                      </div>
                      <Link
                        to="/products"
                        className="mt-4 w-full bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white text-center py-2.5 rounded-xl text-xs font-bold transition shadow-sm hover:shadow"
                      >
                        Explore Collection
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>



            <Link
              to="/products"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-sky-500 dark:hover:text-sky-400 transition py-2"
            >
              All Products
            </Link>
            <Link
              to="/about"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-sky-500 dark:hover:text-sky-400 transition py-2"
            >
              About
            </Link>
          </div>

          {/* Large Search Bar — Desktop (Tata CLiQ inspired) */}
          <div ref={searchRef} className="hidden md:flex flex-grow max-w-md mx-6 relative">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => { if (searchSuggestions.length > 0) setShowSearchSuggestions(true); }}
                className="w-full py-2.5 pl-4 pr-11 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-full text-xs font-medium focus:bg-white dark:focus:bg-slate-950 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none transition shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-sky-500 transition"
              >
                <Search size={16} />
              </button>
            </form>

            {/* suggestions menu */}
            <AnimatePresence>
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 w-full mt-12 bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-4 py-2 block border-b border-slate-50 dark:border-slate-700">
                    Product Suggestions
                  </span>
                  <div className="py-1">
                    {searchSuggestions.map((prod) => (
                      <Link
                        key={prod._id}
                        to={`/products/${prod._id}`}
                        onClick={() => setShowSearchSuggestions(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition"
                      >
                        <img
                          src={prod.images?.[0] || ""}
                          alt={prod.name}
                          className="w-8 h-8 object-cover rounded-lg border border-slate-100 dark:border-slate-700"
                        />
                        <div className="min-w-0 flex-grow">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {prod.name}
                          </p>
                          <p className="text-[10px] text-sky-500 font-semibold">
                            ₹{prod.price.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Icons Panel */}
          <div className="flex items-center gap-2">
            
            {/* AI assistant */}
            <button
              onClick={() => setAiAssistantOpen((prev) => !prev)}
              className={iconBtnCls}
              title="AI Assistant"
            >
              <MessageSquare size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping" />
            </button>

            {/* Dark/Light Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={iconBtnCls}
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun size={18} className="text-amber-500" />
              ) : (
                <Moon size={18} className="text-slate-600" />
              )}
            </button>

            {/* Accessibility dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setAccessDropdownOpen(!accessDropdownOpen);
                  setNotifDropdownOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className={iconBtnCls}
                title="Accessibility Settings"
              >
                <Accessibility size={18} />
              </button>

              <AnimatePresence>
                {accessDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-slate-700 z-50"
                  >
                    <h4 className="font-bold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-50 dark:border-slate-700 pb-2 mb-3">
                      Accessibility Configuration
                    </h4>

                    <div className="mb-4">
                      <label className="text-[10px] text-slate-400 font-bold block mb-2 uppercase tracking-wider">
                        Font Size Scale
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {["sm", "base", "lg", "xl"].map((size) => (
                          <button
                            key={size}
                            onClick={() => setFontSize(size)}
                            className={`text-[10px] py-1.5 rounded-lg font-bold uppercase transition ${
                              fontSize === size
                                ? "bg-slate-900 dark:bg-sky-500 text-white shadow-sm"
                                : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-600"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {[
                        { label: "High Contrast Mode", state: highContrast, setter: setHighContrast },
                        { label: "Reader Flow layout", state: readingMode, setter: setReadingMode },
                      ].map(({ label, state, setter }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span>{label}</span>
                          <input
                            type="checkbox"
                            checked={state}
                            onChange={(e) => setter(e.target.checked)}
                            className="rounded border-gray-300 dark:border-slate-600 text-sky-500 focus:ring-sky-400 cursor-pointer w-4 h-4"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setAccessDropdownOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className={iconBtnCls}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 bg-sky-500 text-white text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-extrabold shadow-sm">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-slate-700 z-50"
                  >
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-2 mb-3">
                      <h4 className="font-bold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Bell size={12} className="text-sky-500" /> Notifications
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-[9px] font-bold text-sky-500 hover:underline flex items-center gap-0.5"
                        >
                          <CheckCheck size={10} /> Read all
                        </button>
                        <button
                          onClick={clearNotifications}
                          className="text-[9px] font-bold text-red-500 hover:underline flex items-center gap-0.5"
                        >
                          <Trash2 size={10} /> Clear
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto no-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
                          <Info size={18} className="text-slate-300 mb-1" />
                          <p className="text-xs">No active alerts</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 rounded-xl border text-xs leading-normal transition-all duration-200 ${
                              notif.read
                                ? "bg-slate-50/50 dark:bg-slate-700/20 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                                : "bg-sky-50/20 dark:bg-sky-950/10 border-sky-100/50 dark:border-sky-900/30 text-slate-800 dark:text-slate-255 font-semibold"
                            }`}
                          >
                            <p>{notif.message}</p>
                            <span className="text-[9px] text-slate-400 mt-1.5 block">
                              {notif.time}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

            {/* Wishlist */}
            <Link to="/wishlist" className={`${iconBtnCls} hidden sm:flex`}>
              <Heart size={18} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-extrabold shadow-sm animate-pulse">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className={iconBtnCls}>
              <ShoppingCart size={18} />
              {totalCartQty > 0 && (
                <span className="absolute top-1 right-1 bg-sky-500 text-white text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-extrabold shadow-sm">
                  {totalCartQty}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative ml-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setAccessDropdownOpen(false);
                    setNotifDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 focus:outline-none transition hover:border-sky-500"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="User Avatar"
                      className="w-8 h-8 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-sky-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-sky-600 dark:text-sky-400">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl py-2 shadow-xl border border-gray-100 dark:border-slate-700 z-50"
                    >
                      <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-700 mb-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {user?.name}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {user?.email}
                        </p>
                      </div>

                      {user?.role === "admin" && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs text-sky-600 dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-750 font-bold"
                        >
                          <ShieldCheck size={14} /> Admin Console
                        </Link>
                      )}
                      
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-750 font-medium"
                      >
                        <User size={14} /> My Profile
                      </Link>
                      
                      <Link
                        to="/orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-750 font-medium"
                      >
                        <Package size={14} /> My Orders
                      </Link>
                      
                      <div className="border-t border-slate-50 dark:border-slate-700 mt-1.5 pt-1.5">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 font-bold"
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-2 px-4 py-2 rounded-full text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 transition shadow-sm hover:shadow-md"
              >
                Login
              </Link>
            )}

            {/* Mobile Navigation Menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-5 overflow-hidden"
          >
            {/* mobile search bar */}
            <form onSubmit={handleSearchSubmit} className="relative w-full mb-4">
              <input
                type="text"
                placeholder="Search premium products..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full py-2.5 pl-4 pr-11 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-750 rounded-full text-xs font-medium focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-3.5 top-2.5 text-slate-400"
              >
                <Search size={16} />
              </button>
            </form>

            <div className="flex flex-col gap-1.5 text-sm font-semibold">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest px-3 mb-1 block">
                Shop Department
              </span>

              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat._id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  <span className="text-sky-500">{getCategoryIcon(cat.name)}</span>
                  {cat.name}
                </Link>
              ))}

              <div className="border-t border-slate-100 dark:border-slate-800 my-3 pt-3">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest px-3 mb-1 block">
                  Quick Navigation
                </span>
                
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  <Package size={16} className="text-sky-500" />
                  All Products
                </Link>

                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  <Heart size={16} className="text-red-500" />
                  My Wishlist ({wishlistItems.length})
                </Link>
                
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  <Info size={16} className="text-sky-500" />
                  About Praveen Stores
                </Link>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-3">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 mb-2.5">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-205">{user?.name}</p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 truncate">{user?.email}</p>
                    </div>

                    {user?.role === "admin" && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-2.5 text-sky-500 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl font-bold flex items-center gap-2"
                      >
                        <ShieldCheck size={16} /> Admin Console
                      </Link>
                    )}
                    
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl flex items-center gap-2"
                    >
                      <User size={16} /> My Profile
                    </Link>
                    
                    <Link
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl flex items-center gap-2"
                    >
                      <Package size={16} /> My Orders
                    </Link>
                    
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-bold flex items-center gap-2"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white font-bold py-3 rounded-xl text-xs"
                  >
                    Login to Account
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;