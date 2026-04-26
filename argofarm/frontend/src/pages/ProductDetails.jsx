import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import RatingStars from "../components/RatingStars";
import SectionHeader from "../components/SectionHeader";
import { PageLoader } from "../components/Loader";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import * as productService from "../services/productService";
import * as reviewService from "../services/reviewService";
import { currency, getErrorMessage, productImage } from "../utils/helpers";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [productRes, reviewRes] = await Promise.all([
          productService.getProductById(id),
          reviewService.getProductReviews(id).catch(() => ({ data: [] }))
        ]);
        setProduct(productRes.data);
        setReviews(reviewRes.data || []);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const addToCart = async () => {
    if (!user) return navigate("/login");
    setMessage("");
    try {
      await addItem(product._id, qty);
      setMessage("Added to cart successfully.");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    setMessage("");
    try {
      await reviewService.createReview({ productId: id, ...reviewForm });
      setReviewForm({ rating: 5, title: "", comment: "" });
      setMessage("Review submitted for admin moderation.");
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not submit review"));
    }
  };

  if (loading) return <PageLoader label="Loading product details..." />;
  if (!product) return <main className="page-shell"><EmptyState icon="🌾" title="Product not found" message="This product may be inactive or unavailable." actionLabel="Back to products" actionTo="/products" /></main>;

  const price = product.discountPrice || product.price;

  return (
    <main className="page-shell">
      <div className="mb-6 text-sm font-bold text-slate-500"><Link to="/products" className="text-leaf-700">Products</Link> / {product.name}</div>
      <section className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <div className="rounded-[2rem] bg-white p-4 shadow-soft ring-1 ring-slate-100">
          <img src={productImage(product)} alt={product.name} className="h-[420px] w-full rounded-[1.5rem] object-cover" />
          {product.images?.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.slice(0, 4).map((img) => <img key={img} src={img} alt="Product preview" className="h-24 rounded-2xl object-cover" />)}
            </div>
          )}
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-100 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-leaf-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-leaf-700">{product.category?.name || "Fresh"}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">Stock {product.stock}</span>
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{product.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <RatingStars value={product.averageRating} count={product.numReviews} />
            <span className="text-sm font-semibold text-slate-400">Sold {product.sold || 0}</span>
            <span className="text-sm font-semibold text-slate-400">Views {product.views || 0}</span>
          </div>
          <p className="mt-6 text-4xl font-black text-leaf-700">{currency(price)} <span className="text-base font-bold text-slate-400">/ {product.unit}</span></p>
          {product.discountPrice && <p className="mt-1 text-sm text-slate-400 line-through">Regular {currency(product.price)}</p>}
          <p className="mt-6 leading-8 text-slate-600">{product.description}</p>
          {product.tags?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {product.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">#{tag}</span>)}
            </div>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <button onClick={() => setQty((v) => Math.max(1, v - 1))} className="px-5 py-3 text-xl font-black text-slate-600">−</button>
              <input value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} className="w-16 border-x border-slate-100 text-center font-black outline-none" />
              <button onClick={() => setQty((v) => Math.min(product.stock || 99, v + 1))} className="px-5 py-3 text-xl font-black text-slate-600">+</button>
            </div>
            <button onClick={addToCart} disabled={!product.stock} className="btn-primary flex-1 justify-center py-4 disabled:opacity-50">Add to cart</button>
          </div>
          {message && <p className="mt-4 rounded-2xl bg-leaf-50 p-4 text-sm font-bold text-leaf-700">{message}</p>}
        </div>
      </section>

      <section className="mt-16 grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-slate-100">
          <SectionHeader eyebrow="Reviews" title="Write a review" description="Only customers with delivered orders can submit reviews. New reviews wait for admin approval." />
          <form onSubmit={submitReview} className="space-y-4">
            <label className="field-label">Rating
              <select value={reviewForm.rating} onChange={(e) => setReviewForm((p) => ({ ...p, rating: Number(e.target.value) }))} className="field">
                {[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
              </select>
            </label>
            <label className="field-label">Title<input value={reviewForm.title} onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value }))} className="field" placeholder="Great quality" /></label>
            <label className="field-label">Comment<textarea required value={reviewForm.comment} onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))} className="field min-h-28" placeholder="Share your experience" /></label>
            <button className="btn-primary w-full">Submit review</button>
          </form>
        </div>
        <div>
          <SectionHeader eyebrow="Customer voice" title="Approved reviews" />
          <div className="space-y-4">
            {reviews.length ? reviews.map((review) => (
              <div key={review._id} className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-100">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-black text-slate-900">{review.title || "Product review"}</p>
                    <p className="text-sm text-slate-400">by {review.user?.name || "Customer"}</p>
                  </div>
                  <RatingStars value={review.rating} compact />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{review.comment}</p>
              </div>
            )) : <EmptyState icon="⭐" title="No approved reviews yet" message="Be the first customer to review this product after delivery." />}
          </div>
        </div>
      </section>
    </main>
  );
}
