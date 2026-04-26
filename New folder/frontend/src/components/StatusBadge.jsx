const styles = {
  pending: "bg-amber-100 text-amber-700 ring-amber-200",
  processing: "bg-blue-100 text-blue-700 ring-blue-200",
  shipped: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  delivered: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  cancelled: "bg-rose-100 text-rose-700 ring-rose-200",
  approved: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  rejected: "bg-rose-100 text-rose-700 ring-rose-200",
  paid: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  failed: "bg-rose-100 text-rose-700 ring-rose-200"
};

export default function StatusBadge({ status = "pending" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}
