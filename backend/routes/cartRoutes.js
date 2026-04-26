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

router.use(protect);

router.get("/",                   getCart);
router.post("/",    sanitizeBody, addToCart);
router.delete("/",                clearCart);

router.post("/coupon",            applyCoupon);
router.delete("/coupon",          removeCoupon);

// :productId must come after named paths to avoid conflicts
router.put("/:productId",    sanitizeBody, updateCartItem);
router.delete("/:productId",              removeCartItem);

export default router;