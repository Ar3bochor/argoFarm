import asyncHandler from "express-async-handler";
import {
  register,
  login,
  changePassword,
} from "../services/authService.js";

// REGISTER
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const user = await register({ name, email, password, role });

  res.status(201).json(user);
});

// LOGIN
export const loginUser = asyncHandler(async (req, res) => {
  const user = await login(req.body);
  res.json(user);
});

// GET CURRENT USER
export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// UPDATE PASSWORD
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const result = await changePassword(
    req.user._id,
    currentPassword,
    newPassword
  );

  res.json(result);
});