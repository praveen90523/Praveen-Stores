import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Mail, ArrowRight, Zap, Shield, Headphones, RotateCcw, MapPin, Phone } from "lucide-react";
import { FaTwitter, FaGithub, FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";

const Footer = () => {
  const { categories = [], products = [] } = useSelector((state) => state.products) || {};

  // Dynamic values
  const uniqueBrands = [...new Set((products || []).map((p) => p && p.brand).filter(Boolean))].slice(0, 5);
  const footerCategories = (categories || []).slice(0, 5);

  return (
    <footer className="bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-800/60 pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Footer Top Badges (Trust highlights) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-200/80 dark:border-slate-800/80 mb-12">
          {[
            { Icon: Shield, title: "100% Genuine Products", desc: "Sourced directly from certified distributors" },
            { Icon: RotateCcw, title: "Easy 15-Day Returns", desc: "No questions asked refund policy" },
            { Icon: Headphones, title: "24/7 Dedicated Support", desc: "Always here to guide your journey" },
            { Icon: Zap, title: "Lightning Fast Delivery", desc: "Express shipping options across India" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 flex-shrink-0 mt-0.5">
                <item.Icon size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 mb-16">

          {/* Column 1: Brand Info */}
          <div className="md:col-span-1.5 flex flex-col justify-between">
            <div>
              <Link to="/" className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                  <Zap size={16} className="text-white" />
                </div>
                <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                  PRAVEEN <span className="text-sky-500">STORES</span>
                </span>
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                A premium shopping destination bringing you high-quality groceries, electronics, and fashion directly to your doorstep.
              </p>
            </div>

            {/* Social media icons */}
            <div className="flex gap-2 mt-6">
              {[
                { Icon: FaFacebookF, href: "https://facebook.com" },
                { Icon: FaTwitter, href: "https://twitter.com" },
                { Icon: FaInstagram, href: "https://instagram.com" },
                { Icon: FaYoutube, href: "https://youtube.com" },
                { Icon: FaGithub, href: "https://github.com" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 hover:text-sky-500 dark:hover:text-sky-400 flex items-center justify-center text-slate-400 dark:text-slate-500 transition-all duration-200 shadow-sm hover:-translate-y-0.5"
                >
                  <Icon size={12} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-wider uppercase mb-5">
              Categories
            </h3>
            <ul className="space-y-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              {footerCategories.length > 0 ? (
                footerCategories.map((cat) => (
                  <li key={cat._id}>
                    <Link
                      to={`/products?category=${cat._id}`}
                      className="hover:text-sky-500 dark:hover:text-sky-450 transition duration-150 flex items-center gap-1 group"
                    >
                      <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-sky-400 transition-all duration-150" />
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link to="/products" className="hover:text-sky-500">Groceries</Link></li>
                  <li><Link to="/products" className="hover:text-sky-500">Fashion</Link></li>
                  <li><Link to="/products" className="hover:text-sky-500">Electronics</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Column 3: Brands */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-wider uppercase mb-5">
              Top Brands
            </h3>
            <ul className="space-y-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              {uniqueBrands.length > 0 ? (
                uniqueBrands.map((brand) => (
                  <li key={brand}>
                    <Link
                      to={`/products?keyword=${encodeURIComponent(brand)}`}
                      className="hover:text-sky-500 dark:hover:text-sky-450 transition duration-150 flex items-center gap-1 group"
                    >
                      <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-sky-400 transition-all duration-150" />
                      {brand}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link to="/products" className="hover:text-sky-500">Puma</Link></li>
                  <li><Link to="/products" className="hover:text-sky-500">Nike</Link></li>
                  <li><Link to="/products" className="hover:text-sky-500">Adidas</Link></li>
                  <li><Link to="/products" className="hover:text-sky-500">Jack & Jones</Link></li>
                  <li><Link to="/products" className="hover:text-sky-500">H&M</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Column 4: Customer Support & Policies */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-wider uppercase mb-5">
              Service & Policies
            </h3>
            <ul className="space-y-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/about" className="hover:text-sky-500 transition duration-150">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-sky-500 transition duration-150">Contact Support</Link>
              </li>
              <li>
                <Link to="/about#privacy" className="hover:text-sky-500 transition duration-150">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/about#terms" className="hover:text-sky-500 transition duration-150">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/about#returns" className="hover:text-sky-500 transition duration-150">Cancellation & Returns</Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Store Location */}
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-wider uppercase mb-4">
                Corporate Office
              </h3>
              <ul className="space-y-3.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <li className="flex gap-2.5 items-start">
                  <MapPin size={15} className="text-sky-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Praveen Stores Head Office,<br />
                    Visakhapatnam,
                    Andhra Pradesh
                  </span>
                </li>
                <li className="flex gap-2.5 items-center">
                  <Phone size={15} className="text-sky-500 flex-shrink-0" />
                  <span>+91 9052339291</span>
                </li>
                <li className="flex gap-2.5 items-center">
                  <Mail size={15} className="text-sky-500 flex-shrink-0" />
                  <a href="mailto:d.praveen2026@gmail.com" className="hover:text-sky-500">
                    d.praveen2026@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom copyright bar */}
        <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-8 flex flex-col md:flex-row justify-between items-center text-[11px] font-medium text-slate-450 dark:text-slate-550">
          <p>© {new Date().getFullYear()} Praveen Stores. All rights reserved. Sourced with passion.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="flex items-center gap-1.5">
              <Mail size={12} className="text-sky-500" />
              <a href="mailto:d.praveen2026@gmail.com" className="hover:text-sky-500 transition duration-150">
                Contact: d.praveen2026@gmail.com
              </a>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;