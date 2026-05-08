// Path: backend/middleware/errorMiddleware.js
// Description: Provides centralized 404 handling and 
// global error formatting for API responses.

// Handles requests that do not match any registered route.
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found — ${req.method} ${req.originalUrl}`);

  res.status(404);
  next(error);
};

// Converts application, Mongoose, JWT, and request errors into consistent JSON responses.
export const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== "test") {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${err.message}`);

    if (process.env.NODE_ENV !== "production") console.error(err.stack);
  }

  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || "Internal Server Error";

  // Handles invalid MongoDB ObjectId values.
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = `Resource not found — invalid ID format`;
  }

  // Handles duplicate unique fields, such as email or coupon code.
  if (err.code === 11000) {
    statusCode = 409;

    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue?.[field];

    message = `${field.charAt(0).toUpperCase() + field.slice(1)} "${value}" already exists`;
  }

  // Handles Mongoose schema validation errors.
  if (err.name === "ValidationError") {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join("; ");
  }

  // Handles JWT authentication errors.
  if (err.name === "JsonWebTokenError")  { statusCode = 401; message = "Invalid token"; }
  if (err.name === "TokenExpiredError")  { statusCode = 401; message = "Token expired — please log in again"; }
  if (err.name === "NotBeforeError")     { statusCode = 401; message = "Token not yet active"; }

  // Handles large request body payloads.
  if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Request payload too large";
  }

  // Handles CORS-related errors.
  if (err.message?.startsWith("CORS policy")) {
    statusCode = 403;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};