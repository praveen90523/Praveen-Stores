require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authroutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const subscriberRoutes = require("./routes/subscriberRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();


// ========================
// Connect Database
// ========================
connectDB();

// ========================
// Security Middleware
// ========================
app.use(helmet());

// ========================
// Body Parser
// MUST BE BEFORE ROUTES
// ========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================
// CORS
// ========================
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

// ========================
// Rate Limiter
// ========================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message:
      "Too many requests from this IP. Please try again after 15 minutes.",
  },
});

app.use("/api", apiLimiter);

// ========================
// API Routes
// ========================
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);


// ========================
// Root Route
// ========================
app.get("/", (req, res) => {
  res.send("Praveen Stores API Running...");
});

// ========================
// Global Error Handler
// ========================
app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ========================
// Start Server
// ========================
const PORT = process.env.PORT || 5000;

// Start server listener
app.listen(PORT, () => {
  console.log(`🚀 Server Running on Port ${PORT} successfully`);
});
