const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const Product = require("../models/Product");
const Category = require("../models/Category");

// Lazy-load Gemini client to prevent order-of-import environment variable issues
let genAI = null;
const getGenAIInstance = () => {
  if (genAI) return genAI;
  // Support both standard GEMINI_API_KEY and GOOGLE_API_KEY from .env
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    return genAI;
  }
  return null;
};

/**
 * Handle chat completion using live LLMs (Gemini/OpenAI) or a smart offline catalog search
 */
const getAIChatResponse = async (messages, userQuery) => {
  // Fetch current product catalog for context, sorting by createdAt to identify new arrivals
  let products = [];
  try {
    products = await Product.find().populate("category").sort({ createdAt: -1 });
  } catch (dbError) {
    console.error("Database fetch error in aiService:", dbError);
  }

  // Get top 10 newest product IDs to tag them as new arrivals
  const newestProductIds = products.slice(0, 10).map((p) => p._id.toString());

  const formattedProducts = products.map((p) => {
    const isNewArrival = newestProductIds.includes(p._id.toString());
    const isBestSeller = p.rating >= 4.8;
    const isFeatured = p.rating >= 4.7 && p.stock > 0;
    const discount = p.originalPrice > p.price 
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) 
      : 0;

    return {
      id: p._id.toString(),
      name: p.name,
      category: p.category ? p.category.name : "Uncategorized",
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      brand: p.brand || "Praveen Stores",
      stock: p.stock,
      rating: p.rating,
      description: p.description,
      discount: discount,
      isNewArrival: isNewArrival,
      isBestSeller: isBestSeller,
      isFeatured: isFeatured,
    };
  });

  // Build system instruction
  const systemInstruction = `You are "Marina AI", a premium, friendly, and professional virtual shopping assistant at "Praveen Stores" (a high-end MERN e-commerce supermarket and lifestyle destination). 

Your Persona and Communication Guidelines:
1. Act like a knowledgeable, helpful, and polite in-store shopping expert.
2. Respond in a warm, natural, conversational, and premium tone. Greet customers warmly.
3. Keep answers concise and focused, unless the customer explicitly requests more details.
4. CRITICAL: Never invent or hallucinate products. Only recommend products that exist in the Product Catalog Inventory provided below.
5. If a product is out of stock (stock = 0), recommend similar alternatives that are in stock.
6. When recommending products from the inventory, you MUST append a tag at the very end of your response in the EXACT format: [PRODUCT_IDS: id1, id2, ...] (comma-separated database IDs of the recommended products). Example: "Here are some top options for you: [PRODUCT_IDS: 60a12c3f4e12, 60a12c3f4e13]". Do NOT invent IDs.
7. Help customers compare products if they ask. Highlight differences in price, ratings, features, and brand.
8. Guide customers on how to add products to their cart (click the "Add to Cart" button on the product card) or proceed to checkout.
9. Answer questions about store policies and details accurately using this info:
   - Shipping: Express shipping across India. Fast tracking, premium packaging.
   - Returns: Easy 15-day return policy, no questions asked refund policy (processed on the Profile page).
   - Loyalty Rewards: Earn 1 point for every ₹10 spent. 10 points = ₹1 off. Default balance is 150 points. Redeemable at checkout.
   - Location: Corporate office in Visakhapatnam, Andhra Pradesh, India.
   - Contact: Call +91 9052339291 or email d.praveen2026@gmail.com. Support is available 24/7.
   - Promo Codes: "OCEAN20" (20% off) and "PRAVEEN10" (10% off).

Product Catalog Inventory:
${JSON.stringify(formattedProducts, null, 2)}
`;

  // 3. Try Gemini API first if key exists
  const activeGenAI = getGenAIInstance();
  if (activeGenAI) {
    try {
      console.log("Attempting live Google Gemini API completions...");
      const model = activeGenAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: systemInstruction,
      });

      // Filter out welcome message
      const filteredMessages = messages.filter((msg) => msg.id !== "msg-welcome");
      
      // Prevent history duplication (history is all messages except the very last one)
      const historyMessages = filteredMessages.slice(0, -1);
      
      const geminiHistory = historyMessages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      const chat = model.startChat({
        history: geminiHistory,
      });

      const result = await chat.sendMessage(userQuery);
      const replyText = result.response.text();
      return {
        success: true,
        reply: replyText,
        source: "gemini",
      };
    } catch (geminiError) {
      console.error("Gemini API call encountered an error. Falling back gracefully...", geminiError.message);
      // Fall through to other options without throwing
    }
  }

  // 4. Try OpenAI API if key exists
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log("Attempting live OpenAI API completions...");
      const filteredMessages = messages.filter((msg) => msg.id !== "msg-welcome");
      const historyMessages = filteredMessages.slice(0, -1);
      
      const openAiMessages = [
        { role: "system", content: systemInstruction },
        ...historyMessages.map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text,
        })),
        { role: "user", content: userQuery },
      ];

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: openAiMessages,
          temperature: 0.7,
          max_tokens: 400,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const replyText = response.data.choices[0].message.content;
      return {
        success: true,
        reply: replyText,
        source: "openai",
      };
    } catch (openAiError) {
      console.error("OpenAI API call encountered an error. Falling back gracefully...", openAiError.message);
    }
  }

  // 5. Smart Offline Fallback Mode (Runs if keys are missing OR if LLM API calls throw errors)
  try {
    console.log("Using intelligent context-aware offline search engine...");
    const lower = userQuery.toLowerCase();
    
    // Find context (previous product keyword) from message history
    let contextKeyword = "";
    const userMessages = messages.filter((m) => m.sender === "user");
    // Get previous queries
    for (let i = userMessages.length - 2; i >= 0; i--) {
      const prevText = userMessages[i].text.toLowerCase();
      // Common product types
      const commonNouns = ["shoe", "sneaker", "shirt", "jeans", "denim", "watch", "hoodie", "jacket", "dress", "t-shirt", "wallet", "handbag", "cap", "backpack", "earbud", "headphone", "speaker", "webcam", "keyboard", "mouse", "monitor", "tv", "charger", "quinoa", "honey", "oil", "oats", "matcha", "coffee", "yogurt", "cheese", "butter", "milk", "egg", "potato", "onion", "noodle", "spinach", "broccoli", "tomato", "cucumber", "fruit", "vegetable"];
      const matchedNoun = commonNouns.find((n) => prevText.includes(n));
      if (matchedNoun) {
        contextKeyword = matchedNoun;
        break;
      }
    }

    // Parse current search keywords and modifiers
    const productNouns = ["shoe", "sneaker", "shirt", "jeans", "denim", "watch", "hoodie", "jacket", "dress", "t-shirt", "wallet", "handbag", "cap", "backpack", "earbud", "headphone", "speaker", "webcam", "keyboard", "mouse", "monitor", "tv", "charger", "quinoa", "honey", "oil", "oats", "matcha", "coffee", "yogurt", "cheese", "butter", "milk", "egg", "potato", "onion", "noodle", "spinach", "broccoli", "tomato", "cucumber", "fruit", "vegetable"];
    const queryKeyword = productNouns.find((n) => lower.includes(n));
    // Use current search query keyword, fallback to conversation history context keyword
    const activeKeyword = queryKeyword || contextKeyword;

    // Parse color
    const colorsList = ["black", "white", "blue", "red", "grey", "gray", "green", "yellow", "pink", "brown", "aloe", "lavender", "orange", "citrus", "eucalyptus"];
    const queryColor = colorsList.find((c) => lower.includes(c)) || "";

    // Parse size
    let querySize = "";
    const sizeWords = ["s", "m", "l", "xl", "xxl"];
    if (sizeWords.includes(lower)) {
      querySize = lower.toUpperCase();
    } else {
      const sizeMatch = lower.match(/\b(size\s+)?([6789]|10|11)\b/);
      if (sizeMatch) {
        querySize = sizeMatch[2];
      }
    }

    // Parse price limits
    let maxPriceLimit = null;
    const priceMatch = lower.match(/(under|below|less than|max|budget of)\s*(?:₹|rs\.?)?\s*([0-9]+)/i) || 
                       lower.match(/(?:₹|rs\.?)?\s*([0-9]+)\s*(?:budget|limit)/i) || 
                       lower.match(/under\s*([0-9]+)/i);
    if (priceMatch) {
      maxPriceLimit = parseInt(priceMatch[2] || priceMatch[1], 10);
    }

    // Parse gender & occasion
    let queryGender = "";
    if (lower.includes("men") || lower.includes("man") || lower.includes("boy")) queryGender = "men";
    else if (lower.includes("women") || lower.includes("woman") || lower.includes("girl") || lower.includes("lady")) queryGender = "women";

    let queryOccasion = "";
    const occasionsList = ["casual", "formal", "party", "sports", "office", "wedding"];
    queryOccasion = occasionsList.find((o) => lower.includes(o)) || "";
    if (lower.includes("office") || lower.includes("work")) queryOccasion = "formal";
    if (lower.includes("wedding") || lower.includes("marriage")) queryOccasion = "party";

    // Filtering inventory based on parsed inputs
    let searchMatches = formattedProducts;

    if (activeKeyword) {
      const keywordSynonyms = activeKeyword === "shoe" || activeKeyword === "sneaker" 
        ? ["shoe", "sneaker", "footwear"] 
        : activeKeyword === "shirt" || activeKeyword === "t-shirt" 
        ? ["shirt", "t-shirt", "top"] 
        : activeKeyword === "jeans" || activeKeyword === "denim" 
        ? ["jeans", "denim", "pant"] 
        : [activeKeyword];

      searchMatches = searchMatches.filter((p) =>
        keywordSynonyms.some((word) =>
          p.name.toLowerCase().includes(word) ||
          p.description.toLowerCase().includes(word) ||
          p.category.toLowerCase().includes(word)
        )
      );
    }

    if (queryColor) {
      searchMatches = searchMatches.filter((p) =>
        p.name.toLowerCase().includes(queryColor) ||
        p.description.toLowerCase().includes(queryColor)
      );
    }

    if (querySize) {
      searchMatches = searchMatches.filter((p) =>
        p.name.toLowerCase().includes(querySize.toLowerCase()) ||
        p.description.toLowerCase().includes(querySize.toLowerCase()) ||
        p.category.toLowerCase().includes("fashion") ||
        p.category.toLowerCase().includes("men fashion")
      );
    }

    if (maxPriceLimit) {
      searchMatches = searchMatches.filter((p) => p.price <= maxPriceLimit);
    }

    if (queryGender) {
      searchMatches = searchMatches.filter((p) =>
        p.name.toLowerCase().includes(queryGender) ||
        p.description.toLowerCase().includes(queryGender) ||
        p.category.toLowerCase().includes(queryGender)
      );
    }

    if (queryOccasion) {
      searchMatches = searchMatches.filter((p) =>
        p.name.toLowerCase().includes(queryOccasion) ||
        p.description.toLowerCase().includes(queryOccasion)
      );
    }

    // Handlers for specific intents
    let reply = "";
    let matchedIds = [];

    const isTrending = lower.includes("trending") || lower.includes("best") || lower.includes("popular");
    const isNew = lower.includes("new arrival") || lower.includes("newest") || lower.includes("latest");
    const isOffers = lower.includes("offer") || lower.includes("deal") || lower.includes("discount") || lower.includes("coupon") || lower.includes("promo");
    const isGifts = lower.includes("gift");

    if (isNew) {
      const newArrivals = formattedProducts.filter((p) => p.isNewArrival);
      reply = "Here are the freshest new arrivals just added to Praveen Stores! Check them out:";
      matchedIds = newArrivals.slice(0, 6).map((p) => p.id);
    } else if (isTrending) {
      const bestSellers = formattedProducts.filter((p) => p.isBestSeller);
      reply = "These are our current trending best-sellers! Customers are absolutely loving them:";
      matchedIds = bestSellers.slice(0, 6).map((p) => p.id);
    } else if (isOffers) {
      const discountItems = formattedProducts.filter((p) => p.discount > 0);
      reply = "We have got some premium discounts running today! Plus, you can use coupon code **OCEAN20** for an extra 20% off, or **PRAVEEN10** for 10% off at checkout. Here are today's top deals:";
      matchedIds = discountItems.slice(0, 6).map((p) => p.id);
    } else if (isGifts) {
      const giftItems = formattedProducts.filter(
        (p) => 
          ["Personal Care", "Home Essentials", "Health & Wellness", "Fashion", "Electronics Accessories"].includes(p.category) && 
          p.rating >= 4.7
      );
      reply = "Looking for the perfect gift? Here are some of our highest-rated premium items, beautifully packaged and perfect for showing appreciation:";
      matchedIds = giftItems.slice(0, 6).map((p) => p.id);
    } else if (lower.includes("shipping") || lower.includes("delivery") || lower.includes("transit") || lower.includes("ship")) {
      reply = "Praveen Stores offers fast express shipping across India. All orders are packed in secure, premium packaging. Delivery typically takes 2-4 business days. You can track your shipment live on the Orders page in your Profile dashboard.";
    } else if (lower.includes("return") || lower.includes("refund") || lower.includes("cancel") || lower.includes("exchange")) {
      reply = "We offer a hassle-free, no-questions-asked 15-day return policy on all products. If you wish to cancel or return an item, simply request it from the 'My Orders' section in your Profile dashboard. Refunds are processed immediately once the item is picked up.";
    } else if (lower.includes("loyalty") || lower.includes("points") || lower.includes("reward")) {
      reply = "Our loyalty rewards program gives you points on every purchase! You earn 1 point for every ₹10 spent, and 10 points equals ₹1 of discount. By default, your account starts with a balance of 150 points (worth ₹15), which you can redeem easily at checkout. Check your Profile page to view your balance.";
    } else if (lower.includes("contact") || lower.includes("phone") || lower.includes("email") || lower.includes("support") || lower.includes("address") || lower.includes("location") || lower.includes("office")) {
      reply = "Our corporate office is located in Visakhapatnam, Andhra Pradesh, India. You can reach our 24/7 customer service helpline at **+91 9052339291** or via email at **d.praveen2026@gmail.com**. We are always happy to assist you!";
    } else if (lower.includes("checkout") || lower.includes("pay") || lower.includes("cart") || lower.includes("buy")) {
      reply = "You can view your shopping cart by clicking the Cart icon in the top navigation bar. When you are ready, click 'Proceed to Checkout' to complete your order securely using Razorpay.";
    } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey") || lower.includes("greetings")) {
      reply = "👋 Hello! I am Marina AI, your personal shopping advisor. How can I help you today? You can search for products (e.g., 'black shoes under ₹2000'), ask about our delivery terms, or view our best deals!";
    } else {
      // General product matching response
      if (searchMatches.length > 0) {
        let criteriaList = [];
        if (queryGender) criteriaList.push(queryGender);
        if (queryOccasion) criteriaList.push(queryOccasion);
        if (queryColor) criteriaList.push(queryColor);
        if (querySize) criteriaList.push(`size ${querySize}`);
        if (activeKeyword) criteriaList.push(activeKeyword);
        if (maxPriceLimit) criteriaList.push(`under ₹${maxPriceLimit}`);

        const criteriaStr = criteriaList.join(" ");
        reply = `I found these matching ${criteriaStr || "premium products"} in our inventory for you. If you have any questions about their sizes, materials, or availability, just ask!`;
        matchedIds = searchMatches.slice(0, 6).map((p) => p.id);
      } else {
        // Fallback recommendations if no exact search matches
        reply = `I couldn't find any items directly matching your request for "${userQuery}". However, here are some of our popular products from Praveen Stores that you might love:`;
        matchedIds = formattedProducts.slice(0, 4).map((p) => p.id);
      }
    }

    if (matchedIds.length > 0) {
      reply += ` [PRODUCT_IDS: ${matchedIds.join(", ")}]`;
    }

    return {
      success: true,
      reply: reply,
      source: "offline",
    };
  } catch (offlineError) {
    console.error("Offline search engine failed:", offlineError);
    return {
      success: false,
      reply: "I apologize, but my communication system is experiencing a slight issue. Please try again in a moment.",
    };
  }
};

module.exports = { getAIChatResponse };
