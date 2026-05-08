/**
 * ══════════════════════════════════════════════════════════════════════════════
 * FEATURES INDEX
 * ──────────────────────────────────────────────────────────────────────────────
 * Central barrel export for all shopping feature modules.
 *
 * Feature 1: ProductListingFeature  → View the product listing page
 * Feature 2: SearchFilterSortFeature → Browse by categories, search, filter/sort
 * Feature 3: ProductDetailsFeature  → View detailed product information
 * Feature 4: AddToCartFeature       → Add products to the cart
 * Feature 5: CartQuantityFeature    → Update product quantity in the cart
 * ══════════════════════════════════════════════════════════════════════════════
 */

// Feature 1: Product Listing
export { default as ProductListingFeature } from "./ProductListingFeature";

// Feature 2: Search, Filter & Sort
export { default as SearchFilterSortFeature } from "./SearchFilterSortFeature";
export {
  defaultFilters,
  parseFiltersFromURL,
  parsePageFromURL,
  filtersEqual,
  buildSearchParams,
  buildAPIQuery,
  countActiveFilters,
} from "./SearchFilterSortFeature";

// Feature 3: Product Details
export { default as ProductDetailsFeature } from "./ProductDetailsFeature";
export {
  ProductGallery,
  ProductInfo,
  ReviewList,
  ReviewForm,
} from "./ProductDetailsFeature";

// Feature 4: Add to Cart
export { default as AddToCartFeature } from "./AddToCartFeature";
export { QuantitySelector } from "./AddToCartFeature";

// Feature 5: Cart Quantity Update
export { default as CartQuantityFeature } from "./CartQuantityFeature";
export { CartItemRow, OrderSummary } from "./CartQuantityFeature";
