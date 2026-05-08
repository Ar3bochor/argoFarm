// Path: backend/routes/adminRoutes.js
// Description: Defines admin-only routes 
// for dashboard statistics, user management, 
// order management, and sales reports.

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

// All admin routes require authentication and admin role access.
router.use(protect, authorizeRoles("admin"));

// Dashboard route
router.get("/dashboard",         getDashboardStats);

// User management routes
router.get("/users",             getUsers);
router.put("/users/:id",         updateUser);
router.delete("/users/:id",      deleteUser);

// Order management routes
router.get("/orders",            getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

// Sales report route
router.get("/reports/sales",     getSalesReport);

export default router;