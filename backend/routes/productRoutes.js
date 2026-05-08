// Path: backend/routes/productRoutes.js
// Description: Defines product routes for browsing 
// products publicly and managing product records through 
// admin or farmer access.

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

// Public product browsing routes
router.get("/",                 getProducts);
router.get("/featured",         getFeaturedProducts);
router.get("/:id",              getProductById);
router.get("/:id/related",      getRelatedProducts);

// Admins and farmers can create new products.
router.post(
  "/",
  protect,
  authorizeRoles("admin", "farmer"),
  sanitizeBody,
  createProduct
);

// Admins and farmers can update existing products.
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "farmer"),
  sanitizeBody,
  updateProduct
);

// Admin-only route for deactivating a product.
router.patch(
  "/:id/deactivate",
  protect,
  authorizeRoles("admin"),
  deactivateProduct
);

// Admin-only route for reactivating a product.
router.patch(
  "/:id/activate",
  protect,
  authorizeRoles("admin"),
  activateProduct
);

// Admin-only route for deleting a product.
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteProduct
);

export default router;