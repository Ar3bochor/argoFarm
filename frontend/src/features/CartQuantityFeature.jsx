/**
 * ══════════════════════════════════════════════════════════════════════════════
 * FEATURE: Cart Quantity Update
 * ──────────────────────────────────────────────────────────────────────────────
 * Functionality: The user should be able to update product quantity in the cart.
 *
 * This module provides:
 *  - A complete cart item list with inline quantity controls (+/-)
 *  - Direct quantity input (type a number to set exact quantity)
 *  - Line item subtotal calculation (price × quantity)
 *  - Remove item button per product
 *  - Clear entire cart button
 *  - Order summary sidebar with subtotal, discount, and total
 *  - Coupon code application
 *  - Checkout navigation
 *
 * Usage:
 *   import CartQuantityFeature from "../features/CartQuantityFeature";
 *   <CartQuantityFeature />
 *
 * Dependencies: useCart() hook from CartContext
 * ══════════════════════════════════════════════════════════════════════════════
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import useCart from "../hooks/useCart";
import { currency, productImage } from "../utils/helpers";

/**
 * CartItemRow — renders a single cart item with quantity controls
 *
 * Props:
 *   item       – { product, name, image, unit, price, quantity }
 *   onUpdate   – (productId, newQuantity) => void
 *   onRemove   – (productId) => void
 */
export function CartItemRow({ item, onUpdate, onRemove }) {
  const product = item.product || item;
  const productId = product._id || item.product;

  return (
    <div className="rounded-3xl bg-white p-4 shadow-card ring-1 ring-slate-100 sm:flex sm:items-center sm:gap-5">
      {/* Product image */}
      <img
        src={productImage(product)}
        alt={item.name || product.name}
        className="h-32 w-full rounded-2xl object-cover sm:w-36"
      />

      <div className="mt-4 flex-1 sm:mt-0">
        {/* Name & unit price */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              to={`/products/${productId}`}
              className="text-lg font-black text-slate-950 hover:text-leaf-700"
            >
              {item.name || product.name}
            </Link>
            <p className="mt-1 text-sm text-slate-400">
              Unit: {item.unit || product.unit || "item"}
            </p>
          </div>
          <p className="text-xl font-black text-leaf-700">{currency(item.price)}</p>
        </div>

        {/* Quantity controls + line total + remove */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {/* +/- quantity buttons */}
          <div className="flex overflow-hidden rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => onUpdate(productId, Math.max(1, item.quantity - 1))}
              className="px-4 py-2 font-black transition-colors hover:bg-slate-50"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              value={item.quantity}
              onChange={(e) =>
                onUpdate(productId, Math.max(1, Number(e.target.value) || 1))
              }
              className="w-14 border-x border-slate-100 text-center font-black outline-none"
              aria-label="Quantity"
            />
            <button
              type="button"
              onClick={() => onUpdate(productId, item.quantity + 1)}
              className="px-4 py-2 font-black transition-colors hover:bg-slate-50"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Line total */}
            <p className="font-black text-slate-900">
              {currency(item.price * item.quantity)}
            </p>
            {/* Remove */}
            <button
              type="button"
              onClick={() => onRemove(productId)}
              className="font-bold text-rose-500 hover:text-rose-700"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * OrderSummary — sidebar showing price breakdown and coupon
 *
 * Props:
 *   cart – the cart object from CartContext { itemsPrice, discountPrice, totalPrice }
 */
export function OrderSummary({ cart }) {
  const { applyCouponCode } = useCart();
  const [coupon, setCoupon] = useState("");
  const [message, setMessage] = useState("");

  const applyCoupon = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await applyCouponCode(coupon);
      setMessage("Coupon applied successfully.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Invalid coupon code");
    }
  };

  return (
    <aside className="h-fit rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-100 lg:sticky lg:top-28">
      <h2 className="text-2xl font-black text-slate-950">Order summary</h2>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-bold text-slate-900">
            {currency(cart.itemsPrice)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Discount</span>
          <span className="font-bold text-leaf-700">
            − {currency(cart.discountPrice)}
          </span>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-3 text-lg">
          <span className="font-black text-slate-950">Total</span>
          <span className="font-black text-leaf-700">
            {currency(cart.totalPrice)}
          </span>
        </div>
      </div>

      {/* Coupon form */}
      <form onSubmit={applyCoupon} className="mt-6 flex gap-2">
        <input
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          className="field"
          placeholder="Coupon code"
        />
        <button type="submit" className="btn-outline">
          Apply
        </button>
      </form>
      {message && (
        <p className="mt-3 rounded-2xl bg-leaf-50 p-3 text-sm font-bold text-leaf-700">
          {message}
        </p>
      )}

      <Link
        to="/checkout"
        className="btn-primary mt-6 w-full justify-center py-4"
      >
        Proceed to checkout
      </Link>
      <Link
        to="/products"
        className="mt-3 block text-center text-sm font-bold text-slate-500 hover:text-leaf-700"
      >
        Continue shopping
      </Link>
    </aside>
  );
}

/**
 * CartQuantityFeature — the main export combining cart items + summary
 *
 * This is a self-contained feature that reads from CartContext
 * and provides the full cart management UI.
 */
export default function CartQuantityFeature() {
  const { cart, updateItem, removeItem, clear } = useCart();
  const items = cart?.items || [];

  if (!items.length) {
    return (
      <EmptyState
        icon="🛒"
        title="Your cart is empty"
        message="Add fresh agricultural products to start checkout."
        actionLabel="Browse products"
        actionTo="/products"
      />
    );
  }

  return (
    <>
      {/* Header with clear button */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Cart</p>
          <h1 className="page-title">Review your basket</h1>
          <p className="page-subtitle">
            Update quantities, remove products, and apply discount codes before checkout.
          </p>
        </div>
        <button type="button" onClick={clear} className="btn-outline">
          Clear cart
        </button>
      </div>

      {/* Grid: items list + order summary */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <section className="space-y-4">
          {items.map((item) => (
            <CartItemRow
              key={(item.product?._id || item.product)}
              item={item}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          ))}
        </section>
        <OrderSummary cart={cart} />
      </div>
    </>
  );
}
