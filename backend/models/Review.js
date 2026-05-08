// Path: backend/models/Review.js
// Description: Mongoose model for storing customer product 
// reviews, including ratings, comments, moderation status, 
// and review ownership.

import mongoose from "mongoose";
import { REVIEW_STATUS } from "../utils/constants.js";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    // Links the review to the order to confirm the user purchased the product.
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    comment: { type: String, required: true, trim: true },

    // Reviews can be approved, rejected, or kept pending depending on moderation.
    status: {
      type: String,
      enum: REVIEW_STATUS,
      default: "pending",
      index: true,
    },

    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    moderatedAt: Date,
  },
  { timestamps: true }
);

// Prevents the same user from reviewing the same product more than once.
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);