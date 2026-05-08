/**
 * File: src/components/ProductCard.jsx
 * Description: Displays a single product card with image, category, price, rating, wishlist action, and add-to-cart functionality.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RatingStars from "./RatingStars";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import { currency, productImage } from "../utils/helpers";

/**
 * Component-specific styles for the product card.
 * The CSS is organised by section to keep the card styling easy to maintain.
 */
const cardCss = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');

  /* ================================
     Animations
  ================================= */

  @keyframes kpc-pop {
    0% { transform: scale(1); }
    45% { transform: scale(1.18); }
    100% { transform: scale(1); }
  }

  @keyframes kpc-check {
    0% {
      opacity: 0;
      transform: scale(0.45) rotate(-8deg);
    }
    65% {
      opacity: 1;
      transform: scale(1.15) rotate(3deg);
    }
    100% {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes kpc-ripple {
    0% {
      transform: scale(0);
      opacity: 0.45;
    }
    100% {
      transform: scale(3.8);
      opacity: 0;
    }
  }

  @keyframes kpc-slide-up {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ================================
     Card Base
  ================================= */

  .kpc-card {
    --kpc-green-900: #0f2610;
    --kpc-green-800: #1a4d1a;
    --kpc-green-700: #1f6b25;
    --kpc-green-600: #2d7d2d;
    --kpc-green-100: #e8f5e9;
    --kpc-green-50: #f3faf2;
    --kpc-border: rgba(45, 125, 45, 0.11);
    --kpc-shadow: 0 4px 18px rgba(15, 38, 16, 0.07);
    --kpc-shadow-hover: 0 22px 52px rgba(15, 38, 16, 0.15);

    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
    border: 1px solid var(--kpc-border);
    border-radius: 24px;
    background: #ffffff;
    box-shadow: var(--kpc-shadow);
    font-family: 'DM Sans', sans-serif;
    transition:
      transform 0.24s ease,
      box-shadow 0.24s ease,
      border-color 0.24s ease;
  }

  .kpc-card:hover {
    transform: translateY(-6px);
    border-color: rgba(45, 125, 45, 0.2);
    box-shadow: var(--kpc-shadow-hover);
  }

  .kpc-card-link,
  .kpc-image-link {
    color: inherit;
    text-decoration: none;
  }

  .kpc-card-link {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  .kpc-image-link {
    display: block;
    height: 100%;
  }

  /* ================================
     Product Image
  ================================= */

  .kpc-img-wrap {
    position: relative;
    height: 200px;
    overflow: hidden;
    background:
      linear-gradient(135deg, rgba(232, 245, 233, 0.9), rgba(243, 250, 242, 0.9));
  }

  .kpc-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .kpc-card:hover .kpc-img {
    transform: scale(1.06);
  }

  .kpc-img-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to bottom, rgba(0, 0, 0, 0.14), transparent 42%),
      linear-gradient(to top, rgba(15, 38, 16, 0.18), transparent 45%);
    pointer-events: none;
  }

  .kpc-img-wrap.oos::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.48);
    pointer-events: none;
  }

  /* ================================
     Image Badges
  ================================= */

  .kpc-cat,
  .kpc-badge {
    position: absolute;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.02em;
    backdrop-filter: blur(10px);
  }

  .kpc-cat {
    top: 12px;
    left: 12px;
    max-width: calc(100% - 96px);
    padding: 7px 12px;
    border: 1px solid rgba(45, 125, 45, 0.14);
    background: rgba(255, 255, 255, 0.92);
    color: var(--kpc-green-600);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  }

  .kpc-badge {
    top: 12px;
    right: 12px;
    padding: 7px 11px;
  }

  .kpc-badge-stock {
    border: 1px solid rgba(180, 130, 0, 0.16);
    background: rgba(255, 244, 196, 0.95);
    color: #8a5a08;
  }

  .kpc-badge-discount {
    border: 1px solid rgba(180, 40, 40, 0.12);
    background: rgba(210, 55, 55, 0.94);
    color: #ffffff;
  }

  /* ================================
     Wishlist Button
  ================================= */

  .kpc-wish {
    position: absolute;
    right: 12px;
    bottom: 12px;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid rgba(45, 125, 45, 0.14);
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.94);
    color: #d94a4a;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    opacity: 0;
    pointer-events: none;
    transform: scale(0.88);
    transition:
      opacity 0.2s ease,
      transform 0.2s ease,
      background 0.2s ease,
      border-color 0.2s ease;
  }

  .kpc-card:hover .kpc-wish,
  .kpc-wish.active {
    opacity: 1;
    pointer-events: auto;
    transform: scale(1);
  }

  .kpc-wish:hover {
    border-color: rgba(217, 74, 74, 0.24);
    background: #fff2f2;
    transform: scale(1.1);
  }

  .kpc-wish.active span {
    animation: kpc-pop 0.34s ease;
  }

  .kpc-wish:focus-visible {
    outline: 3px solid rgba(45, 125, 45, 0.25);
    outline-offset: 3px;
  }

  /* ================================
     Product Content
  ================================= */

  .kpc-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 18px 18px 16px;
  }

  .kpc-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .kpc-name {
    display: -webkit-box;
    overflow: hidden;
    color: var(--kpc-green-900);
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    font-weight: 700;
    line-height: 1.25;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .kpc-unit {
    margin-top: 5px;
    color: #8fa48f;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.11em;
    text-transform: uppercase;
  }

  .kpc-price-wrap {
    flex-shrink: 0;
    text-align: right;
  }

  .kpc-price {
    color: var(--kpc-green-700);
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
  }

  .kpc-price-orig {
    margin-top: 4px;
    color: #aeb8ae;
    font-size: 11px;
    font-weight: 600;
    text-decoration: line-through;
    white-space: nowrap;
  }

  .kpc-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 14px;
  }

  .kpc-sold {
    flex-shrink: 0;
    color: #8fa48f;
    font-size: 11px;
    font-weight: 700;
  }

  /* ================================
     Add To Cart Button
  ================================= */

  .kpc-btn-wrap {
    position: relative;
    overflow: hidden;
    margin: 0 18px 18px;
    border-radius: 16px;
  }

  .kpc-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 44px;
    overflow: hidden;
    border: none;
    border-radius: 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition:
      background 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease,
      transform 0.15s ease,
      box-shadow 0.2s ease;
  }

  .kpc-btn:focus-visible {
    outline: 3px solid rgba(45, 125, 45, 0.25);
    outline-offset: 3px;
  }

  .kpc-btn-active {
    background: var(--kpc-green-800);
    color: #ffffff;
    box-shadow: 0 8px 20px rgba(26, 77, 26, 0.24);
  }

  .kpc-btn-active:hover {
    background: #103810;
    box-shadow: 0 10px 26px rgba(26, 77, 26, 0.3);
    transform: translateY(-1px);
  }

  .kpc-btn-active:active {
    transform: translateY(0) scale(0.99);
  }

  .kpc-btn-disabled {
    background: #f0f1ef;
    color: #aeb8ae;
    cursor: not-allowed;
    box-shadow: none;
  }

  .kpc-btn-added {
    border: 1.5px solid rgba(45, 125, 45, 0.18);
    background: var(--kpc-green-100);
    color: var(--kpc-green-600);
    cursor: default;
    box-shadow: none;
  }

  .kpc-btn-added-inner {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    animation: kpc-slide-up 0.28s ease;
  }

  .kpc-check {
    display: inline-block;
    animation: kpc-check 0.34s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .kpc-btn-ripple {
    position: absolute;
    width: 20px;
    height: 20px;
    margin-top: -10px;
    margin-left: -10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.34);
    pointer-events: none;
    animation: kpc-ripple 0.55s ease-out forwards;
  }

  /* ================================
     Accessibility / Motion
  ================================= */

  @media (prefers-reduced-motion: reduce) {
    .kpc-card,
    .kpc-img,
    .kpc-wish,
    .kpc-btn,
    .kpc-btn-ripple,
    .kpc-check,
    .kpc-btn-added-inner {
      animation: none !important;
      transition: none !important;
    }

    .kpc-card:hover,
    .kpc-card:hover .kpc-img {
      transform: none;
    }
  }
`;

export default function ProductCard({ product }) {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  /**
   * Local UI states for add-to-cart feedback, wishlist toggle, and button ripple effect.
   */
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const [ripple, setRipple] = useState(null);

  /**
   * Use discounted price when available, otherwise fall back to the regular product price.
   */
  const price = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice;

  /**
   * Calculate discount percentage for the discount badge.
   */
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  /**
   * Handles adding the product to the cart.
   * If the user is not logged in, they are redirected to the login page.
   */
  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.stock || authLoading) return;

    let activeUser = user;

    // Refresh user data if a token exists but the user object has not loaded yet.
    if (!activeUser && localStorage.getItem("token")) {
      activeUser = await refreshUser();
    }

    if (!activeUser) {
      navigate("/login");
      return;
    }

    // Create a ripple animation from the exact click position.
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setRipple(null), 600);

    try {
      await addItem(product._id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      setRipple(null);
    }
  };

  /**
   * Toggles the local wishlist visual state.
   */
  const handleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWished((v) => !v);
  };

  return (
    <>
      <style>{cardCss}</style>

      <article className="kpc-card">
        {/* Product image and image-level badges */}
        <div className={`kpc-img-wrap${!product.stock ? " oos" : ""}`}>
          <Link
            to={`/products/${product._id}`}
            className="kpc-image-link"
            aria-label={`View details for ${product.name}`}
          >
            <img
              src={productImage(product)}
              alt={product.name}
              className="kpc-img"
            />

            <div className="kpc-img-overlay" />

            <span className="kpc-cat">
              {product.category?.name || "Fresh"}
            </span>

            {hasDiscount && (
              <span className="kpc-badge kpc-badge-discount">
                −{discountPct}%
              </span>
            )}

            {!hasDiscount && product.stock > 0 && product.stock <= 5 && (
              <span className="kpc-badge kpc-badge-stock">
                Low stock
              </span>
            )}
          </Link>

          {/* Wishlist toggle button */}
          <button
            type="button"
            className={`kpc-wish${wished ? " active" : ""}`}
            onClick={handleWish}
            aria-pressed={wished}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <span>{wished ? "❤️" : "🤍"}</span>
          </button>
        </div>

        {/* Product information link */}
        <Link
          to={`/products/${product._id}`}
          className="kpc-card-link"
          aria-label={`View details for ${product.name}`}
        >
          <div className="kpc-body">
            <div className="kpc-top">
              <div>
                <div className="kpc-name">{product.name}</div>
                <div className="kpc-unit">Per {product.unit || "item"}</div>
              </div>

              <div className="kpc-price-wrap">
                <div className="kpc-price">{currency(price)}</div>

                {hasDiscount && (
                  <div className="kpc-price-orig">
                    {currency(product.price)}
                  </div>
                )}
              </div>
            </div>

            <div className="kpc-meta">
              <RatingStars
                value={product.averageRating}
                count={product.numReviews}
              />

              <span className="kpc-sold">
                {product.sold > 0 ? `${product.sold} sold` : "New"}
              </span>
            </div>
          </div>
        </Link>

        {/* Add-to-cart action */}
        <div className="kpc-btn-wrap">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.stock || authLoading}
            className={`kpc-btn ${
              !product.stock
                ? "kpc-btn-disabled"
                : added
                  ? "kpc-btn-added"
                  : "kpc-btn-active"
            }`}
          >
            {ripple && (
              <span
                className="kpc-btn-ripple"
                style={{ left: ripple.x, top: ripple.y }}
              />
            )}

            {!product.stock ? (
              "Out of stock"
            ) : added ? (
              <span className="kpc-btn-added-inner">
                <span className="kpc-check">✓</span>
                Added to cart!
              </span>
            ) : authLoading ? (
              "Checking..."
            ) : (
              "Add to cart"
            )}
          </button>
        </div>
      </article>
    </>
  );
}