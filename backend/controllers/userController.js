// Path: backend/controllers/userController.js
// Description: Handles authenticated user profile actions, 
// saved delivery addresses, and account deletion.

import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Order from "../models/Order.js";

/**
 * @desc    Get authenticated user's profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  // req.user is attached by the authentication middleware.
  res.json({ success: true, data: req.user });
});

/**
 * @desc    Update authenticated user's profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Updates only the fields provided in the request body.
  user.name  = req.body.name  ?? user.name;
  user.email = req.body.email ?? user.email;
  user.phone = req.body.phone ?? user.phone;

  const updated = await user.save();

  res.json({
    success: true,
    data: {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone,
      addresses: updated.addresses,
    },
  });
});

/**
 * @desc    Get authenticated user's saved addresses
 * @route   GET /api/users/addresses
 * @access  Private
 */
export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("addresses");

  res.json({ success: true, data: user.addresses });
});

/**
 * @desc    Add a new address
 * @route   POST /api/users/addresses
 * @access  Private
 */
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // If the new address is marked as default, remove default status from other addresses.
  if (req.body.isDefault) {
    user.addresses.forEach((address) => {
      address.isDefault = false;
    });
  }

  // Uses profile details as fallback values when address contact details are not provided.
  user.addresses.push({
    label:      req.body.label,
    fullName:   req.body.fullName || user.name,
    phone:      req.body.phone    || user.phone,
    address:    req.body.address,
    city:       req.body.city,
    district:   req.body.district,
    postalCode: req.body.postalCode,
    country:    req.body.country || "Bangladesh",
    isDefault:  req.body.isDefault || user.addresses.length === 0,
  });

  await user.save();

  res.status(201).json({ success: true, data: user.addresses });
});

/**
 * @desc    Update a saved address
 * @route   PUT /api/users/addresses/:id
 * @access  Private
 */
export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.id);

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  // Keeps only one address marked as default.
  if (req.body.isDefault) {
    user.addresses.forEach((item) => {
      item.isDefault = false;
    });
  }

  Object.assign(address, req.body);

  await user.save();

  res.json({ success: true, data: user.addresses });
});

/**
 * @desc    Delete a saved address
 * @route   DELETE /api/users/addresses/:id
 * @access  Private
 */
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.addresses = user.addresses.filter((addr) => addr._id.toString() !== req.params.id);

  await user.save();

  res.json({ success: true, data: user.addresses });
});

/**
 * @desc    Delete authenticated user's account
 * @route   DELETE /api/users/account
 * @access  Private
 */
export const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);

  res.json({ message: "User deleted" });
});