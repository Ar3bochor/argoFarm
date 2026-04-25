// src/pages/auth/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #14532d 0%, #16a34a 60%, #4ade80 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20"
          style={{ background: "rgba(255,255,255,0.15)" }} />
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full opacity-10"
          style={{ background: "rgba(255,255,255,0.2)" }} />
        <div className="absolute top-1/2 -right-10 w-40 h-40 rounded-full opacity-15"
          style={{ background: "rgba(255,255,255,0.25)" }} />

        <div className="relative z-10">
          <span className="text-white text-3xl font-black tracking-tight">KrishiMart 🌾</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-white text-5xl font-black leading-tight mb-6">
            Fresh.<br />Local.<br />Honest.
          </h2>
          <p className="text-green-100 text-lg leading-relaxed max-w-sm">
            Connect directly with farmers and get the freshest organic produce delivered to your door.
          </p>
        </div>

        <div className="relative z-10 flex gap-8">
          <div>
            <p className="text-white text-3xl font-black">500+</p>
            <p className="text-green-200 text-sm">Farmers</p>
          </div>
          <div>
            <p className="text-white text-3xl font-black">10k+</p>
            <p className="text-green-200 text-sm">Happy Customers</p>
          </div>
          <div>
            <p className="text-white text-3xl font-black">100%</p>
            <p className="text-green-200 text-sm">Organic</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <span className="text-green-600 text-2xl font-black">KrishiMart 🌾</span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome back</h1>
              <p className="text-gray-500">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <a href="#" className="text-sm text-green-600 hover:text-green-700 font-medium">
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-gray-900 placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5 active:translate-y-0 text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-green-600 font-semibold hover:text-green-700">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}