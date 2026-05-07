/**
 * Product Details Page
 * ────────────────────
 * Uses Feature 3 (ProductDetailsFeature) and Feature 4 (AddToCartFeature)
 * to provide full product viewing and cart-add experience.
 */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageLoader } from "../components/Loader";
import EmptyState from "../components/EmptyState";
import useAuth from "../hooks/useAuth";
import * as productService from "../services/productService";
import * as reviewService from "../services/reviewService";
import { getErrorMessage } from "../utils/helpers";

// Feature 3: Product Details (gallery, info, reviews)
import ProductDetailsFeature from "../features/ProductDetailsFeature";

// Feature 4: Add to Cart (quantity selector + add button)
import AddToCartFeature from "../features/AddToCartFeature";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [productRes, reviewRes] = await Promise.all([
          productService.getProductById(id),
          reviewService.getProductReviews(id).catch(() => ({ data: [] })),
        ]);
        setProduct(productRes.data?.data ?? productRes.data);
        setReviews(reviewRes.data?.reviews || reviewRes.data || []);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmitReview = async (formData) => {
    if (!user) return navigate("/login");
    setMessage("");
    try {
      await reviewService.createReview({ productId: id, ...formData });
      setMessage("Review submitted for admin moderation.");
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not submit review"));
    }
  };

  if (loading) return <PageLoader label="Loading product details..." />;
  if (!product) {
    return (
      <main className="page-shell">
        <EmptyState
          icon="🌾"
          title="Product not found"
          message="This product may be inactive or unavailable."
          actionLabel="Back to products"
          actionTo="/products"
        />
      </main>
    );
  }

  return (
    <main className="page-shell">
      {/* Feature 3: Full product details (gallery, info, reviews) */}
      <ProductDetailsFeature
        product={product}
        reviews={reviews}
        onSubmitReview={handleSubmitReview}
      />

      {/* Feature 4: Add to Cart (between info and reviews) */}
      <div className="mt-8 max-w-xl">
        <AddToCartFeature product={product} />
      </div>

      {/* Review submission feedback */}
      {message && (
        <p className="mt-4 rounded-2xl bg-leaf-50 p-4 text-sm font-bold text-leaf-700">
          {message}
        </p>
      )}
    </main>
  );
}
