import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import { ensureProductStock } from "../services/productService.js";

const populateCart = (query) => query.populate("items.product", "name price image stock unit isActive");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

const decorateCart = (cart) => {
  const raw = cart.toObject ? cart.toObject({ virtuals: true }) : cart;
  const itemsPrice = raw.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountPrice = raw.coupon?.discount || 0;
  const totalPrice = Math.max(itemsPrice - discountPrice, 0);
  return { ...raw, itemsPrice, discountPrice, totalPrice };
};

export const getCart = asyncHandler(async (req, res) => {
  const cart = await populateCart(Cart.findOne({ user: req.user._id }));
  res.json(decorateCart(cart || { user: req.user._id, items: [] }));
});

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

  cart.coupon = undefined;
  await cart.save();
  const populated = await populateCart(Cart.findById(cart._id));
  res.status(201).json(decorateCart(populated));
});

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

  cart.coupon = undefined;
  await cart.save();
  const populated = await populateCart(Cart.findById(cart._id));
  res.json(decorateCart(populated));
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
  cart.coupon = undefined;
  await cart.save();
  const populated = await populateCart(Cart.findById(cart._id));
  res.json(decorateCart(populated));
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.coupon = undefined;
  await cart.save();
  res.json(decorateCart(cart));
});

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
