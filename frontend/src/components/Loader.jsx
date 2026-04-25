export const PageLoader = ({ label = "Loading fresh data..." }) => (
  <div className="mx-auto flex min-h-[45vh] w-full max-w-6xl items-center justify-center p-8">
    <div className="rounded-3xl bg-white p-8 text-center shadow-soft ring-1 ring-slate-100">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-leaf-100 border-t-leaf-600" />
      <p className="font-semibold text-slate-600">{label}</p>
    </div>
  </div>
);

export const SkeletonCard = () => (
  <div className="animate-pulse rounded-3xl bg-white p-4 shadow-card ring-1 ring-slate-100">
    <div className="h-44 rounded-2xl bg-slate-100" />
    <div className="mt-4 h-4 w-3/4 rounded bg-slate-100" />
    <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />
    <div className="mt-5 h-10 rounded-xl bg-slate-100" />
  </div>
);
