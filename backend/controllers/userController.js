import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Order from "../models/Order.js";

export const getUserProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = req.body.name ?? user.name;
  user.email = req.body.email ?? user.email;
  user.phone = req.body.phone ?? user.phone;

  const updated = await user.save();
  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    phone: updated.phone,
    addresses: updated.addresses,
  });
});

export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("addresses");
  res.json(user.addresses);
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (req.body.isDefault) {
    user.addresses.forEach((address) => {
      address.isDefault = false;
    });
  }

  user.addresses.push({
    label: req.body.label,
    fullName: req.body.fullName || user.name,
    phone: req.body.phone || user.phone,
    address: req.body.address,
    city: req.body.city,
    district: req.body.district,
    postalCode: req.body.postalCode,
    country: req.body.country || "Bangladesh",
    isDefault: req.body.isDefault || user.addresses.length === 0,
  });

  await user.save();
  res.status(201).json(user.addresses);
});

export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.id);
  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  if (req.body.isDefault) {
    user.addresses.forEach((item) => {
      item.isDefault = false;
    });
  }

  Object.assign(address, req.body);
  await user.save();
  res.json(user.addresses);
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((addr) => addr._id.toString() !== req.params.id);
  await user.save();
  res.json(user.addresses);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

export const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ message: "User deleted" });
});
