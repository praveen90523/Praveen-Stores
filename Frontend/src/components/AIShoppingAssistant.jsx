import React, { useState, useEffect, useRef, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MessageSquare, X, Send, Bot, User, ArrowRight, ShoppingCart, HelpCircle } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import { addToLocalCart, addToDBCart } from "../redux/slices/cartSlice";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL } from "../utils/constants";
import { Link } from "react-router-dom";

const AIShoppingAssistant = () => {
  const dispatch = useDispatch();
  const { aiAssistantOpen, setAiAssistantOpen } = useContext(ThemeContext);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "msg-welcome",
      sender: "bot",
      text: "Warm tidal greetings! I am Marina, your Ocean Shopping Assistant. How may I help you navigate Praveen Stores today?",
      suggestions: ["Show all products", "Find electronics", "Items under ₹5,000", "Promo coupons"]
    }
  ]);
  const [allProducts, setAllProducts] = useState([]);
  const messagesEndRef = useRef(null);

  // Fetch all products to use for offline keyword mapping
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

  // Scroll to bottom when messages list grows
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
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // 2. Call live backend AI completions
      const res = await axios.post(`${API_URL}/ai/chat`, {
        messages: messages.concat(userMsg),
        query: query
      });

      if (res.data.success) {
        let text = res.data.reply;
        let matchedProducts = [];

        // Extract bracketed product IDs tag if present
        const match = text.match(/\[PRODUCT_IDS:\s*([^\]]+)\]/);
        if (match) {
          const ids = match[1].split(",").map(id => id.trim()).filter(Boolean);
          matchedProducts = allProducts.filter(p => ids.includes(p._id.toString()));
          // Remove the product IDs tag from the text displayed to the user
          text = text.replace(/\[PRODUCT_IDS:\s*([^\]]+)\]/, "").trim();
        }

        // Generate dynamic suggestions based on user context
        let nextSuggestions = ["Show all products", "Items under ₹500", "Current coupon codes"];
        if (query.toLowerCase().includes("fruit") || query.toLowerCase().includes("vegetable")) {
          nextSuggestions = ["Show fresh vegetables", "Dairy products", "Health & Wellness"];
        } else if (query.toLowerCase().includes("clean") || query.toLowerCase().includes("laundry")) {
          nextSuggestions = ["Home Essentials", "Kitchen items"];
        }

        const botMsg = {
          id: `msg-bot-${Date.now()}`,
          sender: "bot",
          text: text,
          products: matchedProducts,
          suggestions: nextSuggestions
        };

        setMessages((prev) => [...prev, botMsg]);
      } else {
        const botMsg = {
          id: `msg-bot-${Date.now()}`,
          sender: "bot",
          text: res.data.reply || "Something went wrong. Please check your network connection.",
          products: [],
          suggestions: ["Show all products", "Items under ₹500"]
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error("AI Assistant call failed:", err);
      const errorMsg = {
        id: `msg-bot-${Date.now()}`,
        sender: "bot",
        text: "I apologize, but my ocean communication is currently experiencing rough tides. Please try again in a moment!"
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
      console.log("[AIShoppingAssistant] addToCart clicked", { productId: product._id, product });
      if (isAuthenticated) {
        const resultAction = await dispatch(
          addToDBCart({ productId: product._id, quantity: 1 })
        ).unwrap();
        console.log("[AIShoppingAssistant] addToDBCart success", resultAction);
      } else {
        dispatch(addToLocalCart({ product, quantity: 1 }));
        console.log("[AIShoppingAssistant] addToLocalCart success", { product, quantity: 1 });
      }
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error("[AIShoppingAssistant] addToCart failed", error);
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to add product to cart"
      );
    }
  };

  if (!aiAssistantOpen) {
    return (
      <button
        onClick={() => setAiAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-ocean-primary hover:bg-ocean-secondary text-white p-4 rounded-full shadow-2xl hover:shadow-cyan-400/40 transition-all duration-300 transform hover:scale-110 flex items-center justify-center border border-white/10"
        title="AI Shopping Assistant"
      >
        <MessageSquare size={24} className="animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md h-[550px] glass-card rounded-2xl shadow-2xl border border-ocean-primary/20 flex flex-col overflow-hidden animate-fade-in">
      
      {/* Bot Header */}
      <div className="bg-gradient-ocean p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/15">
            <Bot size={22} className="text-cyan-200" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Marina</h4>
            <span className="text-[10px] text-cyan-100 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping"></span>
              Praveen Stores Advisor
            </span>
          </div>
        </div>
        <button
          onClick={() => setAiAssistantOpen(false)}
          className="p-1 hover:bg-white/10 rounded-full transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Message Log */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/40 select-text">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.sender === "user"
                  ? "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-850 dark:text-slate-100 dark:border-slate-700"
                  : "bg-ocean-secondary text-white border-ocean-primary/25"
              }`}
            >
              {msg.sender === "user" ? <User size={14} /> : <Bot size={14} />}
            </div>

            {/* Bubble contents */}
            <div className="space-y-3">
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                  msg.sender === "user"
                    ? "bg-ocean-primary/10 border-ocean-primary/20 text-slate-800 dark:text-slate-200 rounded-tr-none"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none shadow-sm"
                }`}
              >
                {msg.text.split("\n").map((line, idx) => (
                  <p key={idx} className="mb-1">{line}</p>
                ))}
              </div>

              {/* Product cards inside bot messages */}
              {msg.products && msg.products.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2 w-full">
                  {msg.products.map((prod) => (
                    <div
                      key={prod._id}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between hover:border-ocean-primary/30 transition shadow-sm"
                    >
                      <Link to={`/products/${prod._id}`} onClick={() => setAiAssistantOpen(false)}>
                        <img
                          src={prod.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200"}
                          alt={prod.name}
                          className="w-full h-20 object-cover rounded-lg mb-2"
                        />
                        <h5 className="font-semibold text-[11px] text-slate-800 dark:text-slate-200 line-clamp-1 hover:text-ocean-primary transition">
                          {prod.name}
                        </h5>
                      </Link>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-[11px] text-slate-800 dark:text-slate-100">
                          ₹{prod.price.toLocaleString("en-IN")}
                        </span>
                        <button
                          onClick={() => handleAddToCart(prod)}
                          className="p-1.5 rounded-lg bg-ocean-primary hover:bg-ocean-secondary text-white transition"
                        >
                          <ShoppingCart size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions pills */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {msg.suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(sug)}
                      className="text-[10px] bg-slate-200/60 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 py-1 px-2.5 rounded-full hover:bg-ocean-primary/10 hover:border-ocean-primary/30 hover:text-ocean-primary transition duration-150"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center animate-pulse">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-ocean-secondary text-white border-ocean-primary/25">
              <Bot size={14} className="animate-spin" />
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none shadow-sm text-xs text-gray-500 flex items-center gap-1.5">
              <span>Marina is reading the tides...</span>
              <span className="flex gap-0.5 animate-pulse">
                <span className="w-1 h-1 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-1 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 items-center"
      >
        <input
          type="text"
          placeholder={isLoading ? "Marina is reading the tides..." : "Ask Marina..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-grow py-2 px-3.5 rounded-full text-xs glass-input outline-none focus:ring-1 focus:ring-ocean-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 rounded-full bg-ocean-primary hover:bg-ocean-secondary text-white disabled:bg-slate-300 disabled:text-slate-500 disabled:opacity-40 transition-all flex items-center justify-center"
        >
          <Send size={14} />
        </button>
      </form>

    </div>
  );
};

export default AIShoppingAssistant;
