// Path: backend/routes/authRoutes.js
// Description: Defines authentication routes 
// for registration, login, logout, profile access, 
// and password updates.

import { Router } from "express";
import {
  registerUser,
  loginUser,
  getMe,
  updatePassword,
  logoutUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { sanitizeBody } from "../middleware/validateMiddleware.js";

const router = Router();

// Public authentication routes
router.post("/register", sanitizeBody, registerUser);
router.post("/login",    sanitizeBody, loginUser);

// Protected logout route
router.post("/logout",   protect, logoutUser);

// Protected user account routes
router.get("/me",                protect, getMe);
router.put("/update-password",   protect, sanitizeBody, updatePassword);

export default router;