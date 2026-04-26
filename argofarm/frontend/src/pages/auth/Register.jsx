import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/helpers";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Instrument+Sans:wght@400;500;600&display=swap');
  .au * { box-sizing: border-box; }
  .au { font-family: 'Instrument Sans', sans-serif; display: flex; min-height: 100vh; background: #f9f8f6; color: #0d0d0d; }
  .au-panel { display: none; width: 50%; background: #0d0d0d; padding: 64px 56px; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; }
  @media (min-width: 1024px) { .au-panel { display: flex; } }
  .au-panel::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; }
  .au-panel::after { content: ''; position: absolute; width: 480px; height: 480px; border-radius: 50%; border: 1px solid rgba(163,230,53,0.12); bottom: -160px; right: -120px; pointer-events: none; }
  .au-brand { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: #a3e635; position: relative; z-index: 1; display: flex; align-items: center; gap: 10px; }
  .au-brand::before { content: ''; width: 20px; height: 1px; background: #a3e635; }
  .au-panel-copy { position: relative; z-index: 1; }
  .au-panel-title { font-family: 'Syne', sans-serif; font-size: clamp(36px, 3.5vw, 52px); font-weight: 800; color: #fff; line-height: 1.05; letter-spacing: -0.03em; margin: 0 0 20px; }
  .au-panel-title span { color: #a3e635; }
  .au-panel-desc { font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.4); max-width: 380px; }
  .au-panel-card { position: relative; z-index: 1; border: 1px solid rgba(255,255,255,0.08); padding: 28px; backdrop-filter: blur(4px); }
  .au-panel-card-icon { font-size: 28px; margin-bottom: 14px; display: block; }
  .au-panel-card-text { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #fff; line-height: 1.3; }
  .au-panel-card-sub { margin-top: 8px; font-size: 13px; color: rgba(255,255,255,0.35); line-height: 1.5; }
  .au-form-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 24px; }
  .au-form-box { width: 100%; max-width: 440px; }
  .au-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #a3e635; margin-bottom: 16px; }
  .au-eyebrow::before { content: ''; width: 16px; height: 1px; background: #a3e635; }
  .au-form-title { font-family: 'Syne', sans-serif; font-size: clamp(30px, 4vw, 42px); font-weight: 800; color: #0d0d0d; line-height: 1.05; letter-spacing: -0.03em; margin: 0 0 40px; }
  .au-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #888; margin-bottom: 8px; }
  .au-input { display: block; width: 100%; height: 52px; border: 1px solid #e8e6e1; background: #fff; font-family: 'Instrument Sans', sans-serif; font-size: 15px; color: #0d0d0d; padding: 0 16px; outline: none; border-radius: 0; transition: border-color 0.15s; -webkit-appearance: none; appearance: none; }
  .au-input::placeholder { color: #bbb; }
  .au-input:focus { border-color: #0d0d0d; }
  .au-error { font-size: 13px; font-weight: 500; color: #c0392b; padding: 12px 16px; background: #fdf2f2; border-left: 2px solid #c0392b; }
  .au-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 52px; background: #0d0d0d; color: #fff; font-family: 'Instrument Sans', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; border: none; cursor: pointer; border-radius: 0; transition: background 0.15s, transform 0.1s; }
  .au-btn:hover:not(:disabled) { background: #222; }
  .au-btn:active:not(:disabled) { transform: scale(0.99); }
  .au-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .au-rule { border: none; border-top: 1px solid #e8e6e1; margin: 32px 0; }
  .au-footer-text { font-size: 13px; color: #888; text-align: center; }
  .au-link { font-weight: 600; color: #0d0d0d; text-decoration: none; border-bottom: 1px solid #0d0d0d; padding-bottom: 1px; transition: color 0.15s, border-color 0.15s; }
  .au-link:hover { color: #555; border-color: #555; }
  .au-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .au-col-2 { grid-column: span 2; }
  @media (max-width: 480px) { .au-grid-2 { grid-template-columns: 1fr; } .au-col-2 { grid-column: span 1; } }
  .au-role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .au-role-btn { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; padding: 14px 16px; border: 1px solid #e8e6e1; background: #fff; cursor: pointer; transition: border-color 0.15s, background 0.15s; font-family: 'Instrument Sans', sans-serif; text-align: left; }
  .au-role-btn.active { border-color: #0d0d0d; background: #0d0d0d; }
  .au-role-btn-name { font-size: 13px; font-weight: 600; color: #0d0d0d; transition: color 0.15s; }
  .au-role-btn.active .au-role-btn-name { color: #fff; }
  .au-role-btn-desc { font-size: 11px; color: #aaa; line-height: 1.4; transition: color 0.15s; }
  .au-role-btn.active .au-role-btn-desc { color: rgba(255,255,255,0.5); }
  .au-field-group { display: flex; flex-direction: column; }
  .au-stack { display: flex; flex-direction: column; gap: 16px; }
`;

/**
 * BUG FIX: navigate(user.role === "admin" ? "/admin" : "/dashboard")
 * sent farmers and users both to /dashboard which showed UserDashboard.
 */
const getDashboardPath = (role) => {
  if (role === "admin")  return "/admin";
  if (role === "farmer") return "/dashboard/farmer";
  return "/dashboard/user";
};

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
      navigate(getDashboardPath(user.role), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not create account"));
    } finally {
      setLoading(false);
    }
  };

  const change = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <main className="au">
      <style>{css}</style>

      <section className="au-panel">
        <div className="au-brand">ArgoFarm</div>
        <div className="au-panel-copy">
          <h1 className="au-panel-title">Build your<br /><span>smart</span><br />agricultural<br />basket.</h1>
          <p className="au-panel-desc">Save addresses, apply coupons, place orders securely, and review delivered products.</p>
        </div>
        <div className="au-panel-card">
          <span className="au-panel-card-icon">🌾</span>
          <div className="au-panel-card-text">Fresh, local, reliable.</div>
          <p className="au-panel-card-sub">Farm-direct produce from verified growers across Bangladesh.</p>
        </div>
      </section>

      <section className="au-form-side">
        <div className="au-form-box">
          <div className="au-eyebrow">Register</div>
          <h2 className="au-form-title">Create<br />account</h2>

          <form onSubmit={submit} className="au-stack">
            <div className="au-grid-2">
              <div className="au-field-group">
                <label className="au-label">Full name</label>
                <input required name="name" value={form.name} onChange={change} className="au-input" placeholder="Your name" />
              </div>
              <div className="au-field-group">
                <label className="au-label">Phone</label>
                <input name="phone" value={form.phone} onChange={change} className="au-input" placeholder="01XXXXXXXXX" />
              </div>
              <div className="au-field-group au-col-2">
                <label className="au-label">Email</label>
                <input required name="email" type="email" value={form.email} onChange={change} className="au-input" placeholder="you@example.com" />
              </div>
              <div className="au-field-group au-col-2">
                <label className="au-label">Password</label>
                <input required name="password" type="password" minLength="6" value={form.password} onChange={change} className="au-input" placeholder="Minimum 6 characters" />
              </div>
            </div>

            {/* Role picker — admin is excluded from self-registration intentionally */}
            <div className="au-field-group">
              <label className="au-label" style={{ marginBottom: 10 }}>Account type</label>
              <div className="au-role-grid">
                {[
                  { value: "user",   name: "Customer", desc: "Shop, track orders, leave reviews" },
                  { value: "farmer", name: "Farmer",   desc: "List produce, manage inventory" },
                ].map(r => (
                  <button
                    key={r.value}
                    type="button"
                    className={`au-role-btn${form.role === r.value ? " active" : ""}`}
                    onClick={() => setForm(p => ({ ...p, role: r.value }))}
                  >
                    <span className="au-role-btn-name">{r.name}</span>
                    <span className="au-role-btn-desc">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="au-error">{error}</div>}

            <button type="submit" disabled={loading} className="au-btn">
              {loading ? "Creating account…" : "Create account →"}
            </button>
          </form>

          <hr className="au-rule" />
          <p className="au-footer-text">
            Already registered?{" "}
            <Link to="/login" className="au-link">Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
