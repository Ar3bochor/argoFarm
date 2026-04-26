import asyncHandler from "express-async-handler";
import { register, login, changePassword } from "../services/authService.js";

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  // Prevent self-elevation to admin through the public endpoint
  const safeRole = role === "admin" ? "user" : (role || "user");

  const user = await register({ name, email, password, role: safeRole, phone });

  res.status(201).json({ success: true, data: user });
});

/**
 * @desc    Authenticate user and return token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const user = await login(req.body);
  res.json({ success: true, data: user });
});

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("currentPassword and newPassword are required");
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters");
  }

  if (currentPassword === newPassword) {
    res.status(400);
    throw new Error("New password must be different from current password");
  }

  const result = await changePassword(req.user._id, currentPassword, newPassword);
  res.json({ success: true, ...result });
});

/**
 * @desc    Logout (client-side token removal; stub for server-side blacklist)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logoutUser = asyncHandler(async (req, res) => {
  // If you later add a token blacklist (e.g., Redis), invalidate here.
  res.json({ success: true, message: "Logged out successfully" });
});