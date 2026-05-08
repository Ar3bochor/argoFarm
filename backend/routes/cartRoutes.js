// Path: backend/routes/cartRoutes.js
// Description: Defines protected cart routes for 
// viewing, adding, updating, clearing cart items, 
// and managing coupons.

import { Router } from "express";
import {
  addToCart,
  applyCoupon,
  clearCart,
  getCart,
  removeCartItem,
  removeCoupon,
  updateCartItem,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";
import { sanitizeBody } from "../middleware/validateMiddleware.js";

const router = Router();

// All cart routes require the user to be authenticated.
router.use(protect);

// Cart item routes
router.get("/",                   getCart);
router.post("/",    sanitizeBody, addToCart);
router.delete("/",                clearCart);

// Coupon routes
router.post("/coupon",            applyCoupon);
router.delete("/coupon",          removeCoupon);

// Routes for updating or removing a specific product from the cart.
router.put("/:productId",    sanitizeBody, updateCartItem);
router.delete("/:productId",              removeCartItem);

export default router;