// Path: backend/controllers/couponController.js
// Description: Handles coupon validation and 
// admin coupon management, including creating, updating, 
// listing, and deleting coupons.

import asyncHandler from "express-async-handler";
import Coupon from "../models/Coupon.js";
import { requiredFields } from "../utils/validators.js";

/**
 * @desc    Validate a coupon against an order amount
 * @route   POST /api/coupons/validate
 * @access  Private
 */
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, amount = 0 } = req.body;

  // Finds the coupon using a normalized uppercase code.
  const coupon = await Coupon.findOne({ code: code?.trim().toUpperCase() });

  if (!coupon) {
    res.status(404);
    throw new Error("Invalid coupon code");
  }

  // Calculates the discount based on coupon rules and order amount.
  const discount = coupon.calculateDiscount(Number(amount));

  if (discount <= 0) {
    res.status(400);
    throw new Error("Coupon cannot be applied");
  }

  res.json({ code: coupon.code, discount, type: coupon.type });
});

/**
 * @desc    Get all coupons
 * @route   GET /api/coupons
 * @access  Admin
 */
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();

  res.json(coupons);
});

/**
 * @desc    Create a new coupon
 * @route   POST /api/coupons
 * @access  Admin
 */
export const createCoupon = asyncHandler(async (req, res) => {
  // Ensures all required coupon fields are provided before creation.
  requiredFields(req.body, ["code", "type", "value"]);

  const coupon = await Coupon.create(req.body);

  res.status(201).json(coupon);
});

/**
 * @desc    Update an existing coupon
 * @route   PUT /api/coupons/:id
 * @access  Admin
 */
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  res.json(coupon);
});

/**
 * @desc    Delete a coupon
 * @route   DELETE /api/coupons/:id
 * @access  Admin
 */
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  await coupon.deleteOne();

  res.json({ message: "Coupon deleted successfully" });
});