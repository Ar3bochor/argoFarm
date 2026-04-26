import { Router } from "express";
import {
  approveReview,
  createReview,
  deleteReview,
  getAllReviews,
  getProductReviews,
  rejectReview,
} from "../controllers/reviewController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

// Public
router.get("/product/:productId", getProductReviews);

// Private — any authenticated user can submit a review
router.post("/", protect, createReview);

// Admin only — must come before /:id wildcards to avoid shadowing
router.get("/",                protect, authorizeRoles("admin"), getAllReviews);
router.put("/:id/approve",     protect, authorizeRoles("admin"), approveReview);
router.put("/:id/reject",      protect, authorizeRoles("admin"), rejectReview);

// Owner or admin
router.delete("/:id",          protect, deleteReview);

export default router;