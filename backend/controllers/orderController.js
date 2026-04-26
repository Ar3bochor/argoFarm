import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";
import { buildOrderTotals } from "../services/orderService.js";
import { createPaymentSession, markPaymentAsPaid } from "../services/paymentService.js";
import { ensureProductStock } from "../services/productService.js";

/**
 * Builds orderItems array from the user's active cart,
 * validating stock for each product.
 */
const buildItemsFromCart = async (cart) => {
  if (!cart?.items?.length) {
    const error = new Error("Cart is empty");
    error.statusCode = 400;
    throw error;
  }

  const productIds = cart.items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } }).lean();

  return cart.items.map((item) => {
    const product = products.find((p) => p._id.toString() === item.product.toString());

    if (!product) {
      const error = new Error(`Product no longer available`);
      error.statusCode = 400;
      throw error;
    }

    ensureProductStock(product, item.quantity);

    return {
      product: product._id,
      name:     product.name,
      quantity: item.quantity,
      qty:      item.quantity,
      price:    product.discountPrice || product.price,
      image:    product.image,
      unit:     product.unit,
      farmer:   product.farmer,
    };
  });
};

/**
 * Resolves shipping address from addressId or inline body.
 */
const resolveAddress = (body, user) => {
  if (body.addressId) {
    const address = user.addresses?.find((a) => a._id.toString() === body.addressId);
    if (!address) {
      const error = new Error("Saved address not found");
      error.statusCode = 404;
      throw error;
    }
    const { _id, createdAt, updatedAt, ...rest } = address.toObject ? address.toObject() : address;
    return rest;
  }

  const addr = body.shippingAddress || body.address || body;

  if (!addr.address || !addr.city) {
    const error = new Error("Shipping address and city are required");
    error.statusCode = 400;
    throw error;
  }

  return {
    fullName:   addr.fullName   || user.name,
    phone:      addr.phone      || user.phone,
    address:    addr.address,
    city:       addr.city,
    district:   addr.district   || "",
    postalCode: addr.postalCode || "",
    country:    addr.country    || "Bangladesh",
  };
};

/**
 * @desc    Get order summary (prices, taxes, shipping) before placing
 * @route   POST /api/orders/summary
 * @access  Private
 */
export const getOrderSummary = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  const items = await buildItemsFromCart(cart);
  const couponCode = req.body.couponCode || cart?.coupon?.code;
  const totals = await buildOrderTotals({ items, couponCode });

  res.json({
    success: true,
    data: {
      items,
      deliverySlot: req.body.deliverySlot,
      paymentMethod: req.body.paymentMethod || "COD",
      ...totals,
      coupon: totals.coupon
        ? { code: totals.coupon.code, discount: totals.discountPrice }
        : null,
    },
  });
});

/**
 * @desc    Place a new order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res) => {
  // Fetch full user for address resolution
  const user = await User.findById(req.user._id);

  const cart = await Cart.findOne({ user: req.user._id });

  // Always build order items from the authenticated user's cart. This prevents
  // client-side price/quantity tampering during checkout.
  const orderItems = await buildItemsFromCart(cart);

  const shippingAddress = resolveAddress(req.body, user);
  const couponCode = req.body.couponCode || cart?.coupon?.code;
  const totals = await buildOrderTotals({ items: orderItems, couponCode });

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    deliverySlot:   req.body.deliverySlot,
    paymentMethod:  req.body.paymentMethod || "COD",
    coupon: totals.coupon
      ? { code: totals.coupon.code, discount: totals.discountPrice }
      : undefined,
    itemsPrice:    totals.itemsPrice,
    taxPrice:      totals.taxPrice,
    shippingPrice: totals.shippingPrice,
    discountPrice: totals.discountPrice,
    totalPrice:    totals.totalPrice,
  });

  // Decrement stock and increment sold for each item
  const stockUpdates = orderItems.map((item) =>
    Product.findByIdAndUpdate(item.product, {
      $inc: {
        stock: -Number(item.quantity || item.qty),
        sold:  +Number(item.quantity || item.qty),
      },
    })
  );

  // Increment coupon usage
  const couponUpdate = totals.coupon
    ? Coupon.findByIdAndUpdate(totals.coupon._id, { $inc: { usedCount: 1 } })
    : Promise.resolve();

  // Clear cart
  const cartClear = cart
    ? (cart.items = [], cart.coupon = undefined, cart.save())
    : Promise.resolve();

  await Promise.all([...stockUpdates, couponUpdate, cartClear]);

  const paymentSession = await createPaymentSession({
    order,
    gateway: order.paymentMethod,
    customer: req.user,
  });

  res.status(201).json({ success: true, data: { order, paymentSession } });
});

/**
 * @desc    Get current user's orders
 * @route   GET /api/orders/my
 * @access  Private
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("orderItems.product", "name image price")
      .lean(),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.json({
    success: true,
    orders,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  });
});


/**
 * @desc    Get orders that contain the authenticated farmer's products
 * @route   GET /api/orders/farmer
 * @access  Farmer / Admin
 */
export const getFarmerOrders = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = { "orderItems.farmer": req.user._id };
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

  const farmerId = req.user._id.toString();
  const scopedOrders = orders.map((order) => ({
    ...order,
    orderItems: order.orderItems.filter((item) => item.farmer?.toString() === farmerId),
  }));

  res.json({
    success: true,
    orders: scopedOrders,
    page,
    pages: Math.ceil(total / limit) || 1,
    total,
  });
});

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private (owner or admin)
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email phone")
    .populate("orderItems.product", "name image price")
    .lean();

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }

  res.json({ success: true, data: order });
});

/**
 * @desc    Track order status and history
 * @route   GET /api/orders/:id/track
 * @access  Private (owner or admin)
 */
export const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .select("status statusHistory deliverySlot isPaid isDelivered createdAt updatedAt user")
    .lean();

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to track this order");
  }

  res.json({ success: true, data: order });
});

/**
 * @desc    Add previous order items back to cart (reorder)
 * @route   POST /api/orders/:id/reorder
 * @access  Private (owner only)
 */
export const reorder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).lean();

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to reorder this order");
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const productIds = order.orderItems.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } }).lean();

  let skipped = 0;
  for (const orderItem of order.orderItems) {
    const product = products.find((p) => p._id.toString() === orderItem.product.toString());

    if (!product || !product.isActive || product.stock < 1) {
      skipped++;
      continue;
    }

    const qty = orderItem.quantity || orderItem.qty || 1;
    const existing = cart.items.find((i) => i.product.toString() === product._id.toString());

    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, product.stock);
    } else {
      cart.items.push({
        product:  product._id,
        quantity: Math.min(qty, product.stock),
        price:    product.discountPrice || product.price,
        name:     product.name,
        image:    product.image,
        unit:     product.unit,
      });
    }
  }

  cart.coupon = undefined;
  await cart.save();

  res.json({
    success: true,
    message: skipped
      ? `${order.orderItems.length - skipped} item(s) added to cart. ${skipped} unavailable item(s) were skipped.`
      : "All items added to cart",
  });
});

/**
 * @desc    Update order status (admin only)
 * @route   PUT /api/orders/:id/status
 * @access  Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  if (!status) {
    res.status(400);
    throw new Error("Status is required");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const previousStatus = order.status;

  // Prevent illegal status transitions
  if (order.status === "cancelled" && status !== "cancelled") {
    res.status(400);
    throw new Error("Cannot change status of a cancelled order");
  }

  if (order.status === "delivered" && status !== "delivered") {
    res.status(400);
    throw new Error("Cannot change status of a delivered order");
  }

  order.status = status;
  order.statusHistory.push({
    status,
    note: note || `Status changed from ${previousStatus} to ${status}`,
    updatedBy: req.user._id,
  });

  if (status === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  // Restore stock if cancelling
  if (status === "cancelled" && previousStatus !== "cancelled") {
    const stockRestores = order.orderItems.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: +Number(item.quantity || item.qty),
          sold:  -Number(item.quantity || item.qty),
        },
      })
    );
    await Promise.all(stockRestores);
  }

  const updated = await order.save();
  res.json({ success: true, data: updated });
});

/**
 * @desc    Mark order as paid
 * @route   PUT /api/orders/:id/pay
 * @access  Admin
 */
export const markOrderPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error("Order is already marked as paid");
  }

  markPaymentAsPaid(order, req.body.paymentResult);
  const updated = await order.save();

  res.json({ success: true, data: updated });
});