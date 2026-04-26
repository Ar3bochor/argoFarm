import { Router } from "express";
import {
  getDashboardStats,
  getAllOrders,
  getSalesReport,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/adminController.js";
import { updateOrderStatus } from "../controllers/orderController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, authorizeRoles("admin"));

// Dashboard
router.get("/dashboard",         getDashboardStats);

// Users
router.get("/users",             getUsers);
router.put("/users/:id",         updateUser);
router.delete("/users/:id",      deleteUser);

// Orders — updateOrderStatus lives here only (removed from orderRoutes)
router.get("/orders",            getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

// Reports
router.get("/reports/sales",     getSalesReport);

// NOTE: Review routes removed from here — they are fully managed via
// /api/reviews (reviewRoutes.js) which already enforces admin-only guards
// on approve / reject / getAllReviews. Keeping them in one place avoids
// duplicate route registrations.

export default router;