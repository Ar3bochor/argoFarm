import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RatingStars from "./RatingStars";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import { currency, productImage } from "../utils/helpers";

const cardCss = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');

  @keyframes kpc-pop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.18); }
    100% { transform: scale(1); }
  }
  @keyframes kpc-check {
    0%   { opacity: 0; transform: scale(0.4) rotate(-10deg); }
    60%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes kpc-ripple {
    0%   { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(3.5); opacity: 0; }
  }
  @keyframes kpc-slide-up {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .kpc-card {
    font-family: 'DM Sans', sans-serif;
    display: flex;
    flex-direction: column;
    border-radius: 22px;
    overflow: hidden;
    background: #fff;
    border: 1px solid rgba(45,125,45,0.09);
    box-shadow: 0 2px 14px rgba(15,38,16,0.06);
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.25s ease,
                border-color 0.25s ease;
    position: relative;
  }
  .kpc-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 48px rgba(15,38,16,0.13);
    border-color: rgba(45,125,45,0.18);
  }
  .kpc-card-link,
  .kpc-image-link {
    color: inherit;
    text-decoration: none;
  }
  .kpc-card-link {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .kpc-image-link {
    display: block;
    height: 100%;
  }
  .kpc-img-wrap {
    position: relative;
    height: 192px;
    overflow: hidden;
    background: #f0f7ef;
  }
  .kpc-img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94);
    display: block;
  }
  .kpc-card:hover .kpc-img { transform: scale(1.07); }
  .kpc-img-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 40%);
    pointer-events: none;
  }
  .kpc-cat {
    position: absolute; top: 12px; left: 12px;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(45,125,45,0.15);
    border-radius: 100px; padding: 4px 11px;
    font-size: 11px; font-weight: 600; color: #2d7d2d;
    letter-spacing: 0.02em;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }
  .kpc-badge {
    position: absolute; top: 12px; right: 12px;
    border-radius: 100px; padding: 4px 10px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.02em;
  }
  .kpc-badge-stock  { background: rgba(255,237,180,0.95); color: #92610a; border: 1px solid rgba(180,130,0,0.15); }
  .kpc-badge-discount { background: rgba(220,68,68,0.9); color: #fff; border: 1px solid rgba(180,40,40,0.1); }
  .kpc-wish {
    position: absolute; bottom: 12px; right: 12px;
    z-index: 3;
    width: 34px; height: 34px; border-radius: 50%;
    background: rgba(255,255,255,0.9);
    border: 1px solid rgba(45,125,45,0.12);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 16px; line-height: 1;
    transition: background 0.2s, transform 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    opacity: 0; transform: scale(0.85); pointer-events: none;
  }
  .kpc-card:hover .kpc-wish { opacity: 1; transform: scale(1); pointer-events: auto; }
  .kpc-wish:hover { background: #fff0f0; transform: scale(1.12) !important; }
  .kpc-wish.active { background: #fff0f0; opacity: 1; pointer-events: auto; transform: scale(1); }
  .kpc-wish.active span { animation: kpc-pop 0.35s ease; }
  .kpc-body {
    padding: 16px 18px 18px;
    display: flex; flex-direction: column; flex: 1;
  }
  .kpc-top {
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 10px; margin-bottom: 4px;
  }
  .kpc-name {
    font-family: 'Playfair Display', serif;
    font-size: 16px; font-weight: 700; color: #0f2610;
    line-height: 1.25;
    display: -webkit-box; -webkit-line-clamp: 1;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .kpc-unit {
    font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: #9ab09a; margin-top: 3px;
  }
  .kpc-price-wrap { text-align: right; flex-shrink: 0; }
  .kpc-price {
    font-family: 'Playfair Display', serif;
    font-size: 17px; font-weight: 700; color: #1a6b1a; line-height: 1;
  }
  .kpc-price-orig { font-size: 11px; color: #b0b8b0; text-decoration: line-through; margin-top: 2px; }
  .kpc-meta {
    display: flex; align-items: center;
    justify-content: space-between; margin: 10px 0 14px;
  }
  .kpc-sold { font-size: 11px; font-weight: 600; color: #9ab09a; }
  .kpc-btn-wrap {
    position: relative; overflow: hidden;
    border-radius: 14px; margin: 0 18px 18px;
  }
  .kpc-btn {
    width: 100%; padding: 11px 16px; border-radius: 14px; border: none;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
    cursor: pointer; transition: background 0.2s, transform 0.15s;
    position: relative; overflow: hidden; letter-spacing: 0.02em;
  }
  .kpc-btn-active { background: #1a4d1a; color: #fff; box-shadow: 0 3px 14px rgba(26,77,26,0.28); }
  .kpc-btn-active:hover { background: #0f3210; transform: translateY(-1px); }
  .kpc-btn-active:active { transform: scale(0.98); }
  .kpc-btn-disabled { background: #f0f0ee; color: #b0b8b0; cursor: not-allowed; }
  .kpc-btn-ripple {
    position: absolute; border-radius: 50%;
    background: rgba(255,255,255,0.35);
    width: 20px; height: 20px;
    margin-left: -10px; margin-top: -10px;
    pointer-events: none;
    animation: kpc-ripple 0.55s ease-out forwards;
  }
  .kpc-btn-added {
    background: #e8f5e9; color: #2d7d2d;
    border: 1.5px solid rgba(45,125,45,0.2); cursor: default;
  }
  .kpc-btn-added-inner {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    animation: kpc-slide-up 0.3s ease;
  }
  .kpc-check { display: inline-block; animation: kpc-check 0.35s cubic-bezier(0.34,1.56,0.64,1); }
  .kpc-img-wrap.oos::after {
    content: ''; position: absolute; inset: 0;
    background: rgba(255,255,255,0.4);
    pointer-events: none;
  }
`;


export default function ProductCard({ product }) {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const [ripple, setRipple] = useState(null);

  const price = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.stock || authLoading) return;

    let activeUser = user;
    if (!activeUser && localStorage.getItem("token")) {
      activeUser = await refreshUser();
    }

    if (!activeUser) {
      navigate("/login");
      return;
    }

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

  const handleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWished((v) => !v);
  };

  return (
    <>
      <style>{cardCss}</style>
      <article className="kpc-card">
        <div className={`kpc-img-wrap${!product.stock ? " oos" : ""}`}>
          <Link
            to={`/products/${product._id}`}
            className="kpc-image-link"
            aria-label={`View details for ${product.name}`}
          >
            <img src={productImage(product)} alt={product.name} className="kpc-img" />
            <div className="kpc-img-overlay" />
            <span className="kpc-cat">{product.category?.name || "Fresh"}</span>
            {hasDiscount && <span className="kpc-badge kpc-badge-discount">−{discountPct}%</span>}
            {!hasDiscount && product.stock > 0 && product.stock <= 5 && (
              <span className="kpc-badge kpc-badge-stock">Low stock</span>
            )}
          </Link>
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
                {hasDiscount && <div className="kpc-price-orig">{currency(product.price)}</div>}
              </div>
            </div>

            <div className="kpc-meta">
              <RatingStars value={product.averageRating} count={product.numReviews} />
              <span className="kpc-sold">{product.sold > 0 ? `${product.sold} sold` : "New"}</span>
            </div>
          </div>
        </Link>

        <div className="kpc-btn-wrap">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.stock || authLoading}
            className={`kpc-btn ${
              !product.stock ? "kpc-btn-disabled" : added ? "kpc-btn-added" : "kpc-btn-active"
            }`}
          >
            {ripple && (
              <span className="kpc-btn-ripple" style={{ left: ripple.x, top: ripple.y }} />
            )}
            {!product.stock ? (
              "Out of stock"
            ) : added ? (
              <span className="kpc-btn-added-inner">
                <span className="kpc-check">✓</span>Added to cart!
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
