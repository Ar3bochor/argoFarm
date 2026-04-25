import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import SectionHeader from "../components/SectionHeader";
import { SkeletonCard } from "../components/Loader";
import * as productService from "../services/productService";
import * as categoryService from "../services/categoryService";
import { currency } from "../utils/helpers";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [featuredRes, categoryRes] = await Promise.all([
          productService.getFeaturedProducts().catch(() => productService.getProducts({ limit: 8, sort: "popular" })),
          categoryService.getCategories()
        ]);
        setFeatured(featuredRes.data?.products || featuredRes.data || []);
        setCategories(categoryRes.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    { label: "Fresh products", value: "500+" },
    { label: "Delivery slots", value: "4/day" },
    { label: "Secure checkout", value: "JWT" }
  ];

  return (
    <main>
      <section className="relative overflow-hidden bg-farm-gradient">
        <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-leaf-200/60 blur-3xl" />
        <div className="absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-amber-100/80 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-leaf-700 shadow-sm ring-1 ring-leaf-100">
              <span>🌱</span> Farm to doorstep marketplace
            </div>
            <h1 className="text-5xl font-black tracking-tight text-slate-950 md:text-7xl">
              Fresh agricultural essentials, delivered fast.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Browse vegetables, fruits, seeds, fertilizer, and farm inputs with fast search, smart filters, secure checkout, and live order tracking.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/products" className="btn-primary justify-center px-8 py-4 text-base">Shop products</Link>
              <Link to="/register" className="btn-outline justify-center px-8 py-4 text-base">Join KrishiMart</Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-white backdrop-blur">
                  <p className="text-2xl font-black text-slate-950">{stat.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <div className="rounded-[2rem] bg-white p-4 shadow-soft ring-1 ring-leaf-100">
              <div className="overflow-hidden rounded-[1.5rem] bg-leaf-50">
                <img
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
                  alt="Green farm field"
                  className="h-80 w-full object-cover md:h-[480px]"
                />
              </div>
              <div className="-mt-16 ml-6 max-w-xs rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-100">
                <p className="text-sm font-black text-leaf-700">Today’s basket</p>
                <p className="mt-1 text-3xl font-black text-slate-950">{currency(1240)}</p>
                <p className="mt-1 text-sm text-slate-500">Organic vegetables, fruits, and seeds ready for checkout.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Categories"
          title="Browse by agricultural need"
          description="Start with popular categories, then narrow down using search, rating, price, and popularity filters."
          action={<Link to="/products" className="btn-outline">View all</Link>}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(categories.length ? categories : ["Vegetables", "Fruits", "Seeds", "Fertilizers"].map((name) => ({ name }))).map((category, index) => (
            <Link key={category._id || category.name} to={`/products?category=${category.slug || category._id || category.name}`} className="group rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-soft">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf-50 text-3xl transition group-hover:bg-leaf-600 group-hover:text-white">
                {["🥬", "🍎", "🌾", "🧪"][index % 4]}
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-950">{category.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{category.description || "Fresh, verified and ready for delivery."}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-leaf-50/70 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Featured"
            title="Popular fresh picks"
            description="Designed for performance: product listing, search and filters load quickly with paginated backend APIs."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : featured.slice(0, 8).map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["⚡", "Fast browsing", "Optimized product cards, pagination, and responsive filters help users browse without lag."],
            ["📱", "Mobile checkout", "Cart, address, delivery slot, summary, and payment screens work cleanly on phones."],
            ["🔐", "Secure orders", "JWT authentication protects cart, address, checkout, order history, and review actions."]
          ].map(([icon, title, text]) => (
            <div key={title} className="rounded-3xl bg-white p-8 shadow-card ring-1 ring-slate-100">
              <div className="text-4xl">{icon}</div>
              <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
