import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { updateProductRating } from "../services/productService.js";
import { requiredFields } from "../utils/validators.js";

export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, status: "approved" })
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .lean();
  res.json(reviews);
});

export const createReview = asyncHandler(async (req, res) => {
  requiredFields(req.body, ["productId", "rating", "comment"]);

  const product = await Product.findById(req.body.productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const order = await Order.findOne({
    user: req.user._id,
    "orderItems.product": req.body.productId,
    status: "delivered",
  });

  if (!order) {
    res.status(403);
    throw new Error("You can review only products from delivered orders");
  }

  const review = await Review.create({
    user: req.user._id,
    product: req.body.productId,
    order: order._id,
    rating: Number(req.body.rating),
    title: req.body.title,
    comment: req.body.comment,
    status: "pending",
  });

  res.status(201).json({ message: "Review submitted for moderation", review });
});

export const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  review.status = "approved";
  review.moderatedBy = req.user._id;
  review.moderatedAt = new Date();
  await review.save();
  await updateProductRating(review.product);

  res.json(review);
});

export const rejectReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  review.status = "rejected";
  review.moderatedBy = req.user._id;
  review.moderatedAt = new Date();
  await review.save();
  await updateProductRating(review.product);

  res.json(review);
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  const productId = review.product;
  if (req.user.role !== "admin" && review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this review");
  }

  await review.deleteOne();
  await updateProductRating(productId);
  res.json({ message: "Review deleted successfully" });
});

export const getAllReviews = asyncHandler(async (req, res) => {
  const filters = req.query.status ? { status: req.query.status } : {};
  const reviews = await Review.find(filters)
    .populate("user", "name email")
    .populate("product", "name image")
    .sort({ createdAt: -1 })
    .lean();
  res.json(reviews);
});
