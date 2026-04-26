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

router.use(protect);

router.post("/summary",     sanitizeBody, getOrderSummary);
router.post("/",            sanitizeBody, createOrder);
router.get("/my",           getMyOrders);

router.get("/:id",          getOrderById);
router.get("/:id/track",    trackOrder);
router.post("/:id/reorder", reorder);

// Admin only
router.put("/:id/pay", authorizeRoles("admin"), sanitizeBody, markOrderPaid);

// NOTE: PUT /:id/status removed — use PUT /api/admin/orders/:id/status instead
// to keep admin-only order-status management in a single canonical location.

export default router;