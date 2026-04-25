import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/categoryController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", protect, authorizeRoles("admin"), createCategory);
router.put("/:id", protect, authorizeRoles("admin"), updateCategory);
router.delete("/:id", protect, authorizeRoles("admin"), deleteCategory);

export default router;
