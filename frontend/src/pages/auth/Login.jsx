import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/helpers";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form);
      const target = location.state?.from?.pathname || (user.role === "admin" ? "/admin" : "/dashboard");
      navigate(target, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel hidden lg:flex">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-leaf-100">KrishiMart</p>
          <h1 className="mt-6 text-6xl font-black leading-tight">Welcome back to fresh shopping.</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-leaf-100">Login to access cart, delivery addresses, checkout, order tracking, reorders, and product reviews.</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {['Fast search','Secure JWT','Mobile checkout'].map((item) => <div key={item} className="rounded-3xl bg-white/10 p-4 text-sm font-bold backdrop-blur">{item}</div>)}
        </div>
      </section>
      <section className="flex min-h-[calc(100vh-76px)] items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-slate-100">
          <p className="eyebrow">Login</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Access your account</h2>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="field-label">Email<input type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="field" placeholder="you@example.com" /></label>
            <label className="field-label">Password<input type="password" required value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="field" placeholder="••••••••" /></label>
            {error && <p className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}
            <button disabled={loading} className="btn-primary w-full justify-center py-4 disabled:opacity-60">{loading ? "Logging in..." : "Login"}</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">No account? <Link to="/register" className="font-black text-leaf-700">Create one</Link></p>
        </div>
      </section>
    </main>
  );
}
