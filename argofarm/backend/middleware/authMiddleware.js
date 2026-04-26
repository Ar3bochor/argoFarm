import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

/**
 * PROTECT — verifies JWT and attaches req.user
 * Supports Bearer token in Authorization header.
 */
export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized — no token provided");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    res.status(401);
    if (err.name === "TokenExpiredError") {
      throw new Error("Session expired — please log in again");
    }
    throw new Error("Not authorized — invalid token");
  }

  const user = await User.findById(decoded.id).select("-password").lean();

  if (!user) {
    res.status(401);
    throw new Error("Not authorized — account no longer exists");
  }

  req.user = user;
  next();
});

/**
 * AUTHORIZE ROLES — must be used after protect()
 * Usage: authorizeRoles("admin") or authorizeRoles("admin", "farmer")
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authenticated");
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Access denied — requires one of: [${roles.join(", ")}]. Your role: ${req.user.role}`
      );
    }

    next();
  };
};

/**
 * OPTIONAL AUTH — attaches req.user if a valid token is present, but does NOT block
 * Useful for public endpoints that behave differently for logged-in users.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return next();

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password").lean();
    if (user) req.user = user;
  } catch {
    // Silently ignore invalid/expired tokens for optional auth
  }
  next();
};