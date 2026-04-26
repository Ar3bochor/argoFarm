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

router.use(protect);

router.route("/profile")
  .get(getUserProfile)
  .put(sanitizeBody, updateUserProfile);

router.route("/addresses")
  .get(getAddresses)
  .post(sanitizeBody, addAddress);

router.route("/addresses/:id")
  .put(sanitizeBody, updateAddress)
  .delete(deleteAddress);

// NOTE: /orders removed — use GET /api/orders/my instead (includes pagination)

router.delete("/account", deleteAccount);

export default router;