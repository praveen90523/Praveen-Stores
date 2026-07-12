import React, { useContext, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AIShoppingAssistant from "../components/AIShoppingAssistant";
import ProductComparison from "../components/ProductComparison";
import { ThemeContext } from "../context/ThemeContext";
import { ChevronUp } from "lucide-react";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  const { } = useContext(ThemeContext);
  const [showBackToTop, setShowBackToTop] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0F172A] transition-colors duration-300 relative">



      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow pt-28 pb-16 relative z-10">
        <Outlet />
      </main>

      {/* Floating Helpers */}
      <ProductComparison />
      <AIShoppingAssistant />

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 p-3 rounded-full shadow-md hover:shadow-lg hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-300 transform hover:scale-110 flex items-center justify-center animate-fade-in-up"
          title="Back to Top"
          aria-label="Back to top"
        >
          <ChevronUp size={18} />
        </button>
      )}

      {/* Main Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
