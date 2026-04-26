import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/categoryController.js";
import { protect, authorizeRoles, optionalAuth } from "../middleware/authMiddleware.js";
import { sanitizeBody } from "../middleware/validateMiddleware.js";

const router = Router();

router.get("/",    optionalAuth, getCategories);   // optionalAuth to allow admin to see inactive
router.get("/:id", getCategoryById);

router.post("/",   protect, authorizeRoles("admin"), sanitizeBody, createCategory);
router.put("/:id", protect, authorizeRoles("admin"), sanitizeBody, updateCategory);
router.delete("/:id", protect, authorizeRoles("admin"), deleteCategory);

export default router;