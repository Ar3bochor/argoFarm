/**
 * ══════════════════════════════════════════════════════════════════════════════
 * FEATURE: Browse, Search, Filter & Sort
 * ──────────────────────────────────────────────────────────────────────────────
 * Functionality: The user should be able to browse products by categories,
 *                search using keywords, and filter/sort based on price,
 *                rating, or popularity.
 *
 * This module provides a complete filter bar that:
 *  - Loads categories from the backend for the category dropdown
 *  - Provides keyword search input
 *  - Provides min/max price range inputs
 *  - Provides minimum rating filter (3★ & up, 4★ & up)
 *  - Provides sort options: Newest, Popular, Top Rated, Price ↑, Price ↓
 *  - Provides in-stock checkbox filter
 *  - Syncs all filters to URL search params for shareable links
 *  - Shows active filter count and a "Clear" button
 *
 * Usage:
 *   import SearchFilterSortFeature from "../features/SearchFilterSortFeature";
 *   <SearchFilterSortFeature
 *     filters={filtersObj}
 *     onChange={(name, value) => ...}
 *     onReset={() => ...}
 *     activeFilterCount={n}
 *   />
 * ══════════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from "react";
import * as categoryService from "../services/categoryService";

/* ── Default filter values ── */
export const defaultFilters = {
  q: "",
  category: "",
  sort: "newest",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  inStock: false,
};

/* ── URL ↔ Filters helpers ── */
export const parseFiltersFromURL = (searchParams) => ({
  q: searchParams.get("q") || "",
  category: searchParams.get("category") || "",
  sort: searchParams.get("sort") || defaultFilters.sort,
  minPrice: searchParams.get("minPrice") || "",
  maxPrice: searchParams.get("maxPrice") || "",
  minRating: searchParams.get("minRating") || "",
  inStock: searchParams.get("inStock") === "true",
});

export const parsePageFromURL = (searchParams) =>
  Math.max(1, Number(searchParams.get("page")) || 1);

export const filtersEqual = (a, b) =>
  Object.keys(defaultFilters).every((key) => a[key] === b[key]);

export const buildSearchParams = (filters, page) => {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.sort && filters.sort !== defaultFilters.sort) params.set("sort", filters.sort);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.minRating) params.set("minRating", filters.minRating);
  if (filters.inStock) params.set("inStock", "true");
  if (page > 1) params.set("page", String(page));
  return params;
};

export const buildAPIQuery = (filters, page) => {
  const params = { limit: 12, page: page || 1, sort: filters.sort };
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== false && value !== null && value !== undefined)
      params[key] = value;
  });
  if (filters.q) params.keyword = filters.q;
  return params;
};

export const countActiveFilters = (filters) =>
  Object.entries(filters).filter(
    ([k, v]) => v !== "" && v !== false && v !== defaultFilters[k]
  ).length;

/**
 * SearchFilterSortFeature
 *
 * Props:
 *   filters            – current filter state object
 *   onChange            – (event) => void – handles input change events
 *   onReset             – () => void – resets all filters
 *   activeFilterCount  – number of active filters (for badge)
 */
export default function SearchFilterSortFeature({
  filters,
  onChange,
  onReset,
  activeFilterCount = 0,
}) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let active = true;
    categoryService
      .getCategories()
      .then(({ data }) => {
        if (active) {
          setCategories(Array.isArray(data?.data) ? data.data : []);
        }
      })
      .catch(() => {
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="pm-filter-wrap">
      <div className="pm-filter-inner">
        {/* Search icon */}
        <span className="pm-search-icon">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>

        {/* Keyword search */}
        <label htmlFor="products-search" className="pm-sr-only">Search products</label>
        <input
          id="products-search"
          name="q"
          value={filters.q}
          onChange={onChange}
          className="pm-field pm-field-search"
          placeholder="Search tomatoes, seeds, fertilizer…"
          type="search"
        />

        {/* Category dropdown */}
        <div className="pm-select-wrap">
          <select
            name="category"
            value={filters.category}
            onChange={onChange}
            className="pm-field pm-field-select"
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug || c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price range */}
        <input
          name="minPrice"
          value={filters.minPrice}
          onChange={onChange}
          className="pm-field"
          placeholder="Min ৳"
          type="number"
          min="0"
          aria-label="Minimum price"
          style={{ width: 88 }}
        />
        <input
          name="maxPrice"
          value={filters.maxPrice}
          onChange={onChange}
          className="pm-field"
          placeholder="Max ৳"
          type="number"
          min="0"
          aria-label="Maximum price"
          style={{ width: 88 }}
        />

        {/* Rating filter */}
        <div className="pm-select-wrap">
          <select
            name="minRating"
            value={filters.minRating}
            onChange={onChange}
            className="pm-field pm-field-select"
            aria-label="Minimum rating"
          >
            <option value="">Any rating</option>
            <option value="4">4★ &amp; up</option>
            <option value="3">3★ &amp; up</option>
          </select>
        </div>

        {/* Sort */}
        <div className="pm-select-wrap">
          <select
            name="sort"
            value={filters.sort}
            onChange={onChange}
            className="pm-field pm-field-select"
            aria-label="Sort products"
          >
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
            <option value="rating">Top rated</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
          </select>
        </div>

        {/* In stock only */}
        <label className="pm-checkbox-wrap">
          <input
            name="inStock"
            type="checkbox"
            checked={filters.inStock}
            onChange={onChange}
          />
          In stock
        </label>

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <button onClick={onReset} className="pm-reset-btn" type="button">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Clear {activeFilterCount > 1 ? `(${activeFilterCount})` : ""}
          </button>
        )}
      </div>
    </div>
  );
}
