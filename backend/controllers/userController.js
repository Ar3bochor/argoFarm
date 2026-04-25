import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Order from "../models/Order.js";

// 👤 Get Profile
export const getUserProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// ✏️ Update Profile
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;

  const updated = await user.save();
  res.json(updated);
});

// 📍 ADD ADDRESS  ✅ (THIS WAS MISSING OR WRONG)
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.addresses = user.addresses || [];

  user.addresses.push({
    address: req.body.address,
    city: req.body.city,
    postalCode: req.body.postalCode,
  });

  await user.save();

  res.json(user.addresses);
});

// ❌ DELETE ADDRESS
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.addresses = user.addresses.filter(
    (addr) => addr._id.toString() !== req.params.id
  );

  await user.save();

  res.json(user.addresses);
});

// 📦 GET ORDERS
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// ❌ DELETE USER
export const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ message: "User deleted" });
});