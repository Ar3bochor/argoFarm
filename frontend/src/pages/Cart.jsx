/**
 * Cart Page
 * ─────────
 * Uses Feature 5 (CartQuantityFeature) to provide the full cart management
 * experience with quantity updates, item removal, and order summary.
 */
import { PageLoader } from "../components/Loader";
import useCart from "../hooks/useCart";

// Feature 5: Cart Quantity Management
import CartQuantityFeature from "../features/CartQuantityFeature";

export default function Cart() {
  const { loading, cart } = useCart();
  const items = cart?.items || [];

  if (loading && !items.length) return <PageLoader label="Loading your cart..." />;

  return (
    <main className="page-shell">
      {/* Feature 5: Full cart management with quantity controls */}
      <CartQuantityFeature />
    </main>
  );
}
