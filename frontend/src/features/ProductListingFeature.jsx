/**
 * ══════════════════════════════════════════════════════════════════════════════
 * FEATURE: Product Listing
 * ──────────────────────────────────────────────────────────────────────────────
 * Functionality: The user should be able to view the product listing page.
 *
 * This module provides a reusable product grid component that:
 *  - Fetches products from the backend API
 *  - Displays them in a responsive grid with skeleton loading states
 *  - Shows pagination controls when results span multiple pages
 *  - Handles empty states and error recovery
 *
 * Usage:
 *   import ProductListingFeature from "../features/ProductListingFeature";
 *   <ProductListingFeature query={queryObject} onPageChange={fn} />
 * ══════════════════════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useRef, useState } from "react";
import ProductCard from "../components/ProductCard";
import * as productService from "../services/productService";
import { getErrorMessage } from "../utils/helpers";

/* ── Response unwrapper ── */
const unwrapProducts = (body) => {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.products)) return body.products;
  if (Array.isArray(body?.data?.products)) return body.data.products;
  if (Array.isArray(body?.data)) return body.data;
  return [];
};

/**
 * ProductListingFeature
 *
 * Props:
 *   query       – Object with API filter params { page, limit, sort, category, ... }
 *   onMetaChange – Callback receiving { page, pages, total } when data loads
 */
export default function ProductListingFeature({ query = {}, onMetaChange }) {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);

  // Store callback in a ref to avoid re-fetch loops when parent re-renders
  const onMetaChangeRef = useRef(onMetaChange);
  onMetaChangeRef.current = onMetaChange;

  const loadProducts = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError("");

    productService
      .getProducts(query, { signal: controller.signal })
      .then(({ data }) => {
        if (requestId !== requestIdRef.current) return;
        const nextProducts = unwrapProducts(data);
        const nextPages = Math.max(Number(data?.pages ?? data?.data?.pages) || 1, 1);
        const safePage = Math.min(Math.max(Number(query.page) || 1, 1), nextPages);
        const nextTotal = Number(data?.total ?? data?.data?.total ?? nextProducts.length) || 0;

        setProducts(nextProducts);
        const nextMeta = { page: safePage, pages: nextPages, total: nextTotal };
        setMeta(nextMeta);
        onMetaChangeRef.current?.(nextMeta);
      })
      .catch((err) => {
        if (err?.code === "ERR_CANCELED" || requestId !== requestIdRef.current) return;
        setProducts([]);
        setMeta({ page: 1, pages: 1, total: 0 });
        setError(getErrorMessage(err, "Unable to load products. Please check that the backend server is running."));
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setLoading(false);
      });
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(loadProducts, 250);
    return () => {
      clearTimeout(timer);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [loadProducts]);

  return (
    <div>
      {/* Error state */}
      {error && (
        <div className="pm-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={loadProducts}>Retry</button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading ? (
        <div className="pm-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="pm-skeleton" />
          ))}
        </div>
      ) : products.length ? (
        /* Product grid */
        <div className="pm-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        !error && (
          <div className="pm-empty">
            <div className="pm-empty-icon">🔎</div>
            <div className="pm-empty-title">No products matched</div>
            <p className="pm-empty-msg">
              Try a different keyword, category, or price range.
            </p>
          </div>
        )
      )}

      {/* Pagination info */}
      {!loading && meta.total > 0 && (
        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#888", fontWeight: 600 }}>
          Showing {products.length} of {meta.total} products — Page {meta.page} of {meta.pages}
        </p>
      )}
    </div>
  );
}
