// Path: backend/routes/reviewRoutes.js
// Description: Defines review routes for viewing 
// product reviews, submitting reviews, moderating reviews, 
// and deleting reviews.

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

// Public route for viewing reviews of a specific product.
router.get("/product/:productId", getProductReviews);

// Authenticated users can submit product reviews.
router.post("/", protect, createReview);

// Admin-only review management routes.
router.get("/",                protect, authorizeRoles("admin"), getAllReviews);
router.put("/:id/approve",     protect, authorizeRoles("admin"), approveReview);
router.put("/:id/reject",      protect, authorizeRoles("admin"), rejectReview);

// Review owners or admins can delete reviews.
router.delete("/:id",          protect, deleteReview);

export default router;