// Path: backend/routes/userRoutes.js
// Description: Defines protected user routes for 
// profile management, saved addresses, and 
// account deletion.

import { Router } from "express";
import {
  addAddress,
  deleteAccount,
  deleteAddress,
  getAddresses,
  getUserProfile,
  updateAddress,
  updateUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { sanitizeBody } from "../middleware/validateMiddleware.js";

const router = Router();

// All user account routes require authentication.
router.use(protect);

// User profile routes
router.route("/profile")
  .get(getUserProfile)
  .put(sanitizeBody, updateUserProfile);

// Saved address routes
router.route("/addresses")
  .get(getAddresses)
  .post(sanitizeBody, addAddress);

// Single address update and delete routes
router.route("/addresses/:id")
  .put(sanitizeBody, updateAddress)
  .delete(deleteAddress);

// Account deletion route
router.delete("/account", deleteAccount);

export default router;