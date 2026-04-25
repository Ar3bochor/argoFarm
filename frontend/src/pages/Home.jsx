// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as productService from "../services/productService";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getProducts();
        setProducts(res?.data || []);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-green-600 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Fresh from Farm to Your Door
        </h1>
        <p className="text-lg md:text-xl mb-6">
          Buy organic, healthy, and locally grown products directly from farmers.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
        >
          Shop Now
        </button>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 grid md:grid-cols-3 gap-8 text-center">
        <div className="p-6 bg-white rounded-2xl shadow">
          <h3 className="text-xl font-semibold mb-2">100% Organic</h3>
          <p>All products are grown without harmful chemicals.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow">
          <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
          <p>Get fresh produce delivered quickly to your home.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow">
          <h3 className="text-xl font-semibold mb-2">Trusted Farmers</h3>
          <p>We connect you directly with verified local farmers.</p>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 px-6">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Featured Products
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {loading ? (
            <p className="col-span-full text-center text-gray-500">
              Loading products...
            </p>
          ) : products.length > 0 ? (
            products.map((p) => <ProductCard key={p._id} product={p} />)
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No products found.
            </p>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-700 text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Join the Agro Revolution 🌱
        </h2>
        <p className="mb-6">Support farmers and eat healthy every day.</p>
        <button
          onClick={() => navigate("/register")}
          className="bg-white text-green-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
        >
          Get Started
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 text-center">
        <p>© {new Date().getFullYear()} KrishiMart. All rights reserved.</p>
      </footer>
    </div>
  );
}