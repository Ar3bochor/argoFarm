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

router.post("/register", sanitizeBody, registerUser);
router.post("/login",    sanitizeBody, loginUser);
router.post("/logout",   protect, logoutUser);

router.get("/me",                protect, getMe);
router.put("/update-password",   protect, sanitizeBody, updatePassword);

export default router;