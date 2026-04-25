// src/components/ProductCard.jsx
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <div className="border p-4 rounded shadow">
      <img src={product.image} className="h-40 w-full object-cover" />
      <h2 className="font-bold mt-2">{product.name}</h2>
      <p>৳ {product.price}</p>

      <Link
        to={`/product/${product._id}`}
        className="bg-green-500 text-white px-3 py-1 mt-2 inline-block"
      >
        View
      </Link>
    </div>
  );
}