import { Router } from "express";
import {
  createProduct,
  deactivateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/productController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:id", getProductById);
router.post("/", protect, authorizeRoles("admin", "farmer"), createProduct);
router.put("/:id", protect, authorizeRoles("admin", "farmer"), updateProduct);
router.patch("/:id/deactivate", protect, authorizeRoles("admin"), deactivateProduct);
router.delete("/:id", protect, authorizeRoles("admin"), deleteProduct);

export default router;
