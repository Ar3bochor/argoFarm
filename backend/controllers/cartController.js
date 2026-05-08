// Path: backend/controllers/cartController.js
// Description: Handles cart operations, including viewing 
// the cart, adding items, updating quantities, 
// clearing the cart, and applying or removing coupons.

import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import { ensureProductStock } from "../services/productService.js";

// Populates product details for cart items before sending the response.
const populateCart = (query) => query.populate("items.product", "name price image stock unit isActive");

// Finds the user's cart or creates an empty one if it does not exist.
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// Adds calculated cart totals to the cart response.
const decorateCart = (cart) => {
  const raw = cart.toObject ? cart.toObject({ virtuals: true }) : cart;
  const itemsPrice = raw.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountPrice = raw.coupon?.discount || 0;
  const totalPrice = Math.max(itemsPrice - discountPrice, 0);
  return { ...raw, itemsPrice, discountPrice, totalPrice };
};

/**
 * @desc    Get the authenticated user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = asyncHandler(async (req, res) => {
  const cart = await populateCart(Cart.findOne({ user: req.user._id }));
  res.json(decorateCart(cart || { user: req.user._id, items: [] }));
});

/**
 * @desc    Add a product to the cart
 * @route   POST /api/cart
 * @access  Private
 */
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product id is required");
  }

  const product = await Product.findById(productId);
  ensureProductStock(product, Number(quantity));

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find((item) => item.product.toString() === productId);

  if (existing) {
    const nextQuantity = existing.quantity + Number(quantity);

    ensureProductStock(product, nextQuantity);

    existing.quantity = nextQuantity;
    existing.price = product.discountPrice || product.price;
  } else {
    cart.items.push({
      product: product._id,
      quantity: Number(quantity),
      price: product.discountPrice || product.price,
      name: product.name,
      image: product.image,
      unit: product.unit,
    });
  }

  // Removes any applied coupon because cart contents have changed.
  cart.coupon = undefined;

  await cart.save();

  const populated = await populateCart(Cart.findById(cart._id));
  res.status(201).json(decorateCart(populated));
});

/**
 * @desc    Update the quantity of a cart item
 * @route   PUT /api/cart/:productId
 * @access  Private
 */
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const productId = req.params.productId || req.body.productId;

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((cartItem) => cartItem.product.toString() === productId);

  if (!item) {
    res.status(404);
    throw new Error("Cart item not found");
  }

  if (Number(quantity) <= 0) {
    cart.items = cart.items.filter((cartItem) => cartItem.product.toString() !== productId);
  } else {
    const product = await Product.findById(productId);

    ensureProductStock(product, Number(quantity));

    item.quantity = Number(quantity);
    item.price = product.discountPrice || product.price;
  }

  // Removes any applied coupon because cart totals may have changed.
  cart.coupon = undefined;

  await cart.save();

  const populated = await populateCart(Cart.findById(cart._id));
  res.json(decorateCart(populated));
});

/**
 * @desc    Remove a product from the cart
 * @route   DELETE /api/cart/:productId
 * @access  Private
 */
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);

  cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);

  // Removes any applied coupon because cart contents have changed.
  cart.coupon = undefined;

  await cart.save();

  const populated = await populateCart(Cart.findById(cart._id));
  res.json(decorateCart(populated));
});

/**
 * @desc    Clear all items from the cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);

  cart.items = [];
  cart.coupon = undefined;

  await cart.save();

  res.json(decorateCart(cart));
});

/**
 * @desc    Apply a coupon to the cart
 * @route   POST /api/cart/coupon
 * @access  Private
 */
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const cart = await getOrCreateCart(req.user._id);

  if (!cart.items.length) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  const coupon = await Coupon.findOne({ code: code?.trim().toUpperCase() });

  if (!coupon) {
    res.status(404);
    throw new Error("Invalid coupon code");
  }

  const itemsPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = coupon.calculateDiscount(itemsPrice);

  if (discount <= 0) {
    res.status(400);
    throw new Error("Coupon cannot be applied to this cart");
  }

  cart.coupon = { code: coupon.code, discount, type: coupon.type };

  await cart.save();

  const populated = await populateCart(Cart.findById(cart._id));
  res.json(decorateCart(populated));
});

/**
 * @desc    Remove applied coupon from cart
 * @route   DELETE /api/cart/coupon
 * @access  Private
 */
export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);

  if (!cart.coupon?.code) {
    res.status(400);
    throw new Error("No coupon is currently applied to your cart");
  }

  cart.coupon = undefined;

  await cart.save();

  const populated = await populateCart(Cart.findById(cart._id));
  res.json(decorateCart(populated));
});