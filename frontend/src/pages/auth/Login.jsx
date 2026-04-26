import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/helpers";

/* Shared auth CSS — in a real project extract to src/styles/auth.css */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Instrument+Sans:wght@400;500;600&display=swap');

  .au * { box-sizing: border-box; }
  .au {
    font-family: 'Instrument Sans', sans-serif;
    display: flex;
    min-height: 100vh;
    background: #f9f8f6;
    color: #0d0d0d;
  }
  .au-panel {
    display: none;
    width: 50%;
    background: #0d0d0d;
    padding: 64px 56px;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }
  @media (min-width: 1024px) { .au-panel { display: flex; } }
  .au-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }
  .au-panel::after {
    content: '';
    position: absolute;
    width: 480px; height: 480px;
    border-radius: 50%;
    border: 1px solid rgba(163,230,53,0.12);
    bottom: -160px; right: -120px;
    pointer-events: none;
  }
  .au-brand {
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #a3e635;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .au-brand::before { content: ''; width: 20px; height: 1px; background: #a3e635; }
  .au-panel-copy { position: relative; z-index: 1; }
  .au-panel-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(36px, 3.5vw, 52px);
    font-weight: 800;
    color: #fff;
    line-height: 1.05;
    letter-spacing: -0.03em;
    margin: 0 0 20px;
  }
  .au-panel-title span { color: #a3e635; }
  .au-panel-desc { font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.4); max-width: 380px; }
  .au-tags { display: flex; flex-wrap: wrap; gap: 8px; position: relative; z-index: 1; }
  .au-tag {
    font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
    padding: 8px 16px; border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.6); backdrop-filter: blur(4px);
  }
  .au-form-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 24px; }
  .au-form-box { width: 100%; max-width: 420px; }
  .au-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
    color: #a3e635; margin-bottom: 16px;
  }
  .au-eyebrow::before { content: ''; width: 16px; height: 1px; background: #a3e635; }
  .au-form-title {
    font-family: 'Syne', sans-serif; font-size: clamp(30px, 4vw, 42px); font-weight: 800;
    color: #0d0d0d; line-height: 1.05; letter-spacing: -0.03em; margin: 0 0 40px;
  }
  .au-field-group { margin-bottom: 4px; }
  .au-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #888; margin-bottom: 8px; }
  .au-input {
    display: block; width: 100%; height: 52px; border: 1px solid #e8e6e1; background: #fff;
    font-family: 'Instrument Sans', sans-serif; font-size: 15px; font-weight: 400; color: #0d0d0d;
    padding: 0 16px; outline: none; border-radius: 0; transition: border-color 0.15s;
    -webkit-appearance: none; appearance: none;
  }
  .au-input::placeholder { color: #bbb; }
  .au-input:focus { border-color: #0d0d0d; }
  .au-error {
    font-size: 13px; font-weight: 500; color: #c0392b;
    padding: 12px 16px; background: #fdf2f2; border-left: 2px solid #c0392b; margin-bottom: 4px;
  }
  .au-btn {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    width: 100%; height: 52px; background: #0d0d0d; color: #fff;
    font-family: 'Instrument Sans', sans-serif; font-size: 14px; font-weight: 600;
    letter-spacing: 0.06em; text-transform: uppercase; border: none; cursor: pointer;
    border-radius: 0; transition: background 0.15s, transform 0.1s; margin-top: 8px;
  }
  .au-btn:hover:not(:disabled) { background: #222; }
  .au-btn:active:not(:disabled) { transform: scale(0.99); }
  .au-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .au-rule { border: none; border-top: 1px solid #e8e6e1; margin: 32px 0; }
  .au-footer-text { font-size: 13px; color: #888; text-align: center; }
  .au-link {
    font-weight: 600; color: #0d0d0d; text-decoration: none;
    border-bottom: 1px solid #0d0d0d; padding-bottom: 1px; transition: color 0.15s, border-color 0.15s;
  }
  .au-link:hover { color: #555; border-color: #555; }
  .au-stack { display: flex; flex-direction: column; gap: 16px; }
`;

/**
 * BUG FIX: Previously `navigate(user.role === "admin" ? "/admin" : "/dashboard")`
 * sent farmers to /dashboard which rendered UserDashboard.
 *
 * Now uses the full role-to-path map and respects the `from` redirect location.
 */
const getDashboardPath = (role) => {
  if (role === "admin")  return "/admin";
  if (role === "farmer") return "/dashboard/farmer";
  return "/dashboard/user";
};

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

      // If the user was redirected here from a protected page, send them back.
      // Otherwise route to their role-specific dashboard.
      const from = location.state?.from?.pathname;
      const target = from || getDashboardPath(user.role);
      navigate(target, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="au">
      <style>{css}</style>

      {/* Left panel */}
      <section className="au-panel">
        <div className="au-brand">ArgoFarm</div>
        <div className="au-panel-copy">
          <h1 className="au-panel-title">
            Welcome<br />back to<br /><span>fresh</span><br />shopping.
          </h1>
          <p className="au-panel-desc">
            Access your cart, delivery addresses, checkout, order tracking, reorders, and product reviews.
          </p>
        </div>
        <div className="au-tags">
          {["Fast search", "Secure JWT", "Mobile checkout"].map(t => (
            <div key={t} className="au-tag">{t}</div>
          ))}
        </div>
      </section>

      {/* Right / form */}
      <section className="au-form-side">
        <div className="au-form-box">
          <div className="au-eyebrow">Login</div>
          <h2 className="au-form-title">Access your<br />account</h2>

          <form onSubmit={submit} className="au-stack">
            <div className="au-field-group">
              <label className="au-label">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="au-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="au-field-group">
              <label className="au-label">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="au-input"
                placeholder="••••••••"
              />
            </div>

            {error && <div className="au-error">{error}</div>}

            <button type="submit" disabled={loading} className="au-btn">
              {loading ? "Logging in…" : "Login →"}
            </button>
          </form>

          <hr className="au-rule" />
          <p className="au-footer-text">
            No account?{" "}
            <Link to="/register" className="au-link">Create one</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
