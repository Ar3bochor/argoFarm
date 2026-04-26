import { Router } from "express";
import {
  createProduct,
  deactivateProduct,
  activateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductById,
  getProducts,
  getRelatedProducts,
  updateProduct,
} from "../controllers/productController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { sanitizeBody } from "../middleware/validateMiddleware.js";

const router = Router();

// Public
router.get("/",                 getProducts);
router.get("/featured",         getFeaturedProducts);
router.get("/:id",              getProductById);
router.get("/:id/related",      getRelatedProducts);

// Admin / Farmer
router.post(
  "/",
  protect,
  authorizeRoles("admin", "farmer"),
  sanitizeBody,
  createProduct
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "farmer"),
  sanitizeBody,
  updateProduct
);

router.patch(
  "/:id/deactivate",
  protect,
  authorizeRoles("admin", "farmer"),
  deactivateProduct
);

router.patch(
  "/:id/activate",
  protect,
  authorizeRoles("admin", "farmer"),
  activateProduct
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteProduct
);

export default router;