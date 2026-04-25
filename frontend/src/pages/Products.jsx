import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ProductCard from "../components/ProductCard";
import SectionHeader from "../components/SectionHeader";
import { SkeletonCard } from "../components/Loader";
import * as productService from "../services/productService";
import * as categoryService from "../services/categoryService";

const defaultFilters = {
  q: "",
  category: "",
  sort: "newest",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  inStock: false
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({ ...defaultFilters, category: searchParams.get("category") || "", q: searchParams.get("q") || "" });
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService.getCategories().then(({ data }) => setCategories(data || [])).catch(() => setCategories([]));
  }, []);

  const query = useMemo(() => {
    const params = { limit: 12, page: meta.page || 1, sort: filters.sort };
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== false && value !== null) params[key] = value;
    });
    if (filters.q) params.keyword = filters.q;
    return params;
  }, [filters, meta.page]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await productService.getProducts(query);
        setProducts(data.products || data || []);
        setMeta((prev) => ({ ...prev, page: data.page || query.page || 1, pages: data.pages || 1, total: data.total || (data.products || data || []).length }));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.category) params.set("category", filters.category);
    setSearchParams(params, { replace: true });
  }, [filters.q, filters.category, setSearchParams]);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setMeta((prev) => ({ ...prev, page: 1 }));
    setFilters((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const reset = () => {
    setFilters(defaultFilters);
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <main className="bg-cream">
      <section className="border-b border-leaf-100 bg-farm-gradient">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Marketplace"
            title="Find fresh farm products quickly"
            description="Search by keyword, browse categories, filter by price or rating, and sort by popularity to meet the product listing SRS requirement."
          />
          <div className="rounded-3xl bg-white p-4 shadow-soft ring-1 ring-leaf-100">
            <div className="grid gap-3 lg:grid-cols-[1.4fr_.9fr_.8fr_.8fr_.8fr_.8fr]">
              <input name="q" value={filters.q} onChange={change} className="field" placeholder="Search tomato, seeds, fertilizer..." />
              <select name="category" value={filters.category} onChange={change} className="field">
                <option value="">All categories</option>
                {categories.map((category) => <option key={category._id} value={category.slug || category._id}>{category.name}</option>)}
              </select>
              <input name="minPrice" value={filters.minPrice} onChange={change} className="field" placeholder="Min price" type="number" min="0" />
              <input name="maxPrice" value={filters.maxPrice} onChange={change} className="field" placeholder="Max price" type="number" min="0" />
              <select name="minRating" value={filters.minRating} onChange={change} className="field">
                <option value="">Any rating</option>
                <option value="4">4★ & up</option>
                <option value="3">3★ & up</option>
              </select>
              <select name="sort" value={filters.sort} onChange={change} className="field">
                <option value="newest">Newest</option>
                <option value="popular">Popularity</option>
                <option value="rating">Rating</option>
                <option value="price_asc">Price low to high</option>
                <option value="price_desc">Price high to low</option>
              </select>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <input name="inStock" type="checkbox" checked={filters.inStock} onChange={change} className="h-4 w-4 accent-leaf-600" /> In-stock products only
              </label>
              <button onClick={reset} className="btn-outline">Reset filters</button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm font-bold text-slate-500">Showing <span className="text-slate-950">{meta.total}</span> products</p>
          <p className="text-xs font-semibold text-slate-400">Page {meta.page} of {meta.pages}</p>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : products.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div>
        ) : (
          <EmptyState icon="🔎" title="No products matched" message="Try another keyword, category, or price range." actionLabel="Clear filters" actionTo="/products" />
        )}

        {meta.pages > 1 && (
          <div className="mt-10 flex justify-center gap-3">
            <button disabled={meta.page <= 1} onClick={() => setMeta((prev) => ({ ...prev, page: prev.page - 1 }))} className="btn-outline disabled:opacity-40">Previous</button>
            <button disabled={meta.page >= meta.pages} onClick={() => setMeta((prev) => ({ ...prev, page: prev.page + 1 }))} className="btn-primary disabled:opacity-40">Next</button>
          </div>
        )}
      </section>
    </main>
  );
}
