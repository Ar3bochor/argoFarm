// src/pages/auth/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Account Info", "Credentials", "Done"];

  const getStep = () => {
    if (formData.name && formData.email) return 1;
    if (formData.name) return 0;
    return 0;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #14532d 0%, #16a34a 60%, #4ade80 100%)" }}
      >
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="absolute bottom-20 -right-10 w-64 h-64 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }} />

        <div className="relative z-10">
          <span className="text-white text-3xl font-black tracking-tight">KrishiMart 🌾</span>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-white text-5xl font-black leading-tight">
            Join the<br />Revolution 🌱
          </h2>
          <p className="text-green-100 text-lg leading-relaxed max-w-sm">
            Support local farmers, eat healthier, and make a real difference in your community.
          </p>

          {/* Benefits */}
          <div className="space-y-3 pt-2">
            {[
              "Free delivery on your first order",
              "Access to 500+ verified farmers",
              "Weekly fresh produce boxes",
              "Exclusive member discounts",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 111.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-green-100 text-sm">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-green-200 text-sm">
          Already a member?{" "}
          <Link to="/login" className="text-white font-semibold underline">
            Sign in here
          </Link>
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
              <h1 className="text-3xl font-black text-gray-900 mb-2">Create account</h1>
              <p className="text-gray-500">Start your farm-fresh journey today</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-gray-900 placeholder-gray-400"
                />
              </div>

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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-gray-900 placeholder-gray-400"
                />
                {/* Password match indicator */}
                {formData.confirmPassword && (
                  <p className={`mt-1.5 text-xs font-medium ${
                    formData.password === formData.confirmPassword
                      ? "text-green-600"
                      : "text-red-500"
                  }`}>
                    {formData.password === formData.confirmPassword
                      ? "✓ Passwords match"
                      : "✗ Passwords don't match"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5 active:translate-y-0 text-base mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-green-600 font-semibold hover:text-green-700">
                Sign in
              </Link>
            </p>

            <p className="mt-4 text-center text-xs text-gray-400">
              By creating an account, you agree to our{" "}
              <a href="#" className="underline hover:text-gray-600">Terms</a> and{" "}
              <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}