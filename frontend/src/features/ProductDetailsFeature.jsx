/**
 * ══════════════════════════════════════════════════════════════════════════════
 * FEATURE: Product Details
 * ──────────────────────────────────────────────────────────────────────────────
 * Functionality: The user should be able to view detailed information on
 *                the product details page.
 *
 * This module provides:
 *  - Hero image gallery with clickable thumbnails
 *  - Full product information (name, category, price, discount, unit, stock)
 *  - Rating display with review count
 *  - Product description and tags
 *  - Sales and view metrics
 *  - Customer reviews section
 *  - Review submission form
 *
 * Usage:
 *   import ProductDetailsFeature from "../features/ProductDetailsFeature";
 *   <ProductDetailsFeature
 *     product={productObject}
 *     reviews={reviewsArray}
 *     onSubmitReview={fn}
 *   />
 * ══════════════════════════════════════════════════════════════════════════════
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import RatingStars from "../components/RatingStars";
import EmptyState from "../components/EmptyState";
import { currency, productImage } from "../utils/helpers";

/**
 * ProductGallery — displays main image + thumbnail strip
 */
export function ProductGallery({ product }) {
  const [activeImg, setActiveImg] = useState(0);
  const allImages = product
    ? [
        productImage(product),
        ...(product.images || []).filter((img) => img !== productImage(product)),
      ]
    : [];

  return (
    <div className="rounded-[2rem] bg-white p-4 shadow-soft ring-1 ring-slate-100">
      <img
        src={allImages[activeImg] || productImage(product)}
        alt={product.name}
        className="h-[420px] w-full rounded-[1.5rem] object-cover"
      />
      {allImages.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {allImages.slice(0, 4).map((img, i) => (
            <img
              key={img}
              src={img}
              alt={`${product.name} ${i + 1}`}
              onClick={() => setActiveImg(i)}
              className={`h-24 cursor-pointer rounded-2xl object-cover ring-2 transition-all ${
                activeImg === i
                  ? "ring-leaf-600 opacity-100"
                  : "ring-transparent opacity-60 hover:opacity-80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * ProductInfo — displays all product details: name, category, price, stats, description, tags
 */
export function ProductInfo({ product }) {
  const price = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;

  return (
    <div>
      {/* Category & stock badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-leaf-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-leaf-700">
          {product.category?.name || "Fresh"}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            product.stock <= 0
              ? "bg-red-50 text-red-600"
              : product.stock <= 5
              ? "bg-amber-50 text-amber-600"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {product.stock <= 0
            ? "Out of stock"
            : product.stock <= 5
            ? `Only ${product.stock} left`
            : `Stock ${product.stock}`}
        </span>
      </div>

      {/* Name */}
      <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
        {product.name}
      </h1>

      {/* Rating, sold, views */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <RatingStars value={product.averageRating} count={product.numReviews} />
        <span className="text-sm font-semibold text-slate-400">
          Sold {product.sold || 0}
        </span>
        <span className="text-sm font-semibold text-slate-400">
          Views {product.views || 0}
        </span>
      </div>

      {/* Price */}
      <p className="mt-6 text-4xl font-black text-leaf-700">
        {currency(price)}{" "}
        <span className="text-base font-bold text-slate-400">/ {product.unit}</span>
      </p>
      {hasDiscount && (
        <p className="mt-1 text-sm text-slate-400 line-through">
          Regular {currency(product.price)}
        </p>
      )}

      {/* Description */}
      <p className="mt-6 leading-8 text-slate-600">{product.description}</p>

      {/* Tags */}
      {product.tags?.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Farmer info */}
      {product.farmer && (
        <div className="mt-6 text-sm text-slate-400">
          Sold by{" "}
          <span className="font-bold text-slate-600">
            {product.farmer.name || "Verified farmer"}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * ReviewList — displays approved customer reviews
 */
export function ReviewList({ reviews = [] }) {
  if (!reviews.length) {
    return (
      <EmptyState
        icon="⭐"
        title="No approved reviews yet"
        message="Be the first customer to review this product after delivery."
      />
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-100"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-black text-slate-900">
                {review.title || "Product review"}
              </p>
              <p className="text-sm text-slate-400">
                by {review.user?.name || "Customer"}
              </p>
            </div>
            <RatingStars value={review.rating} compact />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * ReviewForm — form for submitting a new review
 */
export function ReviewForm({ onSubmit }) {
  const [form, setForm] = useState({ rating: 5, title: "", comment: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ rating: 5, title: "", comment: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="field-label">
        Rating
        <select
          value={form.rating}
          onChange={(e) => setForm((p) => ({ ...p, rating: Number(e.target.value) }))}
          className="field"
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </label>
      <label className="field-label">
        Title
        <input
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          className="field"
          placeholder="Great quality produce"
        />
      </label>
      <label className="field-label">
        Comment
        <textarea
          required
          value={form.comment}
          onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
          className="field min-h-28"
          placeholder="Share your experience with this product..."
        />
      </label>
      <button type="submit" className="btn-primary w-full">
        Submit review
      </button>
    </form>
  );
}

/**
 * ProductDetailsFeature — the main export combining all sub-features
 */
export default function ProductDetailsFeature({ product, reviews = [], onSubmitReview }) {
  if (!product) {
    return (
      <EmptyState
        icon="🌾"
        title="Product not found"
        message="This product may be inactive or unavailable."
        actionLabel="Back to products"
        actionTo="/products"
      />
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6 text-sm font-bold text-slate-500">
        <Link to="/products" className="text-leaf-700">
          Products
        </Link>{" "}
        / {product.name}
      </div>

      {/* Main layout: Gallery + Info */}
      <section className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <ProductGallery product={product} />
        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-100 md:p-8">
          <ProductInfo product={product} />
        </div>
      </section>

      {/* Reviews section */}
      <section className="mt-16 grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-slate-100">
          <div className="mb-6">
            <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-leaf-600">
              Reviews
            </p>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              Write a review
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Only customers with delivered orders can submit reviews. New reviews wait
              for admin approval.
            </p>
          </div>
          <ReviewForm onSubmit={onSubmitReview} />
        </div>
        <div>
          <div className="mb-6">
            <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-leaf-600">
              Customer voice
            </p>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              Approved reviews
            </h2>
          </div>
          <ReviewList reviews={reviews} />
        </div>
      </section>
    </>
  );
}
