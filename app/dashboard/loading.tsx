const shimmer =
  "animate-shimmer rounded-lg bg-linear-to-r from-border/60 via-border to-border/60 bg-size-[200%_100%]";

export default function DashboardLoading() {
  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-4 sm:px-6" role="status" aria-label="Loading your notes">
      <div className="hidden w-68 shrink-0 flex-col gap-3 py-8 pr-5 md:flex">
        <div className={`h-4 w-24 ${shimmer}`} />
        <div className={`h-9 ${shimmer}`} />
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={`h-11 ${shimmer}`} />
        ))}
      </div>
      <div className="flex-1 py-10">
        <div className={`h-12 w-64 ${shimmer}`} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`h-44 rounded-3xl ${shimmer}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
