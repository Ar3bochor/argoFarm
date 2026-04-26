import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import * as productService from "../services/productService";
import * as categoryService from "../services/categoryService";
import { getErrorMessage } from "../utils/helpers";

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
  .pm-empty-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    background: #0d0d0d;
    color: #fff;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.15s;
  }
  .pm-empty-btn:hover { background: #222; }
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


const defaultFilters = {
  q: "",
  category: "",
  sort: "newest",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  inStock: false
};

const parseFilters = (searchParams) => ({
  q: searchParams.get("q") || "",
  category: searchParams.get("category") || "",
  sort: searchParams.get("sort") || defaultFilters.sort,
  minPrice: searchParams.get("minPrice") || "",
  maxPrice: searchParams.get("maxPrice") || "",
  minRating: searchParams.get("minRating") || "",
  inStock: searchParams.get("inStock") === "true",
});

const parsePage = (searchParams) => Math.max(1, Number(searchParams.get("page")) || 1);

const filtersEqual = (a, b) => Object.keys(defaultFilters).every((key) => a[key] === b[key]);

const buildSearchParams = (filters, page) => {
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

const unwrapProducts = (body) => {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.products)) return body.products;
  if (Array.isArray(body?.data?.products)) return body.data.products;
  if (Array.isArray(body?.data)) return body.data;
  return [];
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsString = searchParams.toString();
  const [filters, setFilters] = useState(() => parseFilters(searchParams));
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(() => ({ page: parsePage(searchParams), pages: 1, total: 0 }));
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);

  useEffect(() => {
    let active = true;
    categoryService.getCategories()
      .then(({ data }) => {
        if (active) {
          setCategories(Array.isArray(data?.data) ? data.data : []);  // Ensure it's always an array
        }
      })
      .catch(() => {
        if (active) setCategories([]);  // Fallback to an empty array on error
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParamsString);
    const nextFilters = parseFilters(nextParams);
    const nextPage = parsePage(nextParams);

    setFilters((prev) => (filtersEqual(prev, nextFilters) ? prev : nextFilters));
    setMeta((prev) => (prev.page === nextPage ? prev : { ...prev, page: nextPage }));
  }, [searchParamsString]);

  useEffect(() => {
    const next = buildSearchParams(filters, meta.page);
    if (next.toString() !== searchParamsString) {
      setSearchParams(next, { replace: true });
    }
  }, [filters, meta.page, searchParamsString, setSearchParams]);

  const query = useMemo(() => {
    const params = { limit: 12, page: meta.page || 1, sort: filters.sort };
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== false && value !== null && value !== undefined) params[key] = value;
    });
    if (filters.q) params.keyword = filters.q;
    return params;
  }, [filters, meta.page]);

  const loadProducts = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError("");

    productService.getProducts(query, { signal: controller.signal })
      .then(({ data }) => {
        if (requestId !== requestIdRef.current) return;
        const nextProducts = unwrapProducts(data);
        const nextPages = Math.max(Number(data?.pages ?? data?.data?.pages) || 1, 1);
        const requestedPage = Math.max(Number(query.page) || 1, 1);
        const safePage = Math.min(requestedPage, nextPages);

        setProducts(nextProducts);
        setMeta({
          page: safePage,
          pages: nextPages,
          total: Number(data?.total ?? data?.data?.total ?? nextProducts.length) || 0,
        });
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

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setMeta(prev => ({ ...prev, page: 1 }));
    setFilters(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const reset = () => {
    setFilters(defaultFilters);
    setMeta(prev => ({ ...prev, page: 1 }));
    setError("");
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    v !== "" && v !== false && v !== defaultFilters[k]
  ).length;

  return (
    <main className="pm">
      <style>{css}</style>

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

      <div className="pm-filter-wrap">
        <div className="pm-filter-inner">
          <span className="pm-search-icon">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>

          <label htmlFor="products-search" className="pm-sr-only">Search products</label>
          <input
            id="products-search"
            name="q"
            value={filters.q}
            onChange={change}
            className="pm-field pm-field-search"
            placeholder="Search tomatoes, seeds, fertilizer…"
            type="search"
          />

          <div className="pm-select-wrap">
            <select name="category" value={filters.category} onChange={change} className="pm-field pm-field-select" aria-label="Filter by category">
              <option value="">All categories</option>
              {categories.map(c => (
                <option key={c._id} value={c.slug || c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <input
            name="minPrice"
            value={filters.minPrice}
            onChange={change}
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
            onChange={change}
            className="pm-field"
            placeholder="Max ৳"
            type="number"
            min="0"
            aria-label="Maximum price"
            style={{ width: 88 }}
          />

          <div className="pm-select-wrap">
            <select name="minRating" value={filters.minRating} onChange={change} className="pm-field pm-field-select" aria-label="Minimum rating">
              <option value="">Any rating</option>
              <option value="4">4★ &amp; up</option>
              <option value="3">3★ &amp; up</option>
            </select>
          </div>

          <div className="pm-select-wrap">
            <select name="sort" value={filters.sort} onChange={change} className="pm-field pm-field-select" aria-label="Sort products">
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
              <option value="rating">Top rated</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
          </div>

          <label className="pm-checkbox-wrap">
            <input
              name="inStock"
              type="checkbox"
              checked={filters.inStock}
              onChange={change}
            />
            In stock
          </label>

          {activeFilterCount > 0 && (
            <button onClick={reset} className="pm-reset-btn" type="button">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Clear {activeFilterCount > 1 ? `(${activeFilterCount})` : ""}
            </button>
          )}
        </div>
      </div>

      <div className="pm-meta">
        <p className="pm-count" aria-live="polite" aria-atomic="true">
          <strong>{meta.total}</strong> products
        </p>
        {meta.pages > 1 && (
          <p className="pm-pagination-label">Page {meta.page} / {meta.pages}</p>
        )}
      </div>

      <div className="pm-grid-wrap">
        {error && (
          <div className="pm-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={loadProducts}>Retry</button>
          </div>
        )}
        {loading ? (
          <div className="pm-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="pm-skeleton" />
            ))}
          </div>
        ) : products.length ? (
          <div className="pm-grid">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : !error && (
          <div className="pm-empty">
            <div className="pm-empty-icon">🔎</div>
            <div className="pm-empty-title">No products matched</div>
            <p className="pm-empty-msg">Try a different keyword, category, or price range.</p>
            <button className="pm-empty-btn" onClick={reset} type="button">Clear all filters</button>
          </div>
        )}
      </div>

      {meta.pages > 1 && (
        <div className="pm-pagination">
          <button
            disabled={meta.page <= 1}
            onClick={() => setMeta(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            className="pm-pag-btn"
            type="button"
          >
            ← Prev
          </button>
          <span className="pm-pag-info">{meta.page} of {meta.pages}</span>
          <button
            disabled={meta.page >= meta.pages}
            onClick={() => setMeta(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
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
