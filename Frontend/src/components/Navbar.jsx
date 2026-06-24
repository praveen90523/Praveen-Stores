import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { ThemeContext } from "../context/ThemeContext";
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
} from "lucide-react";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

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

  const totalCartQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const closeAllDropdowns = () => {
    setProfileDropdownOpen(false);
    setAccessDropdownOpen(false);
    setNotifDropdownOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(keyword)}`);
    } else {
      navigate("/products");
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const iconBtnCls = "text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 p-2 hover:bg-cyan-50 dark:hover:bg-slate-700 rounded-lg transition-all duration-200";

  return (
    <nav className="glass-navbar fixed top-0 left-0 w-full z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img
              src={logo}
              alt="Praveen Stores"
              className="h-12 w-auto object-contain"
            />

            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Praveen Stores
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your Everyday. Our Priority.
              </p>
            </div>
          </Link>

          {/* Search Bar — Desktop */}
          <div className="hidden md:flex flex-1 max-w-sm mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full glass-input py-2 pl-4 pr-9 rounded-xl text-sm"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-cyan-600 transition">
                <Search size={15} />
              </button>
            </form>
          </div>

          {/* Nav Controls — Desktop */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/products" className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg hover:bg-cyan-50 dark:hover:bg-slate-700 transition-all duration-200">
              Products
            </Link>
            <Link to="/about" className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg hover:bg-cyan-50 dark:hover:bg-slate-700 transition-all duration-200">
              About
            </Link>

            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* AI Assistant */}
            <button onClick={() => setAiAssistantOpen((prev) => !prev)} className={iconBtnCls} title="AI Assistant">
              <MessageSquare size={16} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={iconBtnCls}
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun size={16} className="text-amber-500" />
              ) : (
                <Moon size={16} className="text-slate-500" />
              )}
            </button>

            {/* Accessibility */}
            <div className="relative">
              <button
                onClick={() => { setAccessDropdownOpen(!accessDropdownOpen); setNotifDropdownOpen(false); setProfileDropdownOpen(false); }}
                className={iconBtnCls}
                title="Accessibility"
              >
                <Accessibility size={16} />
              </button>

              {accessDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-slate-700 z-50 animate-fade-in-down">
                  <h4 className="font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700 pb-2 mb-3">
                    Accessibility
                  </h4>

                  <div className="mb-3">
                    <label className="text-[10px] text-gray-400 font-semibold block mb-1.5 uppercase tracking-wider">Font Size</label>
                    <div className="grid grid-cols-4 gap-1">
                      {["sm", "base", "lg", "xl"].map((size) => (
                        <button
                          key={size}
                          onClick={() => setFontSize(size)}
                          className={`text-[10px] py-1.5 rounded-lg font-semibold uppercase transition ${fontSize === size
                            ? "bg-cyan-600 text-white shadow-sm"
                            : "bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600"
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300">
                    {[
                      { label: "High Contrast", state: highContrast, setter: setHighContrast },
                      { label: "Reading Mode", state: readingMode, setter: setReadingMode },
                    ].map(({ label, state, setter }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="font-medium">{label}</span>
                        <input
                          type="checkbox"
                          checked={state}
                          onChange={(e) => setter(e.target.checked)}
                          className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer w-4 h-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifDropdownOpen(!notifDropdownOpen); setAccessDropdownOpen(false); setProfileDropdownOpen(false); }}
                className={`${iconBtnCls} relative`}
                title="Notifications"
              >
                <Bell size={16} />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-slate-700 z-50 animate-fade-in-down">
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-2 mb-3">
                    <h4 className="font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Bell size={12} className="text-cyan-600" /> Notifications
                    </h4>
                    <div className="flex gap-2">
                      <button onClick={markAllNotificationsRead} className="text-[10px] text-cyan-600 hover:underline flex items-center gap-0.5">
                        <CheckCheck size={10} /> Read all
                      </button>
                      <button onClick={clearNotifications} className="text-[10px] text-red-500 hover:underline flex items-center gap-0.5">
                        <Trash2 size={10} /> Clear
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No notifications</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-2.5 rounded-xl border text-xs ${notif.read
                            ? "bg-gray-50 dark:bg-slate-700/40 border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400"
                            : "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-100 dark:border-cyan-800 text-gray-700 dark:text-gray-200 font-medium"
                            }`}
                        >
                          <p>{notif.message}</p>
                          <span className="text-[10px] text-gray-400 mt-1 block">{notif.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Wishlist */}
            <Link to="/wishlist" className={`${iconBtnCls} relative`}>
              <Heart size={16} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className={`${iconBtnCls} relative`}>
              <ShoppingCart size={16} />
              {totalCartQty > 0 && (
                <span className="absolute top-1 right-1 bg-cyan-600 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalCartQty}
                </span>
              )}
            </Link>

            {/* Profile */}
            {isAuthenticated ? (
              <div className="relative ml-1">
                <button
                  onClick={() => { setProfileDropdownOpen(!profileDropdownOpen); closeAllDropdowns(); setProfileDropdownOpen(!profileDropdownOpen); }}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-600 object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-cyan-50 dark:bg-slate-700 border-2 border-cyan-100 dark:border-slate-600 flex items-center justify-center text-xs font-bold text-cyan-600 dark:text-cyan-400">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl py-1 shadow-xl border border-gray-100 dark:border-slate-700 z-50 animate-fade-in-down">
                    <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-700">
                      <p className="text-xs font-semibold text-gray-800 dark:text-white">{user?.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                    </div>

                    {user?.role === "admin" && (
                      <Link to="/admin/dashboard" onClick={closeAllDropdowns} className="flex items-center gap-2 px-4 py-2.5 text-xs text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-slate-700 font-semibold">
                        <ShieldCheck size={14} /> Admin Console
                      </Link>
                    )}
                    <Link to="/profile" onClick={closeAllDropdowns} className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                      <User size={14} /> My Profile
                    </Link>
                    <Link to="/orders" onClick={closeAllDropdowns} className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                      <Package size={14} /> My Orders
                    </Link>
                    <div className="border-t border-gray-50 dark:border-slate-700 mt-1 pt-1">
                      <button
                        onClick={() => { closeAllDropdowns(); handleLogout(); }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-2 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm hover:shadow-md"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Nav Triggers */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={iconBtnCls}
            >
              {theme === "dark" ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-gray-500" />}
            </button>
            <Link to="/cart" className={`${iconBtnCls} relative`}>
              <ShoppingCart size={18} />
              {totalCartQty > 0 && (
                <span className="absolute top-1 right-1 bg-cyan-600 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalCartQty}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={iconBtnCls}>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-5 animate-fade-in-down">
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full glass-input py-2 pl-4 pr-9 rounded-xl text-sm"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-gray-400">
              <Search size={15} />
            </button>
          </form>

          <div className="flex flex-col gap-1 text-sm">
            {[
              { to: "/products", label: "Products" },
              { to: "/about", label: "About" },
              { to: "/wishlist", label: "Wishlist" },
            ].map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-slate-700 rounded-xl font-medium transition">
                {label}
              </Link>
            ))}

            <div className="border-t border-gray-100 dark:border-gray-700 my-2 pt-2">
              {isAuthenticated ? (
                <>
                  {user?.role === "admin" && (
                    <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2.5 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-slate-700 rounded-xl font-semibold flex items-center gap-2">
                      <ShieldCheck size={16} /> Admin Console
                    </Link>
                  )}
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl flex items-center gap-2">
                    <User size={16} /> My Profile
                  </Link>
                  <Link to="/orders" onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl flex items-center gap-2">
                    <Package size={16} /> My Orders
                  </Link>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="w-full text-left px-3 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-semibold flex items-center gap-2">
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                  className="block text-center bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 text-white font-semibold py-2.5 rounded-xl text-sm transition">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;