import { Router } from "express";
import {
  addAddress,
  deleteAddress,
  deleteUser,
  getAddresses,
  getMyOrders,
  getUserProfile,
  updateAddress,
  updateUserProfile,
} from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);
router.route("/addresses").get(protect, getAddresses).post(protect, addAddress);
router.route("/addresses/:id").put(protect, updateAddress).delete(protect, deleteAddress);
router.get("/orders", protect, getMyOrders);
router.delete("/account", protect, deleteUser);

router.get("/admin-only", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Admin access granted" });
});

router.get("/farmer-only", protect, authorizeRoles("farmer"), (req, res) => {
  res.json({ message: "Farmer access granted" });
});

export default router;
