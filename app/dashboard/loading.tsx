export default function DashboardLoading() {
  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-56 bg-muted animate-pulse rounded" />
        <div className="h-4 w-40 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-5 space-y-2">
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <div className="h-3 w-12 bg-muted animate-pulse rounded" />
              <div className="h-3 w-28 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-2 rounded-full bg-muted animate-pulse" />
          </div>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="h-9 w-36 bg-muted animate-pulse rounded-md" />
        <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
        <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
      </div>
    </main>
  )
}
