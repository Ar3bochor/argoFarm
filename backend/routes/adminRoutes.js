import { Router } from "express";
import { getAllOrders, getDashboardStats, getSalesReport, getUsers } from "../controllers/adminController.js";
import { updateOrderStatus } from "../controllers/orderController.js";
import { approveReview, deleteReview, getAllReviews, rejectReview } from "../controllers/reviewController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, authorizeRoles("admin"));
router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);
router.get("/reports/sales", getSalesReport);
router.get("/reviews", getAllReviews);
router.put("/reviews/:id/approve", approveReview);
router.put("/reviews/:id/reject", rejectReview);
router.delete("/reviews/:id", deleteReview);

export default router;
