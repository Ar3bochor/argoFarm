import Coupon from "../models/Coupon.js";

export const roundMoney = (value) => Number((Number(value) || 0).toFixed(2));

export const calculateItemsPrice = (items) =>
  roundMoney(items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity || item.qty || 1), 0));

export const calculateShippingPrice = (itemsPrice) => (itemsPrice >= 1000 ? 0 : 60);

export const calculateTaxPrice = (itemsPrice) => roundMoney(itemsPrice * 0.02);

export const resolveCouponDiscount = async (code, itemsPrice) => {
  if (!code) return { coupon: null, discountPrice: 0 };

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) throw new Error("Invalid coupon code");

  const discountPrice = coupon.calculateDiscount(itemsPrice);
  if (discountPrice <= 0) throw new Error("Coupon cannot be applied to this order");

  return { coupon, discountPrice };
};

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
