import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import Category from "../models/Category.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [users, products, categories, orders, pendingReviews, revenueAgg] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Product.countDocuments(),
    Category.countDocuments(),
    Order.countDocuments(),
    Review.countDocuments({ status: "pending" }),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    users,
    products,
    categories,
    orders,
    pendingReviews,
    revenue: revenueAgg[0]?.revenue || 0,
  });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email phone")
    .sort({ createdAt: -1 })
    .lean();
  res.json(orders);
});

export const getSalesReport = asyncHandler(async (req, res) => {
  const start = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = req.query.endDate ? new Date(req.query.endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  const report = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: "cancelled" } } },
    { $addFields: { itemsSoldInOrder: { $sum: "$orderItems.quantity" } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        orders: { $sum: 1 },
        revenue: { $sum: "$totalPrice" },
        itemsSold: { $sum: "$itemsSoldInOrder" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const topProducts = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: "cancelled" } } },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.product",
        name: { $first: "$orderItems.name" },
        quantity: { $sum: "$orderItems.quantity" },
        revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
  ]);

  res.json({ startDate: start, endDate: end, report, topProducts });
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 }).lean();
  res.json(users);
});
