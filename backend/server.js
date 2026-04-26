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

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());                         // Sets secure HTTP headers
app.use(mongoSanitize());                  // Prevents NoSQL injection (strips $ and . from inputs)

// ─── Performance ───────────────────────────────────────────────────────────
app.use(compression());                    // Gzip all responses

// ─── Request Parsing ───────────────────────────────────────────────────────
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// ─── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  process.env.CLIENT_URL  || "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, mobile apps, etc.)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS policy: origin ${origin} is not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Request Logging ───────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ─── Global Rate Limiter ───────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", globalLimiter);

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many login attempts, please try again in 15 minutes." },
});

// ─── Health / Root ─────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "ArgoFarm API is running 🌾", version: "1.0.0" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

// ─── Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",       authLimiter, authRoutes);
app.use("/api/users",      userRoutes);
app.use("/api/products",   productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart",       cartRoutes);
app.use("/api/orders",     orderRoutes);
app.use("/api/reviews",    reviewRoutes);
app.use("/api/admin",      adminRoutes);
app.use("/api/coupons",    couponRoutes);

// ─── Error Handling ────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🌾 ArgoFarm server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}\n`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

// Catch unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err.message);
  server.close(() => process.exit(1));
});

export default app;