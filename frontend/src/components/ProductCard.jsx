import { Link, useNavigate } from "react-router-dom";
import RatingStars from "./RatingStars";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import { currency, productImage } from "../utils/helpers";

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const price = product.discountPrice || product.price;

  const handleAdd = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) return navigate("/login");
    await addItem(product._id, 1);
  };

  return (
    <Link to={`/products/${product._id}`} className="group overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="relative h-48 overflow-hidden bg-leaf-50">
        <img src={productImage(product)} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-leaf-700 shadow-sm backdrop-blur">
          {product.category?.name || "Fresh"}
        </span>
        {product.stock <= 5 && (
          <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Low stock
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-1 text-lg font-black text-slate-900">{product.name}</h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Per {product.unit || "item"}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-leaf-700">{currency(price)}</p>
            {product.discountPrice && <p className="text-xs text-slate-400 line-through">{currency(product.price)}</p>}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <RatingStars value={product.averageRating} count={product.numReviews} />
          <span className="text-xs font-semibold text-slate-400">Sold {product.sold || 0}</span>
        </div>
        <button onClick={handleAdd} disabled={!product.stock} className="mt-5 w-full rounded-2xl bg-leaf-600 px-4 py-3 text-sm font-black text-white transition hover:bg-leaf-700 disabled:cursor-not-allowed disabled:bg-slate-300">
          {product.stock ? "Add to cart" : "Out of stock"}
        </button>
      </div>
    </Link>
  );
}
