/**
 * Products Page
 * ─────────────
 * Uses Feature 1 (ProductListingFeature) and Feature 2 (SearchFilterSortFeature)
 * to provide the full product browsing experience.
 */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductListingFeature from "../features/ProductListingFeature";
import SearchFilterSortFeature, {
  defaultFilters,
  parseFiltersFromURL,
  parsePageFromURL,
  filtersEqual,
  buildSearchParams,
  buildAPIQuery,
  countActiveFilters,
} from "../features/SearchFilterSortFeature";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Instrument+Sans:wght@400;500;600&display=swap');

  .pm * { box-sizing: border-box; }
  .pm { font-family: 'Instrument Sans', sans-serif; background: #f9f8f6; min-height: 100vh; color: #0d0d0d; }

  /* ── Page header ── */
  .pm-header {
    background: #0d0d0d;
    padding: 56px 0 48px;
    position: relative;
    overflow: hidden;
  }
  .pm-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }
  .pm-header-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 32px;
    position: relative;
    z-index: 1;
  }
  .pm-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #a3e635;
    margin-bottom: 16px;
  }
  .pm-eyebrow-line {
    width: 24px;
    height: 1px;
    background: #a3e635;
  }
  .pm-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(36px, 5vw, 64px);
    font-weight: 800;
    color: #fff;
    line-height: 1.0;
    letter-spacing: -0.03em;
    margin: 0 0 8px;
  }
  .pm-title span {
    color: #a3e635;
  }
  .pm-subtitle {
    font-size: 15px;
    color: rgba(255,255,255,0.4);
    margin: 12px 0 0;
    max-width: 420px;
    line-height: 1.6;
  }

  /* ── Filter bar ── */
  .pm-filter-wrap {
    background: #fff;
    border-bottom: 1px solid #e8e6e1;
    position: sticky;
    top: 0;
    z-index: 50;
  }
  .pm-filter-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 32px;
    display: flex;
    align-items: center;
    gap: 0;
    height: 64px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .pm-filter-inner::-webkit-scrollbar { display: none; }

  .pm-field {
    height: 36px;
    border: none;
    border-right: 1px solid #e8e6e1;
    background: transparent;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #0d0d0d;
    padding: 0 16px;
    outline: none;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: background 0.15s;
    -webkit-appearance: none;
    appearance: none;
  }
  .pm-field::placeholder { color: #aaa; }
  .pm-field:hover, .pm-field:focus { background: #f9f8f6; }

  .pm-field-search {
    flex: 1;
    min-width: 180px;
    border-right: 1px solid #e8e6e1;
    padding-left: 0;
    font-size: 14px;
    font-weight: 400;
  }
  .pm-search-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 64px;
    color: #888;
    border-right: 1px solid #e8e6e1;
    pointer-events: none;
  }
  .pm-select-wrap {
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }
  .pm-select-wrap::after {
    content: '↓';
    position: absolute;
    right: 10px;
    font-size: 10px;
    color: #888;
    pointer-events: none;
  }
  .pm-field-select {
    padding-right: 28px;
  }

  .pm-checkbox-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 20px;
    border-right: 1px solid #e8e6e1;
    flex-shrink: 0;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #555;
    white-space: nowrap;
  }
  .pm-checkbox-wrap input {
    width: 14px;
    height: 14px;
    accent-color: #0d0d0d;
    cursor: pointer;
  }
  .pm-reset-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 20px;
    height: 36px;
    background: transparent;
    border: none;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #888;
    cursor: pointer;
    flex-shrink: 0;
    transition: color 0.15s;
  }
  .pm-reset-btn:hover { color: #0d0d0d; }

  /* ── Meta bar ── */
  .pm-meta {
    max-width: 1280px;
    margin: 0 auto;
    padding: 32px 32px 20px;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
  }
  .pm-count {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #888;
  }
  .pm-count strong {
    color: #0d0d0d;
    font-size: 22px;
    letter-spacing: -0.02em;
    margin-right: 4px;
    vertical-align: baseline;
  }
  .pm-pagination-label {
    font-size: 12px;
    color: #bbb;
    font-weight: 500;
    letter-spacing: 0.04em;
  }

  /* ── Grid ── */
  .pm-grid-wrap {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 32px 80px;
  }
  .pm-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1px;
    background: #e8e6e1;
    border: 1px solid #e8e6e1;
  }
  .pm-grid > * {
    background: #fff;
    transition: z-index 0s, transform 0.2s ease, box-shadow 0.2s ease;
    position: relative;
  }
  .pm-grid > *:hover {
    z-index: 2;
    transform: scale(1.015);
    box-shadow: 0 8px 40px rgba(0,0,0,0.12);
  }

  /* ── Empty state ── */
  .pm-empty {
    background: #fff;
    border: 1px solid #e8e6e1;
    padding: 80px 32px;
    text-align: center;
  }
  .pm-empty-icon {
    font-size: 40px;
    margin-bottom: 16px;
  }
  .pm-empty-title {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: #0d0d0d;
    margin-bottom: 8px;
  }
  .pm-empty-msg {
    font-size: 14px;
    color: #888;
    margin-bottom: 24px;
  }
  .pm-error {
    background: #fff5f5;
    border: 1px solid #fecaca;
    color: #9f1239;
    padding: 16px 18px;
    margin-bottom: 18px;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .pm-error button {
    border: 1px solid #9f1239;
    background: transparent;
    color: #9f1239;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .pm-error button:hover { background: #9f1239; color: #fff; }
  .pm-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* ── Pagination ── */
  .pm-pagination {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 32px 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #e8e6e1;
    padding-top: 32px;
  }
  .pm-pag-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    cursor: pointer;
    border: 1px solid #0d0d0d;
    background: transparent;
    color: #0d0d0d;
    transition: background 0.15s, color 0.15s;
  }
  .pm-pag-btn:hover:not(:disabled) { background: #0d0d0d; color: #fff; }
  .pm-pag-btn:disabled { opacity: 0.2; cursor: not-allowed; }
  .pm-pag-info {
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #888;
  }

  /* ── Skeleton ── */
  @keyframes pm-shimmer {
    from { background-position: -400px 0; }
    to   { background-position: 400px 0; }
  }
  .pm-skeleton {
    background: #f0eeea;
    background-image: linear-gradient(90deg, #f0eeea 25%, #e8e6e1 50%, #f0eeea 75%);
    background-size: 800px 100%;
    animation: pm-shimmer 1.4s infinite;
    aspect-ratio: 3/4;
    min-height: 320px;
  }

  @media (max-width: 640px) {
    .pm-header-inner { padding: 0 16px; }
    .pm-meta, .pm-grid-wrap, .pm-pagination { padding-left: 16px; padding-right: 16px; }
    .pm-filter-inner { padding: 0 16px; }
  }
`;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsString = searchParams.toString();
  const [filters, setFilters] = useState(() => parseFiltersFromURL(searchParams));
  const [meta, setMeta] = useState(() => ({
    page: parsePageFromURL(searchParams),
    pages: 1,
    total: 0,
  }));

  // Sync URL → state
  useEffect(() => {
    const nextParams = new URLSearchParams(searchParamsString);
    const nextFilters = parseFiltersFromURL(nextParams);
    const nextPage = parsePageFromURL(nextParams);
    setFilters((prev) => (filtersEqual(prev, nextFilters) ? prev : nextFilters));
    setMeta((prev) => (prev.page === nextPage ? prev : { ...prev, page: nextPage }));
  }, [searchParamsString]);

  // Sync state → URL
  useEffect(() => {
    const next = buildSearchParams(filters, meta.page);
    if (next.toString() !== searchParamsString) {
      setSearchParams(next, { replace: true });
    }
  }, [filters, meta.page, searchParamsString, setSearchParams]);

  // Build API query from current filters + page
  const query = useMemo(
    () => buildAPIQuery(filters, meta.page),
    [filters, meta.page]
  );

  const activeFilterCount = countActiveFilters(filters);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMeta((prev) => ({ ...prev, page: 1 }));
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFilterReset = () => {
    setFilters(defaultFilters);
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <main className="pm">
      <style>{css}</style>

      {/* Hero header */}
      <header className="pm-header">
        <div className="pm-header-inner">
          <div className="pm-eyebrow">
            <span className="pm-eyebrow-line" />
            Marketplace
          </div>
          <h1 className="pm-title">
            Fresh<br />
            <span>Products</span>
          </h1>
          <p className="pm-subtitle">
            Farm-direct produce, seeds &amp; inputs — filtered your way.
          </p>
        </div>
      </header>

      {/* Feature 2: Search, Filter & Sort */}
      <SearchFilterSortFeature
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
        activeFilterCount={activeFilterCount}
      />

      {/* Meta bar */}
      <div className="pm-meta">
        <p className="pm-count" aria-live="polite" aria-atomic="true">
          <strong>{meta.total}</strong> products
        </p>
        {meta.pages > 1 && (
          <p className="pm-pagination-label">
            Page {meta.page} / {meta.pages}
          </p>
        )}
      </div>

      {/* Feature 1: Product Listing Grid */}
      <div className="pm-grid-wrap">
        <ProductListingFeature
          query={query}
          onMetaChange={(m) => setMeta(m)}
        />
      </div>

      {/* Pagination */}
      {meta.pages > 1 && (
        <div className="pm-pagination">
          <button
            disabled={meta.page <= 1}
            onClick={() =>
              setMeta((prev) => ({
                ...prev,
                page: Math.max(1, prev.page - 1),
              }))
            }
            className="pm-pag-btn"
            type="button"
          >
            ← Prev
          </button>
          <span className="pm-pag-info">
            {meta.page} of {meta.pages}
          </span>
          <button
            disabled={meta.page >= meta.pages}
            onClick={() =>
              setMeta((prev) => ({
                ...prev,
                page: Math.min(prev.pages, prev.page + 1),
              }))
            }
            className="pm-pag-btn"
            type="button"
          >
            Next →
          </button>
        </div>
      )}
    </main>
  );
}
