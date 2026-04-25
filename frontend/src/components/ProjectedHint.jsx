import { Link } from "react-router-dom";

export default function ProtectedHint({ title = "Login required", message = "Please login to continue." }) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-soft ring-1 ring-leaf-100">
      <div className="text-5xl">🔐</div>
      <h1 className="mt-4 text-3xl font-black text-slate-950">{title}</h1>
      <p className="mt-3 text-slate-500">{message}</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/login" className="btn-primary">Login</Link>
        <Link to="/register" className="btn-outline">Create account</Link>
      </div>
    </div>
  );
}
