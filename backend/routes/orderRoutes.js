import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderSummary,
  markOrderPaid,
  reorder,
  trackOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.post("/summary", getOrderSummary);
router.post("/", createOrder);
router.get("/my", getMyOrders);
router.get("/:id", getOrderById);
router.get("/:id/track", trackOrder);
router.post("/:id/reorder", reorder);
router.put("/:id/pay", authorizeRoles("admin"), markOrderPaid);
router.put("/:id/status", authorizeRoles("admin"), updateOrderStatus);

export default router;
