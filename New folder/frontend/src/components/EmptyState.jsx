import { Link } from "react-router-dom";

export default function EmptyState({ icon = "🌱", title, message, actionLabel, actionTo }) {
  return (
    <div className="rounded-3xl border border-dashed border-leaf-200 bg-white p-10 text-center shadow-sm">
      <div className="text-5xl">{icon}</div>
      <h3 className="mt-4 text-xl font-black text-slate-900">{title}</h3>
      {message && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary mt-6 inline-flex">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
