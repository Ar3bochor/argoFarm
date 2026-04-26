/**
 * 404 handler — must be placed after all routes
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found — ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler — must be placed last in middleware chain
 * Handles Mongoose errors, JWT errors, and application errors uniformly.
 */
export const errorHandler = (err, req, res, next) => {
  // Log in non-test environments
  if (process.env.NODE_ENV !== "test") {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${err.message}`);
    if (process.env.NODE_ENV !== "production") console.error(err.stack);
  }

  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || "Internal Server Error";

  // ── Mongoose: bad ObjectId ─────────────────────────────────────────────
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = `Resource not found — invalid ID format`;
  }

  // ── Mongoose: duplicate key ────────────────────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue?.[field];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} "${value}" already exists`;
  }

  // ── Mongoose: validation error ─────────────────────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join("; ");
  }

  // ── JWT errors ─────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError")  { statusCode = 401; message = "Invalid token"; }
  if (err.name === "TokenExpiredError")  { statusCode = 401; message = "Token expired — please log in again"; }
  if (err.name === "NotBeforeError")     { statusCode = 401; message = "Token not yet active"; }

  // ── Payload too large ──────────────────────────────────────────────────
  if (err.type === "entity.too.large") { statusCode = 413; message = "Request payload too large"; }

  // ── CORS ───────────────────────────────────────────────────────────────
  if (err.message?.startsWith("CORS policy")) { statusCode = 403; }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};