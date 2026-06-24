const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const Product = require("../models/Product");
const Category = require("../models/Category");


// Lazy-load Gemini client to prevent order-of-import environment variable issues
let genAI = null;
const getGenAIInstance = () => {
  if (genAI) return genAI;
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI;
  }
  return null;
};


/**
 * Handle chat completion using live LLMs (Gemini/OpenAI) or a smart offline catalog search
 */
const getAIChatResponse = async (messages, userQuery) => {
  try {
    // 1. Fetch current product catalog for context
    const products = await Product.find().populate("category");
    const formattedProducts = products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      category: p.category ? p.category.name : "Uncategorized",
      price: p.price,
      stock: p.stock,
      rating: p.rating,
      description: p.description,
    }));

    // 2. Build system instruction
    const systemInstruction = `You are "Marina", the warm, ocean-inspired AI Shopping Assistant for "Praveen Stores" (a premium MERN e-commerce supermarket and lifestyle store). 
Praveen Stores offers high-quality items in categories like Groceries, Beverages, Snacks, Fruits, Vegetables, Dairy Products, Personal Care, Home Essentials, Cleaning Products, Kitchen Items, Electronics Accessories, and Health & Wellness.

Your Guidelines:
1. Speak with a helpful, friendly, and subtle coastal/ocean-inspired tone (e.g., use words like waves, currents, floating, deep ocean, tidal, drift, ripple, shore, breeze).
2. Answer customer questions about products, store policies, orders, loyalty rewards, or discounts.
3. Recommend specific products from the inventory context below.
4. CRITICAL: If you recommend or reference any products from the inventory, you MUST append a tag at the very end of your response in the EXACT format: [PRODUCT_IDS: id1, id2, ...] (comma-separated database IDs of the recommended products). Example: "Here are some fresh fruits: [PRODUCT_IDS: 60a12c3f4e12, 60a12c3f4e13]". Do NOT make up IDs. Only use IDs from the context below.
5. If the user asks about deals or coupons, mention:
   - "OCEAN20" (20% off)
   - "PRAVEEN10" (10% off)
6. If the user asks about order tracking or loyalty rewards, explain that they can view their status in their Profile page.
7. Keep responses concise, helpful, and under 150 words.

Product Catalog Inventory:
${JSON.stringify(formattedProducts, null, 2)}
`;

    // 3. Try Gemini API first if key exists
    const activeGenAI = getGenAIInstance();
    if (activeGenAI) {
      console.log("Using live Google Gemini API...");
      const model = activeGenAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: systemInstruction,
      });

      // Map chat history to Gemini format (roles: user, model)
      const geminiHistory = messages
        .filter((msg) => msg.id !== "msg-welcome") // skip welcome message
        .map((msg) => ({
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
    }

    // 4. Try OpenAI API if key exists (using raw axios call to avoid extra package imports)
    if (process.env.OPENAI_API_KEY) {
      console.log("Using live OpenAI API...");
      const openAiMessages = [
        { role: "system", content: systemInstruction },
        ...messages
          .filter((msg) => msg.id !== "msg-welcome")
          .map((msg) => ({
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
    }

    // 5. Smart Offline Fallback Mode
    console.log("Using intelligent offline RAG search (No API keys found)...");
    const lower = userQuery.toLowerCase();
    let replyText = "";
    let matchedIds = [];

    if (lower.includes("all products") || lower.includes("show all") || lower.includes("catalog")) {
      replyText = "Tidal waves incoming! Here are some of our premium products floating in our catalog. To unlock live conversational AI responses, please add a `GEMINI_API_KEY` to the `Backend/.env` file.";
      matchedIds = formattedProducts.slice(0, 4).map((p) => p.id);
    } else if (lower.includes("coupon") || lower.includes("discount") || lower.includes("promo") || lower.includes("deal")) {
      replyText = "Tidal discounts are flowing at Praveen Stores! You can use these promo codes at checkout:\n\n• **OCEAN20**: Get 20% off your total purchase!\n• **PRAVEEN10**: Get 10% off your order!\n\n(Setup `GEMINI_API_KEY` in `Backend/.env` to chat live with AI!)";
    } else if (lower.includes("loyalty") || lower.includes("points") || lower.includes("reward")) {
      replyText = "Praveen Stores rewards every purchase! You start with 150 points. You earn points on orders, and can redeem them at checkout for discount value (10 points = ₹1 off). Check your profile panel to view your current status. (Setup `GEMINI_API_KEY` in `Backend/.env` to chat live with AI!)";
    } else if (lower.includes("order") || lower.includes("track") || lower.includes("ship")) {
      replyText = "To check your order progress, log in and head to your Profile dashboard or click 'My Orders' in the navigation bar. Your items are tracked in real-time.";
    } else {
      // Find matching items by keyword in name, category, or description
      const terms = lower.split(" ");
      const matches = formattedProducts.filter((p) =>
        terms.some(
          (t) =>
            p.name.toLowerCase().includes(t) ||
            p.category.toLowerCase().includes(t) ||
            p.description.toLowerCase().includes(t)
        )
      );

      if (matches.length > 0) {
        replyText = `I filtered the waves and found these matching products for "${userQuery}". (Setup a ` + "`GEMINI_API_KEY` in Backend/.env for a fully conversational AI experience!)";
        matchedIds = matches.slice(0, 4).map((p) => p.id);
      } else {
        replyText = `I hear your ripple, but I couldn't find anything specific for "${userQuery}". I am a shopping chatbot, trained on our product catalog. Try searching for products like "rice", "coffee", "soap", or browse our listings! (Setup a ` + "`GEMINI_API_KEY` in Backend/.env to chat live with AI!)";
      }
    }

    if (matchedIds.length > 0) {
      replyText += ` [PRODUCT_IDS: ${matchedIds.join(", ")}]`;
    }

    return {
      success: true,
      reply: replyText,
      source: "offline",
    };
  } catch (error) {
    console.error("AI Completion Error:", error);
    let errorDetails = error.message;
    if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith("AIzaSy") && !process.env.GEMINI_API_KEY.startsWith("AQ.")) {
      errorDetails += " (Tip: Your GEMINI_API_KEY does not start with standard 'AIzaSy' or 'AQ.' prefixes. Please check if you generated it correctly from Google AI Studio at https://aistudio.google.com/)";
    }
    return {
      success: false,
      reply: "Oops, my circuits drifted offline. Please try casting your net again! (Error details: " + errorDetails + ")",
    };
  }
};

module.exports = { getAIChatResponse };

