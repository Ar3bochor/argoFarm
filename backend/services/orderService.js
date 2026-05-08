// Path: backend/services/orderService.js
// Description: Provides order pricing helpers for item 
// totals, shipping, tax, coupon discounts, and 
// final checkout totals.

import Coupon from "../models/Coupon.js";

// Rounds money values to two decimal places.
export const roundMoney = (value) => Number((Number(value) || 0).toFixed(2));

// Calculates the subtotal from all order items before tax, shipping, and discounts.
export const calculateItemsPrice = (items) =>
  roundMoney(items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity || item.qty || 1), 0));

// Calculates shipping cost based on the order subtotal.
export const calculateShippingPrice = (itemsPrice) => (itemsPrice >= 1000 ? 0 : 60);

// Calculates tax based on the discounted item subtotal.
export const calculateTaxPrice = (itemsPrice) => roundMoney(itemsPrice * 0.02);

// Finds and validates a coupon, then calculates the discount for the given subtotal.
export const resolveCouponDiscount = async (code, itemsPrice) => {
  if (!code) return { coupon: null, discountPrice: 0 };

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

  if (!coupon) throw new Error("Invalid coupon code");

  const discountPrice = coupon.calculateDiscount(itemsPrice);

  if (discountPrice <= 0) throw new Error("Coupon cannot be applied to this order");

  return { coupon, discountPrice };
};

// Builds the final order totals used during checkout and order creation.
export const buildOrderTotals = async ({ items, couponCode }) => {
  const itemsPrice = calculateItemsPrice(items);
  const { coupon, discountPrice } = await resolveCouponDiscount(couponCode, itemsPrice);
  const taxPrice = calculateTaxPrice(itemsPrice - discountPrice);
  const shippingPrice = calculateShippingPrice(itemsPrice - discountPrice);
  const totalPrice = roundMoney(itemsPrice + taxPrice + shippingPrice - discountPrice);

  return {
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountPrice,
    totalPrice,
    coupon,
  };
};