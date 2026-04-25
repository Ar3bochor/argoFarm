import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  addAddress,
  deleteAddress,
  getMyOrders,
  deleteUser
} from "../controllers/userController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

// 👤 Profile
router.route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// 📍 Address
router.post("/address", protect, addAddress);
router.delete("/address/:id", protect, deleteAddress);

// 📦 Orders
router.get("/orders", protect, getMyOrders);

// ❌ Delete account
router.delete("/account", protect, deleteUser);

// 🛠️ Admin-only example
router.get("/admin-only", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Admin access granted" });
});

// 🌾 Farmer-only example
router.get("/farmer-only", protect, authorizeRoles("farmer"), (req, res) => {
  res.json({ message: "Farmer access granted" });
});

export default router;