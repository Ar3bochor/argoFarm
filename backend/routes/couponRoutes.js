// Path: backend/routes/couponRoutes.js
// Description: Defines coupon routes for validating coupons 
// and managing coupon records through admin-only actions.

import { Router } from "express";
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
  validateCoupon,
} from "../controllers/couponController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { sanitizeBody } from "../middleware/validateMiddleware.js";

const router = Router();

// Authenticated users can validate coupons during checkout.
router.post("/validate", protect, sanitizeBody, validateCoupon);

// Admin-only coupon management routes
router.get("/",      protect, authorizeRoles("admin"), getCoupons);
router.post("/",     protect, authorizeRoles("admin"), sanitizeBody, createCoupon);
router.put("/:id",   protect, authorizeRoles("admin"), sanitizeBody, updateCoupon);
router.delete("/:id", protect, authorizeRoles("admin"), deleteCoupon);

export default router;