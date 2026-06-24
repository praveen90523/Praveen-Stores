import { Link } from "react-router-dom";
import { Mail, ArrowRight, Zap } from "lucide-react";
import { FaTwitter, FaGithub, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#F8FCFD] dark:bg-[#0F172A] border-t border-slate-100 dark:border-slate-800 pt-14 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand Info */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-lg flex items-center justify-center shadow-sm">
                <Zap size={16} className="text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                Praveen Stores
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Premium shopping experience. Discover products crafted for quality, elegance, and everyday life.
            </p>
            <div className="flex gap-2 mt-5">
              {[
                { Icon: FaTwitter, href: "https://twitter.com" },
                { Icon: FaGithub, href: "https://github.com" },
                { Icon: FaInstagram, href: "https://instagram.com" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center justify-center text-gray-400 transition-all duration-200"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-4">Shop</h3>
            <ul className="space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
              {[
                { to: "/products", label: "All Products" },
                { to: "/products?category=electronics", label: "Electronics" },
                { to: "/products?category=accessories", label: "Accessories" },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
              {[
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact Support" },
                { to: "/about#privacy", label: "Privacy Policy" },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-4">Newsletter</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Subscribe for exclusive deals and new arrivals.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="relative w-full">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full glass-input py-2.5 pl-4 pr-12 rounded-xl text-sm"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 text-white p-2 rounded-lg transition"
              >
                <ArrowRight size={13} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <p>© Praveen Store. All rights reserved.</p>
          <div className="flex gap-6 mt-3 md:mt-0">
            <span className="flex items-center gap-1.5">
              <p className="flex items-center gap-2">
                <Mail size={12} className="text-cyan-500" />
                <a
                  href="mailto:d.praveen2026@gmail.com"
                  className="hover:text-cyan-600"
                >
                  d.praveen2026@gmail.com
                </a>
              </p>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;