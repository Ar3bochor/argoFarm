// Path: backend/middleware/authMiddleware.js
// Description: Handles JWT authentication, role-based 
// access control, and optional authentication for public 
// routes.

import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// Verifies the JWT token and attaches the authenticated user to req.user.
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
}),

// Restricts access to users whose role matches one of the allowed roles.
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

// Attaches req.user when a valid token exists, but allows the request to continue without authentication.
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) return next();

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password").lean();

    if (user) req.user = user;
  } catch {
    // Invalid or expired tokens are ignored because authentication is optional here.
  }

  next();
};