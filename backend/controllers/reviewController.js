import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { updateProductRating } from "../services/productService.js";

/**
 * @desc    Get approved reviews for a product
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 */
export const getProductReviews = asyncHandler(async (req, res) => {
  const page  = Math.max(Number(req.query.page)  || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const skip  = (page - 1) * limit;

  const filter = { product: req.params.productId, status: "approved" };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  // Rating distribution (1–5)
  const distribution = await Review.aggregate([
    { $match: filter },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    reviews,
    page,
    pages: Math.ceil(total / limit),
    total,
    ratingDistribution: distribution,
  });
});

/**
 * @desc    Submit a review (only for delivered order items)
 * @route   POST /api/reviews
 * @access  Private
 */
export const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment, title } = req.body;

  if (!productId || !rating || !comment) {
    res.status(400);
    throw new Error("productId, rating, and comment are required");
  }

  if (Number(rating) < 1 || Number(rating) > 5) {
    res.status(400);
    throw new Error("Rating must be between 1 and 5");
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Must have a delivered order containing this product
  const order = await Order.findOne({
    user:               req.user._id,
    "orderItems.product": productId,
    status:             "delivered",
  }).lean();

  if (!order) {
    res.status(403);
    throw new Error("You can only review products from delivered orders");
  }

  // Check for duplicate (one review per user per product)
  const existingReview = await Review.findOne({ user: req.user._id, product: productId });
  if (existingReview) {
    res.status(409);
    throw new Error("You have already reviewed this product");
  }

  const review = await Review.create({
    user:    req.user._id,
    product: productId,
    order:   order._id,
    rating:  Number(rating),
    title:   title?.trim(),
    comment: comment.trim(),
    status:  "pending",
  });

  res.status(201).json({
    success: true,
    message: "Review submitted — it will appear after moderation",
    data: review,
  });
});

/**
 * @desc    Approve a review
 * @route   PUT /api/reviews/:id/approve
 * @access  Admin
 */
export const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  review.status      = "approved";
  review.moderatedBy = req.user._id;
  review.moderatedAt = new Date();
  await review.save();
  await updateProductRating(review.product);

  res.json({ success: true, data: review });
});

/**
 * @desc    Reject a review
 * @route   PUT /api/reviews/:id/reject
 * @access  Admin
 */
export const rejectReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  review.status      = "rejected";
  review.moderatedBy = req.user._id;
  review.moderatedAt = new Date();
  await review.save();
  await updateProductRating(review.product);

  res.json({ success: true, data: review });
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Admin or owner
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  const isOwner = review.user.toString() === req.user._id.toString();
  if (req.user.role !== "admin" && !isOwner) {
    res.status(403);
    throw new Error("Not authorized to delete this review");
  }

  const productId = review.product;
  await review.deleteOne();
  await updateProductRating(productId);

  res.json({ success: true, message: "Review deleted successfully" });
});

/**
 * @desc    Get all reviews (admin: filter by status)
 * @route   GET /api/reviews
 * @access  Admin
 */
export const getAllReviews = asyncHandler(async (req, res) => {
  const page  = Math.max(Number(req.query.page)  || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const skip  = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("user",    "name email")
      .populate("product", "name image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  res.json({
    success: true,
    reviews,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});