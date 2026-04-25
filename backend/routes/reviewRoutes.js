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

router.get("/product/:productId", getProductReviews);
router.post("/", protect, createReview);
router.get("/", protect, authorizeRoles("admin"), getAllReviews);
router.put("/:id/approve", protect, authorizeRoles("admin"), approveReview);
router.put("/:id/reject", protect, authorizeRoles("admin"), rejectReview);
router.delete("/:id", protect, deleteReview);

export default router;
