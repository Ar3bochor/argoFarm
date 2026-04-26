import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import Category from "../models/Category.js";

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/dashboard
 * @access  Admin
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    newUsersThisMonth,
    totalProducts,
    outOfStockProducts,
    totalCategories,
    totalOrders,
    pendingOrders,
    pendingReviews,
    revenueAgg,
    revenueThisMonth,
  ] = await Promise.all([
    User.countDocuments({ role: { $ne: "admin" } }),
    User.countDocuments({ role: { $ne: "admin" }, createdAt: { $gte: thirtyDaysAgo } }),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, stock: 0 }),
    Category.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.countDocuments({ status: "pending" }),
    Review.countDocuments({ status: "pending" }),
    Order.aggregate([
      { $match: { status: { $nin: ["cancelled"] } } },
      { $group: { _id: null, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate([
      {
        $match: {
          status: { $nin: ["cancelled"] },
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      { $group: { _id: null, revenue: { $sum: "$totalPrice" } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      users:              { total: totalUsers, newThisMonth: newUsersThisMonth },
      products:           { total: totalProducts, outOfStock: outOfStockProducts },
      categories:         totalCategories,
      orders:             { total: totalOrders, pending: pendingOrders },
      pendingReviews,
      revenue: {
        total:        revenueAgg[0]?.revenue    || 0,
        thisMonth:    revenueThisMonth[0]?.revenue || 0,
      },
    },
  });
});

/**
 * @desc    Get all orders with pagination
 * @route   GET /api/admin/orders
 * @access  Admin
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const page  = Math.max(Number(req.query.page)  || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const skip  = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    orders,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

/**
 * @desc    Get sales and revenue report
 * @route   GET /api/admin/reports/sales
 * @access  Admin
 */
export const getSalesReport = asyncHandler(async (req, res) => {
  const start = req.query.startDate
    ? new Date(req.query.startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const end = req.query.endDate ? new Date(req.query.endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  if (start > end) {
    res.status(400);
    throw new Error("startDate must be before endDate");
  }

  const matchBase = {
    createdAt: { $gte: start, $lte: end },
    status: { $nin: ["cancelled"] },
  };

  const [dailyReport, topProducts, categoryRevenue, paymentMethods] = await Promise.all([
    // Daily breakdown
    Order.aggregate([
      { $match: matchBase },
      {
        $group: {
          _id:       { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders:    { $sum: 1 },
          revenue:   { $sum: "$totalPrice" },
          itemsSold: { $sum: { $sum: "$orderItems.quantity" } },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Top 10 products by revenue
    Order.aggregate([
      { $match: matchBase },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id:      "$orderItems.product",
          name:     { $first: "$orderItems.name" },
          quantity: { $sum: "$orderItems.quantity" },
          revenue:  { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]),

    // Revenue by category
    Order.aggregate([
      { $match: matchBase },
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from:         "products",
          localField:   "orderItems.product",
          foreignField: "_id",
          as:           "productInfo",
        },
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmpty: false } },
      {
        $lookup: {
          from:         "categories",
          localField:   "productInfo.category",
          foreignField: "_id",
          as:           "categoryInfo",
        },
      },
      { $unwind: { path: "$categoryInfo", preserveNullAndEmpty: false } },
      {
        $group: {
          _id:     "$categoryInfo._id",
          name:    { $first: "$categoryInfo.name" },
          revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
    ]),

    // Revenue by payment method
    Order.aggregate([
      { $match: matchBase },
      {
        $group: {
          _id:     "$paymentMethod",
          orders:  { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { revenue: -1 } },
    ]),
  ]);

  const totalRevenue = dailyReport.reduce((s, d) => s + d.revenue, 0);
  const totalOrders  = dailyReport.reduce((s, d) => s + d.orders, 0);

  res.json({
    success: true,
    data: {
      period:         { startDate: start, endDate: end },
      summary:        { totalRevenue, totalOrders, averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0 },
      dailyReport,
      topProducts,
      categoryRevenue,
      paymentMethods,
    },
  });
});

/**
 * @desc    Get all users with pagination
 * @route   GET /api/admin/users
 * @access  Admin
 */
export const getUsers = asyncHandler(async (req, res) => {
  const page  = Math.max(Number(req.query.page)  || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const skip  = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name:  { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    users,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

/**
 * @desc    Update user role or status (admin only)
 * @route   PUT /api/admin/users/:id
 * @access  Admin
 */
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Prevent admin from editing themselves
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("Cannot modify your own admin account through this endpoint");
  }

  if (req.body.role) user.role = req.body.role;
  if (req.body.name) user.name = req.body.name;

  const updated = await user.save();
  res.json({
    success: true,
    data: {
      _id:   updated._id,
      name:  updated.name,
      email: updated.email,
      role:  updated.role,
    },
  });
});

/**
 * @desc    Delete a user account (admin only)
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    res.status(400);
    throw new Error("Cannot delete an admin account");
  }

  await user.deleteOne();
  res.json({ success: true, message: "User deleted successfully" });
});