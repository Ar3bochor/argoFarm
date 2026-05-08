// Path: backend/models/Coupon.js
// Description: Mongoose model for creating and 
// validating discount coupons with fixed or 
// percentage-based discounts.

import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    description: String,

    // Coupon can either reduce by percentage or by a fixed amount.
    type: {
      type: String,
      enum: ["percent", "fixed"],
      required: true,
    },

    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, min: 0 },

    // Controls how many times this coupon can be used overall.
    usageLimit: { type: Number, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },

    expiresAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Calculates the discount amount after checking coupon status, expiry, limit, and order amount.
couponSchema.methods.calculateDiscount = function (amount) {
  if (!this.isActive) return 0;
  if (this.expiresAt && this.expiresAt < new Date()) return 0;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return 0;
  if (amount < this.minOrderAmount) return 0;

  let discount = this.type === "percent" ? (amount * this.value) / 100 : this.value;

  // Applies the maximum discount limit if one is set.
  if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);

  // Ensures the discount never becomes greater than the order amount.
  return Math.min(Number(discount.toFixed(2)), amount);
};

export default mongoose.model("Coupon", couponSchema);