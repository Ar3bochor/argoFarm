import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import { buildOrderTotals } from "../services/orderService.js";
import { createPaymentSession, markPaymentAsPaid } from "../services/paymentService.js";
import { ensureProductStock } from "../services/productService.js";
import { requiredFields } from "../utils/validators.js";

const buildItemsFromCart = async (cart) => {
  if (!cart || !cart.items.length) throw new Error("Cart is empty");

  const productIds = cart.items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });

  return cart.items.map((item) => {
    const product = products.find((p) => p._id.toString() === item.product.toString());
    ensureProductStock(product, item.quantity);
    return {
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      qty: item.quantity,
      price: product.discountPrice || product.price,
      image: product.image,
      unit: product.unit,
      farmer: product.farmer,
    };
  });
};

const normalizeAddress = (body, user) => {
  if (body.addressId) {
    const address = user.addresses.id(body.addressId);
    if (!address) throw new Error("Address not found");
    return address.toObject();
  }
  const address = body.shippingAddress || body.address || body;
  requiredFields(address, ["address", "city"]);
  return {
    fullName: address.fullName || user.name,
    phone: address.phone || user.phone,
    address: address.address,
    city: address.city,
    district: address.district,
    postalCode: address.postalCode,
    country: address.country || "Bangladesh",
  };
};

export const getOrderSummary = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  const items = await buildItemsFromCart(cart);
  const couponCode = req.body.couponCode || cart?.coupon?.code;
  const totals = await buildOrderTotals({ items, couponCode });

  res.json({
    items,
    deliverySlot: req.body.deliverySlot,
    paymentMethod: req.body.paymentMethod || "COD",
    ...totals,
    coupon: totals.coupon ? { code: totals.coupon.code, discount: totals.discountPrice } : null,
  });
});

export const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  const orderItems = req.body.orderItems?.length ? req.body.orderItems : await buildItemsFromCart(cart);
  const shippingAddress = normalizeAddress(req.body, req.user);
  const couponCode = req.body.couponCode || cart?.coupon?.code;
  const totals = await buildOrderTotals({ items: orderItems, couponCode });

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    deliverySlot: req.body.deliverySlot,
    paymentMethod: req.body.paymentMethod || "COD",
    coupon: totals.coupon ? { code: totals.coupon.code, discount: totals.discountPrice } : undefined,
    itemsPrice: totals.itemsPrice,
    taxPrice: totals.taxPrice,
    shippingPrice: totals.shippingPrice,
    discountPrice: totals.discountPrice,
    totalPrice: totals.totalPrice,
  });

  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -Number(item.quantity || item.qty), sold: Number(item.quantity || item.qty) },
    });
  }

  if (totals.coupon) {
    await Coupon.findByIdAndUpdate(totals.coupon._id, { $inc: { usedCount: 1 } });
  }

  if (cart) {
    cart.items = [];
    cart.coupon = undefined;
    await cart.save();
  }

  const paymentSession = await createPaymentSession({ order, gateway: order.paymentMethod, customer: req.user });
  res.status(201).json({ order, paymentSession });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("orderItems.product", "name image price")
    .lean();
  res.json(orders);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email phone")
    .populate("orderItems.product", "name image price")
    .lean();

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }

  res.json(order);
});

export const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).select("status statusHistory deliverySlot isPaid isDelivered createdAt updatedAt user").lean();
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to track this order");
  }
  res.json(order);
});

export const reorder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
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

  for (const orderItem of order.orderItems) {
    const product = await Product.findById(orderItem.product);
    ensureProductStock(product, 1);
    const existing = cart.items.find((item) => item.product.toString() === product._id.toString());
    if (existing) existing.quantity += orderItem.quantity || orderItem.qty || 1;
    else {
      cart.items.push({
        product: product._id,
        quantity: orderItem.quantity || orderItem.qty || 1,
        price: product.discountPrice || product.price,
        name: product.name,
        image: product.image,
        unit: product.unit,
      });
    }
  }

  cart.coupon = undefined;
  await cart.save();
  res.json({ message: "Previous order items added to cart", cart });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status || order.status;
  order.statusHistory.push({ status: order.status, note, updatedBy: req.user._id });
  if (order.status === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }
  if (order.status === "cancelled") {
    order.statusHistory.push({ status: "cancelled", note: note || "Order cancelled", updatedBy: req.user._id });
  }

  const updated = await order.save();
  res.json(updated);
});

export const markOrderPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  markPaymentAsPaid(order, req.body.paymentResult);
  const updated = await order.save();
  res.json(updated);
});
