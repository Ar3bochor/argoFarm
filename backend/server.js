// Path: backend/server.js
// Description: Main Express server file that 
// configures middleware, connects the database, 
// registers API routes, handles errors, and 
// starts the server.

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Security middleware for safer API requests.
app.use(helmet());
app.use(mongoSanitize());

// Compresses API responses to improve performance.
app.use(compression());

// Parses incoming JSON and form data.
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Allowed frontend origins for browser-based API requests.
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  process.env.CLIENT_URL  || "http://localhost:5173",
];

// Configures CORS access for the frontend and authenticated requests.
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS policy: origin ${origin} is not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Logs API requests outside the test environment.
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// Applies a global rate limit to all API routes.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

app.use("/api", globalLimiter);

// Applies a stricter rate limit to authentication routes.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many login attempts, please try again in 15 minutes." },
});

// Root endpoint for confirming the API is running.
app.get("/", (req, res) => {
  res.json({ message: "ArgoFarm API is running 🌾", version: "1.0.0" });
});

// Health check endpoint for monitoring server status.
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

// Authentication routes for registration, login, logout, profile access, and password updates.
app.use("/api/auth",       authLimiter, authRoutes);

// User routes for profile management, saved addresses, and account deletion.
app.use("/api/users",      userRoutes);

// Product routes for public product browsing and admin/farmer product management.
app.use("/api/products",   productRoutes);

// Category routes for viewing and managing product categories.
app.use("/api/categories", categoryRoutes);

// Cart routes for managing cart items and applying or removing coupons.
app.use("/api/cart",       cartRoutes);

// Order routes for checkout, order history, tracking, reordering, and payment updates.
app.use("/api/orders",     orderRoutes);

// Review routes for product reviews, review submission, moderation, and deletion.
app.use("/api/reviews",    reviewRoutes);

// Admin routes for dashboard stats, user management, order management, and reports.
app.use("/api/admin",      adminRoutes);

// Coupon routes for validating coupons and admin coupon management.
app.use("/api/coupons",    couponRoutes);

// Handles unknown routes and forwards errors to the global error handler.
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🌾 ArgoFarm server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}\n`);
});

// Gracefully closes the HTTP server when the process receives a shutdown signal.
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

// Closes the server if an unhandled promise rejection occurs.
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err.message);
  server.close(() => process.exit(1));
});

export default app;