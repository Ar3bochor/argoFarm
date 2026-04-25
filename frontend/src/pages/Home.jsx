import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { SkeletonCard } from "../components/Loader";
import * as productService from "../services/productService";
import * as categoryService from "../services/categoryService";
import { currency } from "../utils/helpers";

/* ─── Inline styles ──────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;600&display=swap');

  /* Reset helpers */
  .kh * { box-sizing: border-box; }

  /* ── Entrance keyframes ── */
  @keyframes kh-rise {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes kh-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes kh-scale-in {
    from { opacity: 0; transform: scale(0.94); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes kh-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes kh-spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .kh { font-family: 'DM Sans', sans-serif; }

  /* ═══════════════════════════════════════════
     HERO
  ═══════════════════════════════════════════ */
  .kh-hero {
    position: relative;
    overflow: hidden;
    background: #f7f4ef;
    min-height: 100svh;
    display: flex;
    align-items: center;
  }

  /* Botanical background texture rings */
  .kh-hero-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(45,125,45,0.08);
    pointer-events: none;
    animation: kh-spin-slow linear infinite;
  }
  .kh-hero-ring-1 { width: 560px; height: 560px; top: -140px; right: -100px; animation-duration: 60s; }
  .kh-hero-ring-2 { width: 360px; height: 360px; top: -60px;  right: 20px;  animation-duration: 40s; animation-direction: reverse; border-color: rgba(45,125,45,0.06); }
  .kh-hero-blob-a {
    position: absolute; pointer-events: none;
    width: 480px; height: 380px; border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%;
    background: radial-gradient(ellipse, rgba(200,230,201,0.55), transparent 70%);
    top: -40px; right: -60px;
    animation: kh-float 7s ease-in-out infinite;
  }
  .kh-hero-blob-b {
    position: absolute; pointer-events: none;
    width: 320px; height: 280px; border-radius: 40% 60% 30% 70% / 60% 30% 70% 40%;
    background: radial-gradient(ellipse, rgba(255,220,160,0.35), transparent 70%);
    bottom: 40px; left: -40px;
    animation: kh-float 9s ease-in-out infinite reverse;
  }

  .kh-hero-inner {
    position: relative; z-index: 2;
    max-width: 1200px; margin: 0 auto;
    padding: 80px 28px 80px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 60px;
    align-items: center;
  }
  @media (min-width: 900px) {
    .kh-hero-inner { grid-template-columns: 1fr 1fr; padding: 100px 28px; }
  }

  /* Left copy */
  .kh-hero-copy {}

  .kh-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border: 1px solid rgba(45,125,45,0.15);
    border-radius: 100px;
    padding: 7px 16px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: #2d7d2d;
    text-transform: uppercase;
    margin-bottom: 28px;
    animation: kh-rise 0.7s ease both;
    animation-delay: 0.1s;
    box-shadow: 0 1px 8px rgba(45,125,45,0.08);
  }

  .kh-eyebrow-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #4caf50;
    display: inline-block;
  }

  .kh-h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(40px, 5.5vw, 72px);
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: #0f2610;
    margin: 0 0 24px;
    animation: kh-rise 0.7s ease both;
    animation-delay: 0.2s;
  }

  .kh-h1 em {
    font-style: italic;
    color: #2d7d2d;
    position: relative;
    display: inline-block;
  }

  /* Underline squiggle on italic word */
  .kh-h1 em::after {
    content: '';
    position: absolute;
    bottom: -4px; left: 0; right: 0;
    height: 3px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 8'%3E%3Cpath d='M0 4 Q25 0 50 4 Q75 8 100 4 Q125 0 150 4 Q175 8 200 4' stroke='%234caf50' stroke-width='2.5' fill='none'/%3E%3C/svg%3E") center/cover no-repeat;
    border-radius: 2px;
  }

  .kh-lead {
    font-size: 17px;
    line-height: 1.75;
    color: #4a5e4a;
    max-width: 480px;
    margin-bottom: 36px;
    animation: kh-rise 0.7s ease both;
    animation-delay: 0.35s;
  }

  .kh-cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 48px;
    animation: kh-rise 0.7s ease both;
    animation-delay: 0.45s;
  }

  .kh-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: #1a4d1a;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 600;
    padding: 14px 28px;
    border-radius: 100px;
    text-decoration: none;
    border: none; cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(26,77,26,0.28);
  }
  .kh-btn-primary:hover { background: #0f3210; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(26,77,26,0.35); }

  .kh-btn-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent;
    color: #1a4d1a;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 600;
    padding: 13px 26px;
    border-radius: 100px;
    text-decoration: none;
    border: 1.5px solid rgba(26,77,26,0.25);
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
  }
  .kh-btn-secondary:hover { background: rgba(26,77,26,0.05); border-color: #2d7d2d; transform: translateY(-1px); }

  /* Stats strip */
  .kh-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    animation: kh-rise 0.7s ease both;
    animation-delay: 0.55s;
  }

  .kh-stat {
    background: #fff;
    border: 1px solid rgba(45,125,45,0.12);
    border-radius: 20px;
    padding: 16px 14px;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  }

  .kh-stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 900;
    color: #0f2610;
    line-height: 1;
  }

  .kh-stat-label {
    margin-top: 4px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #8aaa8a;
  }

  /* Hero visual panel */
  .kh-hero-visual {
    position: relative;
    animation: kh-scale-in 0.9s ease both;
    animation-delay: 0.3s;
  }

  .kh-hero-img-frame {
    position: relative;
    border-radius: 32px 32px 32px 80px;
    overflow: hidden;
    box-shadow: 0 32px 80px rgba(15,38,16,0.18);
    background: #d4e8d0;
  }

  .kh-hero-img-frame img {
    width: 100%; height: 520px;
    object-fit: cover; display: block;
  }
  @media (max-width: 900px) {
    .kh-hero-img-frame img { height: 320px; }
  }

  /* Floating card overlay */
  .kh-hero-card {
    position: absolute;
    bottom: -24px; left: -24px;
    background: #fff;
    border-radius: 24px;
    padding: 18px 22px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.14);
    min-width: 220px;
    border: 1px solid rgba(45,125,45,0.1);
    animation: kh-float 6s ease-in-out infinite;
    animation-delay: 1s;
  }

  @media (max-width: 900px) {
    .kh-hero-card { left: 16px; bottom: -16px; min-width: 180px; padding: 14px 16px; }
  }

  .kh-hero-card-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #4caf50;
    margin-bottom: 4px;
  }

  .kh-hero-card-price {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 900;
    color: #0f2610;
    line-height: 1;
  }

  .kh-hero-card-desc {
    font-size: 12px;
    color: #7a9e7a;
    margin-top: 5px;
    line-height: 1.5;
  }

  /* Decorative badge on image */
  .kh-hero-badge {
    position: absolute;
    top: 20px; right: 20px;
    background: #1a4d1a;
    color: #fff;
    border-radius: 50%;
    width: 72px; height: 72px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 11px; font-weight: 700;
    text-align: center;
    line-height: 1.2;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    gap: 1px;
  }

  .kh-hero-badge strong {
    font-size: 19px;
    font-weight: 900;
    display: block;
  }

  /* ═══════════════════════════════════════════
     SECTION SHELL
  ═══════════════════════════════════════════ */
  .kh-section {
    padding: 80px 0;
  }

  .kh-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 28px;
  }

  /* Section header */
  .kh-sec-header {
    margin-bottom: 48px;
  }

  .kh-sec-eyebrow {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #4caf50;
    margin-bottom: 10px;
  }

  .kh-sec-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(26px, 3.5vw, 40px);
    font-weight: 900;
    color: #0f2610;
    line-height: 1.15;
    letter-spacing: -0.01em;
    margin: 0 0 14px;
  }

  .kh-sec-desc {
    font-size: 15px;
    color: #6b886b;
    max-width: 540px;
    line-height: 1.7;
  }

  .kh-sec-header-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  /* ═══════════════════════════════════════════
     CATEGORIES
  ═══════════════════════════════════════════ */
  .kh-categories-bg {
    background: #fff;
  }

  .kh-cat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }

  .kh-cat-card {
    background: #f7f4ef;
    border: 1px solid rgba(45,125,45,0.08);
    border-radius: 24px;
    padding: 28px 24px 24px;
    text-decoration: none;
    display: block;
    transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
    position: relative;
    overflow: hidden;
  }

  .kh-cat-card::before {
    content: '';
    position: absolute;
    bottom: -40px; right: -40px;
    width: 120px; height: 120px;
    border-radius: 50%;
    background: rgba(45,125,45,0.05);
    transition: transform 0.3s ease;
  }

  .kh-cat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 48px rgba(15,38,16,0.12);
    background: #f0f7ef;
  }

  .kh-cat-card:hover::before {
    transform: scale(2.2);
  }

  .kh-cat-icon {
    width: 56px; height: 56px;
    border-radius: 18px;
    background: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 26px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.07);
    margin-bottom: 20px;
    transition: background 0.2s, transform 0.2s;
  }

  .kh-cat-card:hover .kh-cat-icon {
    background: #2d7d2d;
    transform: scale(1.1) rotate(-5deg);
  }

  .kh-cat-name {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    color: #0f2610;
    margin-bottom: 8px;
  }

  .kh-cat-desc {
    font-size: 13px;
    color: #7a9e7a;
    line-height: 1.6;
  }

  .kh-cat-arrow {
    position: absolute;
    top: 24px; right: 24px;
    width: 28px; height: 28px;
    border-radius: 50%;
    background: transparent;
    border: 1px solid rgba(45,125,45,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    color: #4caf50;
    transition: background 0.2s, border-color 0.2s;
  }

  .kh-cat-card:hover .kh-cat-arrow {
    background: #2d7d2d;
    border-color: #2d7d2d;
    color: #fff;
  }

  /* ═══════════════════════════════════════════
     FEATURED PRODUCTS
  ═══════════════════════════════════════════ */
  .kh-featured-bg {
    background: #f7f4ef;
    position: relative;
    overflow: hidden;
  }

  .kh-featured-bg::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, transparent, #4caf50 30%, #a5d6a7 60%, transparent);
  }

  .kh-product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }

  /* ═══════════════════════════════════════════
     FEATURE CARDS (why choose)
  ═══════════════════════════════════════════ */
  .kh-features-bg {
    background: #0f2610;
    position: relative;
    overflow: hidden;
  }

  .kh-features-bg::before {
    content: '';
    position: absolute;
    top: -200px; left: 50%;
    transform: translateX(-50%);
    width: 800px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(76,175,80,0.10) 0%, transparent 70%);
    pointer-events: none;
  }

  .kh-features-bg .kh-sec-title { color: #e8f5e9; }
  .kh-features-bg .kh-sec-desc  { color: #6b9b6b; }

  .kh-feat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
  }

  .kh-feat-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(76,175,80,0.14);
    border-radius: 24px;
    padding: 32px 28px;
    transition: background 0.22s, border-color 0.22s, transform 0.22s;
  }

  .kh-feat-card:hover {
    background: rgba(76,175,80,0.06);
    border-color: rgba(76,175,80,0.28);
    transform: translateY(-4px);
  }

  .kh-feat-icon {
    font-size: 36px;
    margin-bottom: 20px;
    display: block;
  }

  .kh-feat-title {
    font-family: 'Playfair Display', serif;
    font-size: 19px;
    font-weight: 700;
    color: #e8f5e9;
    margin-bottom: 10px;
  }

  .kh-feat-text {
    font-size: 14px;
    color: #6b9b6b;
    line-height: 1.7;
  }

  /* ═══════════════════════════════════════════
     CTA BANNER
  ═══════════════════════════════════════════ */
  .kh-cta-section {
    background: #fff;
    padding: 80px 0;
  }

  .kh-cta-banner {
    background: #1a4d1a;
    border-radius: 32px;
    padding: 64px 48px;
    text-align: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(15,38,16,0.25);
  }

  .kh-cta-banner::before {
    content: '';
    position: absolute;
    top: -100px; right: -100px;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(76,175,80,0.2), transparent 70%);
    pointer-events: none;
  }

  .kh-cta-banner::after {
    content: '';
    position: absolute;
    bottom: -80px; left: -60px;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(255,220,150,0.12), transparent 70%);
    pointer-events: none;
  }

  .kh-cta-banner-inner {
    position: relative; z-index: 1;
  }

  .kh-cta-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 4vw, 48px);
    font-weight: 900;
    color: #fff;
    line-height: 1.1;
    margin-bottom: 18px;
    letter-spacing: -0.01em;
  }

  .kh-cta-sub {
    font-size: 16px;
    color: rgba(255,255,255,0.6);
    margin-bottom: 36px;
    max-width: 420px;
    margin-left: auto; margin-right: auto;
    line-height: 1.65;
  }

  .kh-cta-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: #fff;
    color: #1a4d1a;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 700;
    padding: 15px 32px;
    border-radius: 100px;
    text-decoration: none;
    transition: transform 0.18s, box-shadow 0.18s;
    box-shadow: 0 4px 20px rgba(0,0,0,0.18);
  }

  .kh-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.25); }

  /* ═══════════════════════════════════════════
     VIEW ALL LINK
  ═══════════════════════════════════════════ */
  .kh-view-all {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 14px; font-weight: 600;
    color: #2d7d2d;
    text-decoration: none;
    border: 1.5px solid rgba(45,125,45,0.25);
    border-radius: 100px;
    padding: 8px 18px;
    transition: background 0.18s, border-color 0.18s;
    white-space: nowrap;
  }
  .kh-view-all:hover { background: rgba(45,125,45,0.06); border-color: #4caf50; }

  /* Scroll reveal helper */
  .kh-reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .kh-reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;

const CAT_ICONS = ["🥬", "🍎", "🌾", "🧪", "🌿", "🫚", "🌽", "🌻"];
const CAT_DESCS = [
  "Crisp, farm-picked vegetables delivered within hours.",
  "Sun-ripened fruits, handpicked at their peak.",
  "Certified seeds for home and commercial cultivation.",
  "Organic and conventional fertilizers and inputs.",
];

const FEATURES = [
  { icon: "⚡", title: "Fast browsing", text: "Optimized product cards, pagination, and responsive filters help users browse without lag." },
  { icon: "📱", title: "Mobile checkout", text: "Cart, address, delivery slot, summary, and payment screens work cleanly on every screen size." },
  { icon: "🔐", title: "Secure orders", text: "JWT authentication protects cart, address, checkout, order history, and review actions end-to-end." },
];

/* ─── Scroll reveal hook ──────────────────────────────── */
function useReveal(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const els = ref.current.querySelectorAll(".kh-reveal");
    if (!window.IntersectionObserver) {
      els.forEach((el) => el.classList.add("visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─── Component ──────────────────────────────────────── */
export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const pageRef = useRef(null);
  useReveal(pageRef);

  useEffect(() => {
    const load = async () => {
      try {
        const [featuredRes, categoryRes] = await Promise.all([
          productService.getFeaturedProducts().catch(() => productService.getProducts({ limit: 8, sort: "popular" })),
          categoryService.getCategories(),
        ]);
        setFeatured(featuredRes.data?.products || featuredRes.data || []);
        setCategories(categoryRes.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fallbackCategories = ["Vegetables", "Fruits", "Seeds", "Fertilizers"].map((name, i) => ({ name, _id: name, slug: name.toLowerCase() }));
  const displayCats = (categories.length ? categories : fallbackCategories).slice(0, 8);

  return (
    <main className="kh" ref={pageRef}>
      <style>{css}</style>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section className="kh-hero">
        <div className="kh-hero-blob-a" />
        <div className="kh-hero-blob-b" />
        <div className="kh-hero-ring kh-hero-ring-1" />
        <div className="kh-hero-ring kh-hero-ring-2" />

        <div className="kh-hero-inner">
          {/* Copy */}
          <div className="kh-hero-copy">
            <div className="kh-eyebrow">
              <span className="kh-eyebrow-dot" />
              Farm to doorstep marketplace
            </div>

            <h1 className="kh-h1">
              Fresh farm produce,<br />
              <em>delivered</em> fast.
            </h1>

            <p className="kh-lead">
              Vegetables, fruits, seeds, fertilizers — browse with smart filters, buy with secure checkout, and track orders live.
            </p>

            <div className="kh-cta-row">
              <Link to="/products" className="kh-btn-primary">
                Shop now →
              </Link>
              <Link to="/register" className="kh-btn-secondary">
                Join KrishiMart
              </Link>
            </div>

            <div className="kh-stats">
              {[
                { value: "500+", label: "Fresh products" },
                { value: "4/day", label: "Delivery slots" },
                { value: "100%", label: "Secure checkout" },
              ].map((s) => (
                <div className="kh-stat" key={s.label}>
                  <div className="kh-stat-value">{s.value}</div>
                  <div className="kh-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="kh-hero-visual">
            <div className="kh-hero-img-frame">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
                alt="Green farm field at sunrise"
              />
              <div className="kh-hero-badge">
                <strong>🌿</strong>
                Organic<br />Verified
              </div>
            </div>

            <div className="kh-hero-card">
              <div className="kh-hero-card-label">Today's basket</div>
              <div className="kh-hero-card-price">{currency(1240)}</div>
              <div className="kh-hero-card-desc">Organic vegetables, fruits &amp; seeds — ready for checkout.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CATEGORIES ═══════════════════════════════════ */}
      <section className="kh-section kh-categories-bg">
        <div className="kh-container">
          <div className="kh-sec-header kh-sec-header-row kh-reveal">
            <div>
              <span className="kh-sec-eyebrow">Categories</span>
              <h2 className="kh-sec-title">Browse by agricultural need</h2>
              <p className="kh-sec-desc">Start with popular categories, then narrow down using search, rating, price, and popularity filters.</p>
            </div>
            <Link to="/products" className="kh-view-all">View all →</Link>
          </div>

          <div className="kh-cat-grid">
            {displayCats.map((cat, i) => (
              <Link
                key={cat._id || cat.name}
                to={`/products?category=${cat.slug || cat._id || cat.name}`}
                className="kh-cat-card kh-reveal"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="kh-cat-arrow">→</div>
                <div className="kh-cat-icon">{CAT_ICONS[i % CAT_ICONS.length]}</div>
                <div className="kh-cat-name">{cat.name}</div>
                <div className="kh-cat-desc">{cat.description || CAT_DESCS[i % CAT_DESCS.length]}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURED PRODUCTS ════════════════════════════ */}
      <section className="kh-section kh-featured-bg">
        <div className="kh-container">
          <div className="kh-sec-header kh-sec-header-row kh-reveal">
            <div>
              <span className="kh-sec-eyebrow">Featured</span>
              <h2 className="kh-sec-title">Popular fresh picks</h2>
              <p className="kh-sec-desc">Product listing, search, and filters load quickly with paginated backend APIs — fast and frustration-free.</p>
            </div>
            <Link to="/products" className="kh-view-all">See all →</Link>
          </div>

          <div className="kh-product-grid kh-reveal">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : featured.slice(0, 8).map((product) => <ProductCard key={product._id} product={product} />)
            }
          </div>
        </div>
      </section>

      {/* ══ WHY KRISHIMART ═══════════════════════════════ */}
      <section className="kh-section kh-features-bg">
        <div className="kh-container">
          <div className="kh-sec-header kh-reveal" style={{ marginBottom: 40 }}>
            <span className="kh-sec-eyebrow">Why KrishiMart</span>
            <h2 className="kh-sec-title">Built for performance &amp; trust</h2>
            <p className="kh-sec-desc">Every screen and interaction is optimised for clarity, speed, and security.</p>
          </div>

          <div className="kh-feat-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="kh-feat-card kh-reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="kh-feat-icon">{f.icon}</span>
                <div className="kh-feat-title">{f.title}</div>
                <div className="kh-feat-text">{f.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ═══════════════════════════════════ */}
      <section className="kh-cta-section">
        <div className="kh-container">
          <div className="kh-cta-banner kh-reveal">
            <div className="kh-cta-banner-inner">
              <h2 className="kh-cta-title">Start shopping fresh<br />farm products today</h2>
              <p className="kh-cta-sub">Create a free account and enjoy fast delivery, live order tracking, and curated farm produce.</p>
              <Link to="/register" className="kh-cta-btn">
                Create free account →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}