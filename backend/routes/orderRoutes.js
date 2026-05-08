// Path: backend/routes/orderRoutes.js
// Description: Defines protected order routes 
// for creating orders, viewing user orders, 
// tracking orders, reordering, and marking payments.

import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderSummary,
  markOrderPaid,
  reorder,
  trackOrder,
} from "../controllers/orderController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { sanitizeBody } from "../middleware/validateMiddleware.js";

const router = Router();

// All order routes require the user to be authenticated.
router.use(protect);

// Order creation and summary routes
router.post("/summary",     sanitizeBody, getOrderSummary);
router.post("/",            sanitizeBody, createOrder);

// User order history route
router.get("/my",           getMyOrders);

// Single order routes
router.get("/:id",          getOrderById);
router.get("/:id/track",    trackOrder);
router.post("/:id/reorder", reorder);

// Admin route for marking an order as paid.
router.put("/:id/pay", authorizeRoles("admin"), sanitizeBody, markOrderPaid);

export default router;