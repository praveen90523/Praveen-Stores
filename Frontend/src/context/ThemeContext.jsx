import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 1. Theme — Default: Light Mode (Premium White)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved || "light"; // Default to light mode
  });

  // 2. Reading Mode
  const [readingMode, setReadingMode] = useState(() => {
    return localStorage.getItem("readingMode") === "true";
  });

  // 3. Accessibility Settings
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("fontSize") || "base";
  });

  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem("highContrast") === "true";
  });

  // 4. Product Comparison List
  const [compareList, setCompareList] = useState(() => {
    const saved = localStorage.getItem("compareList");
    return saved ? JSON.parse(saved) : [];
  });

  // 5. Recently Viewed Products
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    const saved = localStorage.getItem("recentlyViewed");
    return saved ? JSON.parse(saved) : [];
  });

  // 6. Loyalty Rewards System
  const [loyaltyPoints, setLoyaltyPoints] = useState(() => {
    const saved = localStorage.getItem("loyaltyPoints");
    return saved ? parseInt(saved, 10) : 150;
  });

  // 7. Notifications Center
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "n-welcome",
        message: "Welcome to Praveen Store! Explore our premium collection.",
        type: "success",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
      },
      {
        id: "n-coupon",
        message: "Unlock 20% off with coupon code LUXURY20 at checkout!",
        type: "promo",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
      },
    ];
  });

  // 8. AI Shopping Assistant Drawer
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  // Sync theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (readingMode) {
      root.classList.add("reading-mode");
    } else {
      root.classList.remove("reading-mode");
    }
    localStorage.setItem("readingMode", String(readingMode));
  }, [readingMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("font-size-sm", "font-size-base", "font-size-lg", "font-size-xl");
    root.classList.add(`font-size-${fontSize}`);
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    localStorage.setItem("highContrast", String(highContrast));
  }, [highContrast]);

  useEffect(() => { localStorage.setItem("compareList", JSON.stringify(compareList)); }, [compareList]);
  useEffect(() => { localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed)); }, [recentlyViewed]);
  useEffect(() => { localStorage.setItem("loyaltyPoints", String(loyaltyPoints)); }, [loyaltyPoints]);
  useEffect(() => { localStorage.setItem("notifications", JSON.stringify(notifications)); }, [notifications]);

  // Product Comparison Actions
  const addToCompareList = (product) => {
    if (compareList.some((item) => item._id === product._id)) return;
    if (compareList.length >= 4) {
      addNotification("Comparison list is full. Remove an item first.", "warning");
      return;
    }
    setCompareList([...compareList, product]);
    addNotification(`${product.name} added to comparison.`, "info");
  };

  const removeFromCompareList = (productId) => {
    setCompareList(compareList.filter((item) => item._id !== productId));
  };

  const clearCompareList = () => setCompareList([]);

  // Recently Viewed Actions
  const addRecentlyViewed = (product) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item._id !== product._id);
      return [product, ...filtered].slice(0, 10);
    });
  };

  // Loyalty Points Actions
  const addLoyaltyPoints = (points) => {
    setLoyaltyPoints((prev) => prev + points);
    addNotification(`Earned +${points} loyalty points!`, "success");
  };

  const redeemPoints = (points) => {
    setLoyaltyPoints((prev) => Math.max(0, prev - points));
  };

  // Notifications Actions
  const addNotification = (message, type = "info") => {
    const newNotif = {
      id: `n-${Date.now()}`,
      message,
      type,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        readingMode,
        setReadingMode,
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        compareList,
        addToCompareList,
        removeFromCompareList,
        clearCompareList,
        recentlyViewed,
        addRecentlyViewed,
        loyaltyPoints,
        addLoyaltyPoints,
        redeemPoints,
        notifications,
        addNotification,
        markAllNotificationsRead,
        clearNotifications,
        aiAssistantOpen,
        setAiAssistantOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
