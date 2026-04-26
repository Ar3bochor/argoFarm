import asyncHandler from "express-async-handler";
import Coupon from "../models/Coupon.js";
import { requiredFields } from "../utils/validators.js";

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, amount = 0 } = req.body;
  const coupon = await Coupon.findOne({ code: code?.trim().toUpperCase() });
  if (!coupon) {
    res.status(404);
    throw new Error("Invalid coupon code");
  }
  const discount = coupon.calculateDiscount(Number(amount));
  if (discount <= 0) {
    res.status(400);
    throw new Error("Coupon cannot be applied");
  }
  res.json({ code: coupon.code, discount, type: coupon.type });
});

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
  res.json(coupons);
});

export const createCoupon = asyncHandler(async (req, res) => {
  requiredFields(req.body, ["code", "type", "value"]);
  const coupon = await Coupon.create(req.body);
  res.status(201).json(coupon);
});

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

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }
  await coupon.deleteOne();
  res.json({ message: "Coupon deleted successfully" });
});
