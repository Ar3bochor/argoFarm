/**
 * ══════════════════════════════════════════════════════════════════════════════
 * FEATURE: Add to Cart
 * ──────────────────────────────────────────────────────────────────────────────
 * Functionality: The user should be able to add products to the cart.
 *
 * This module provides:
 *  - A quantity selector with +/- buttons
 *  - An "Add to cart" button with ripple animation and success feedback
 *  - Auth check: redirects unauthenticated users to /login
 *  - Loading and disabled states for out-of-stock products
 *  - Success/error message display
 *
 * Usage:
 *   import AddToCartFeature from "../features/AddToCartFeature";
 *   <AddToCartFeature product={productObject} />
 * ══════════════════════════════════════════════════════════════════════════════
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";

/**
 * QuantitySelector — standalone +/- quantity input
 */
export function QuantitySelector({ value, onChange, min = 1, max = 99 }) {
  return (
    <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="px-5 py-3 text-xl font-black text-slate-600 transition-colors hover:bg-slate-50"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
        className="w-16 border-x border-slate-100 text-center font-black outline-none"
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="px-5 py-3 text-xl font-black text-slate-600 transition-colors hover:bg-slate-50"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

/**
 * AddToCartFeature
 *
 * Props:
 *   product  – the product object (must have _id, stock)
 *   onAdded  – optional callback after successful add
 */
export default function AddToCartFeature({ product, onAdded }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleAdd = async () => {
    if (!user) return navigate("/login");
    setMessage({ text: "", type: "" });
    setAdding(true);
    try {
      await addItem(product._id, qty);
      setMessage({ text: "✓ Added to cart successfully!", type: "success" });
      onAdded?.();
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      setMessage({ text: err.message || "Could not add to cart", type: "error" });
    } finally {
      setAdding(false);
    }
  };

  const isOutOfStock = !product?.stock;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <QuantitySelector
          value={qty}
          onChange={setQty}
          min={1}
          max={product?.stock || 99}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={isOutOfStock || adding}
          className="btn-primary flex-1 justify-center py-4 disabled:opacity-50"
        >
          {isOutOfStock
            ? "Out of stock"
            : adding
            ? "Adding..."
            : "Add to cart"}
        </button>
      </div>

      {/* Feedback message */}
      {message.text && (
        <p
          className={`mt-4 rounded-2xl p-4 text-sm font-bold ${
            message.type === "success"
              ? "bg-leaf-50 text-leaf-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
