import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/helpers";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not create account"));
    } finally {
      setLoading(false);
    }
  };

  const change = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <main className="auth-shell">
      <section className="auth-panel hidden lg:flex">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-leaf-100">Join KrishiMart</p>
          <h1 className="mt-6 text-6xl font-black leading-tight">Build your smart agricultural basket.</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-leaf-100">Create an account to save addresses, apply coupons, place orders securely, and review delivered products.</p>
        </div>
        <div className="rounded-[2rem] bg-white/10 p-6 backdrop-blur"><p className="text-4xl">🌾</p><p className="mt-3 font-bold">Fresh, local, reliable.</p></div>
      </section>
      <section className="flex min-h-[calc(100vh-76px)] items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-slate-100">
          <p className="eyebrow">Register</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Create account</h2>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="field-label">Name<input required name="name" value={form.name} onChange={change} className="field" placeholder="Your full name" /></label>
            <label className="field-label">Email<input required name="email" type="email" value={form.email} onChange={change} className="field" placeholder="you@example.com" /></label>
            <label className="field-label">Phone<input name="phone" value={form.phone} onChange={change} className="field" placeholder="01XXXXXXXXX" /></label>
            <label className="field-label">Password<input required name="password" type="password" minLength="6" value={form.password} onChange={change} className="field" placeholder="Minimum 6 characters" /></label>
            <label className="field-label">Account type<select name="role" value={form.role} onChange={change} className="field"><option value="user">Customer</option><option value="farmer">Farmer</option></select></label>
            {error && <p className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}
            <button disabled={loading} className="btn-primary w-full justify-center py-4 disabled:opacity-60">{loading ? "Creating..." : "Create account"}</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">Already registered? <Link to="/login" className="font-black text-leaf-700">Login</Link></p>
        </div>
      </section>
    </main>
  );
}
