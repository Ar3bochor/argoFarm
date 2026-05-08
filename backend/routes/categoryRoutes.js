// Path: backend/routes/categoryRoutes.js
// Description: Defines category routes for viewing 
// categories publicly and managing categories through 
// admin-only actions.

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

// Public category routes
router.get("/",    optionalAuth, getCategories);
router.get("/:id", getCategoryById);

// Admin-only category management routes
router.post("/",   protect, authorizeRoles("admin"), sanitizeBody, createCategory);
router.put("/:id", protect, authorizeRoles("admin"), sanitizeBody, updateCategory);
router.delete("/:id", protect, authorizeRoles("admin"), deleteCategory);

export default router;