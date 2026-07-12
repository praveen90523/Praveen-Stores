import React, { useState, useEffect, useRef, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, Send, ShoppingCart, Star, Sparkles, MessageSquare, Clock, Bot } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import { addToLocalCart, addToDBCart } from "../redux/slices/cartSlice";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL } from "../utils/constants";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const AIShoppingAssistant = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { 
    aiAssistantOpen, 
    setAiAssistantOpen, 
    recentlyViewed = [], 
    compareList = [], 
    loyaltyPoints = 150 
  } = useContext(ThemeContext);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  
  // Load message logs from sessionStorage or fall back to default welcome
  const [messages, setMessages] = useState(() => {
    const savedChat = sessionStorage.getItem("marina_chat_history");
    if (savedChat) {
      try {
        return JSON.parse(savedChat);
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
    return [
      {
        id: "msg-welcome",
        sender: "bot",
        text: "👋 Hi! I'm Marina AI, your personal shopping assistant at Praveen Stores. I can help you find products, compare options, discover today's best deals, and answer any shopping questions. What are you looking for today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestions: ["🔥 Trending", "🛍 New Arrivals", "💰 Offers", "🎁 Gift Ideas"]
      }
    ];
  });

  const messagesEndRef = useRef(null);

  // Suggested quick-action chips config
  const quickActionChips = [
    { label: "🔥 Trending", query: "Show trending products" },
    { label: "👟 Shoes", query: "Show shoes" },
    { label: "👕 Shirts", query: "Show shirts" },
    { label: "👖 Jeans", query: "Show jeans" },
    { label: "⌚ Watches", query: "Show watches" },
    { label: "🛍 New Arrivals", query: "Show new arrivals" },
    { label: "💰 Offers", query: "Show current offers and deals" },
    { label: "🎁 Gift Ideas", query: "Suggest gift ideas" }
  ];

  // Fetch all products to resolve IDs returned by backend offline matcher
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await axios.get(`${API_URL}/products?limit=all`);
        if (res.data.success) {
          setAllProducts(res.data.products);
        }
      } catch (err) {
        console.error("Failed to load catalog for AI Assistant", err);
      }
    };
    fetchCatalog();
  }, []);

  // Update welcome greeting message dynamically if user's name is available
  useEffect(() => {
    const firstName = user?.name ? user.name.split(" ")[0] : "";
    const greetingText = firstName
      ? `👋 Hi ${firstName}! I'm Marina AI, your personal shopping assistant at Praveen Stores. I can help you find products, compare options, discover today's best deals, and answer any shopping questions. What are you looking for today?`
      : `👋 Hi! I'm Marina AI, your personal shopping assistant at Praveen Stores. I can help you find products, compare options, discover today's best deals, and answer any shopping questions. What are you looking for today?`;

    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === "msg-welcome" && prev[0].text !== greetingText) {
        const updated = [{ ...prev[0], text: greetingText }];
        sessionStorage.setItem("marina_chat_history", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, [user]);

  // Persist messages list to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("marina_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom when messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiAssistantOpen, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend.trim();
    if (!query || isLoading) return;

    // 1. Add user message
    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // 2. Call backend completion API
      const res = await axios.post(`${API_URL}/ai/chat`, {
        messages: messages.concat(userMsg),
        query: query
      });

      if (res.data.success) {
        let text = res.data.reply;
        let matchedProducts = [];

        // Parse product IDs if present
        const match = text.match(/\[PRODUCT_IDS:\s*([^\]]+)\]/);
        if (match) {
          const ids = match[1].split(",").map(id => id.trim()).filter(Boolean);
          matchedProducts = allProducts.filter(p => ids.includes(p._id.toString()));
          text = text.replace(/\[PRODUCT_IDS:\s*([^\]]+)\]/, "").trim();
        }

        // Generate dynamic helpful suggestions
        let nextSuggestions = ["🔥 Trending", "🛍 New Arrivals", "💰 Offers", "🎁 Gift Ideas"];
        const lowerQ = query.toLowerCase();
        if (lowerQ.includes("shoe") || lowerQ.includes("sneaker")) {
          nextSuggestions = ["Show shoes under ₹2000", "Running shoes", "New Arrivals"];
        } else if (lowerQ.includes("shirt") || lowerQ.includes("jeans") || lowerQ.includes("fashion")) {
          nextSuggestions = ["Men Fashion", "Jeans", "What fits a white shirt?"];
        } else if (lowerQ.includes("grocery") || lowerQ.includes("honey") || lowerQ.includes("oil")) {
          nextSuggestions = ["Organic Honey", "Show fresh vegetables", "Groceries"];
        } else if (lowerQ.includes("policy") || lowerQ.includes("return") || lowerQ.includes("shipping")) {
          nextSuggestions = ["Shipping details", "Returns & Refund Policy", "Contact support"];
        }

        const botMsg = {
          id: `msg-bot-${Date.now()}`,
          sender: "bot",
          text: text,
          products: matchedProducts,
          suggestions: nextSuggestions,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };

        setMessages((prev) => [...prev, botMsg]);
      } else {
        const botMsg = {
          id: `msg-bot-${Date.now()}`,
          sender: "bot",
          text: res.data.reply || "I encountered an error connecting to my database. Please check your network.",
          products: [],
          suggestions: ["🔥 Trending", "🛍 New Arrivals"],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error("AI Assistant call failed:", err);
      const errorMsg = {
        id: `msg-bot-${Date.now()}`,
        sender: "bot",
        text: "I apologize, but my circuits are experiencing a brief delay. Please let me gather my thoughts and try again!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (product.stock < 1) {
      toast.warning("Product out of stock");
      return;
    }

    try {
      if (isAuthenticated) {
        await dispatch(addToDBCart({ productId: product._id, quantity: 1 })).unwrap();
      } else {
        dispatch(addToLocalCart({ product, quantity: 1 }));
      }
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error("[AIShoppingAssistant] addToCart failed", error);
      toast.error(typeof error === "string" ? error : error?.message || "Failed to add to cart");
    }
  };

  return (
    <>
      {/* Floating Circular Icon Trigger */}
      <AnimatePresence>
        {!aiAssistantOpen && (
          <motion.button
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 30 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setAiAssistantOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-ocean-primary hover:bg-ocean-secondary text-white p-4 rounded-full shadow-2xl hover:shadow-cyan-400/40 transition-all duration-300 flex items-center justify-center border border-white/10 cursor-pointer focus:outline-none"
            title="AI Shopping Assistant"
          >
            <MessageSquare size={24} className="animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Chat Drawer Container */}
      <AnimatePresence>
        {aiAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[420px] h-[600px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/60 flex flex-col overflow-hidden select-text"
          >
            {/* Header */}
            <div className="bg-gradient-ocean px-5 py-4 text-white flex items-center justify-between shadow-lg shrink-0">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-cyan-200 animate-pulse" />
                <div>
                  <h4 className="font-extrabold text-sm tracking-wide flex items-center gap-1">
                    Marina AI
                    <Sparkles size={13} className="text-cyan-200 animate-pulse" />
                  </h4>
                  <span className="text-[10px] text-cyan-100 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                    Praveen Stores Advisor
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAiAssistantOpen(false)}
                className="p-1.5 hover:bg-white/15 rounded-full transition duration-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conversation Log Area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-slate-950/20 select-text scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  } w-full`}
                >
                  {/* Message Bubble contents (Clean design without message-level avatars) */}
                  <div className="space-y-1.5 w-full flex flex-col">
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] shadow-sm ${
                        msg.sender === "user"
                          ? "bg-gradient-ocean text-white rounded-tr-none ml-auto"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none mr-auto"
                      }`}
                    >
                      {msg.text.split("\n").map((line, idx) => (
                        <p key={idx} className="mb-1">{line}</p>
                      ))}
                      
                      {/* Timestamp */}
                      <span className={`flex items-center gap-1 text-[8px] mt-1.5 select-none font-medium ${
                        msg.sender === "user" ? "text-white/60 justify-end" : "text-slate-400 dark:text-slate-500 justify-end"
                      }`}>
                        <Clock size={8} />
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Product Card Carousel inside chat (aligned to the left) */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="flex gap-3 overflow-x-auto pb-2 pt-2 scrollbar-thin w-full max-w-[90%] snap-x mt-1 mr-auto">
                        {msg.products.map((prod) => {
                          const discount = prod.originalPrice > prod.price 
                            ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100) 
                            : 0;

                          return (
                            <div
                              key={prod._id}
                              className="min-w-[170px] max-w-[170px] snap-start bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-3 flex flex-col justify-between hover:border-cyan-500/50 transition duration-300 shadow-sm relative group select-none"
                            >
                              {/* Discount Badge */}
                              {discount > 0 && (
                                <span className="absolute top-2 left-2 px-2 py-0.5 text-[8px] font-black bg-rose-500 text-white rounded-full z-10 shadow-sm animate-pulse">
                                  {discount}% OFF
                                </span>
                              )}
                              <Link 
                                to={`/products/${prod._id}`} 
                                onClick={() => setAiAssistantOpen(false)}
                                className="block"
                              >
                                <div className="w-full h-24 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-950 mb-2.5 relative flex items-center justify-center border border-slate-100 dark:border-slate-800">
                                  <img
                                    src={prod.images?.[0] || "https://i.pinimg.com/1200x/be/3c/58/be3c58f1bbd182e1e632f73bc4ba20db.jpg"}
                                    alt={prod.name}
                                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition duration-300"
                                  />
                                </div>
                                <h5 className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200 line-clamp-2 hover:text-cyan-500 transition leading-tight mb-1.5">
                                  {prod.name}
                                </h5>
                              </Link>

                              <div className="space-y-2">
                                {/* Rating and Stock Info */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <Star size={10} fill="#f59e0b" className="text-yellow-500" />
                                    <span className="text-[10px] font-bold text-slate-650 dark:text-slate-355">
                                      {prod.rating?.toFixed(1) || "4.5"}
                                    </span>
                                  </div>
                                  {prod.stock < 1 ? (
                                    <span className="text-[8px] font-bold text-rose-500 uppercase">Out of Stock</span>
                                  ) : (
                                    <span className="text-[8px] font-bold text-emerald-500 uppercase">{prod.stock} left</span>
                                  )}
                                </div>

                                {/* Price block */}
                                <div className="flex items-baseline gap-1.5">
                                  <span className="font-black text-[12px] text-slate-900 dark:text-slate-50">
                                    ₹{prod.price.toLocaleString("en-IN")}
                                  </span>
                                  {prod.originalPrice > prod.price && (
                                    <span className="text-[9px] line-through text-slate-400 font-medium">
                                      ₹{prod.originalPrice.toLocaleString("en-IN")}
                                    </span>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                                  <Link
                                    to={`/products/${prod._id}`}
                                    onClick={() => setAiAssistantOpen(false)}
                                    className="text-center py-1.5 px-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[9px] transition"
                                  >
                                    Details
                                  </Link>
                                  <button
                                    onClick={() => handleAddToCart(prod)}
                                    disabled={prod.stock < 1}
                                    className="flex items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg bg-gradient-ocean text-white font-bold text-[9px] hover:opacity-90 transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                                  >
                                    <ShoppingCart size={9} />
                                    <span>Add</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Chat suggestions chips */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 mr-auto max-w-[85%]">
                        {msg.suggestions.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(sug)}
                            className="text-[10px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 py-1.5 px-3 rounded-full hover:bg-cyan-500/10 hover:border-cyan-500 hover:text-cyan-500 transition duration-200 cursor-pointer shadow-sm"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Shimmer loading and skeletons */}
              {isLoading && (
                <div className="flex flex-col mr-auto max-w-[85%] gap-2.5 animate-pulse w-full">
                  {/* Bouncing Dots Loading Bubble */}
                  <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none shadow-sm text-xs text-slate-500 flex items-center gap-1.5 w-max">
                    <span className="font-semibold">Marina AI is thinking</span>
                    <span className="flex gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>

                  {/* Skeletons list */}
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none w-full mt-1">
                    {[1, 2].map((i) => (
                      <div key={i} className="min-w-[170px] max-w-[170px] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl p-3 flex flex-col gap-2.5 shadow-sm">
                        <div className="w-full h-24 skeleton rounded-xl" />
                        <div className="w-11/12 h-3.5 skeleton rounded-md" />
                        <div className="w-2/3 h-3 skeleton rounded-md" />
                        <div className="flex justify-between items-center mt-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                          <div className="w-12 h-4 skeleton rounded-md" />
                          <div className="w-10 h-6 skeleton rounded-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested quick-action chips (sticky panel right above input box) */}
            <div className="flex gap-2 overflow-x-auto px-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-200/40 dark:border-slate-800/40 scrollbar-none shrink-0">
              {quickActionChips.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleSendMessage(chip.query)}
                  className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 py-1.5 px-3 rounded-full hover:border-cyan-500 hover:text-cyan-500 transition duration-200 cursor-pointer shadow-sm select-none"
                >
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Message Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="p-3 border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 flex gap-2.5 items-center shrink-0"
            >
              <input
                type="text"
                placeholder={isLoading ? "Marina is thinking..." : "Type your query..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-grow py-2.5 px-4 rounded-full text-xs glass-input outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-full bg-gradient-ocean hover:opacity-90 text-white disabled:bg-slate-200 disabled:text-slate-400 disabled:opacity-40 disabled:pointer-events-none transition flex items-center justify-center shadow shadow-cyan-500/10 cursor-pointer focus:outline-none"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIShoppingAssistant;
