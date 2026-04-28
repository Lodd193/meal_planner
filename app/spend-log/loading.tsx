export default function SpendLogLoading() {
  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-28 bg-muted animate-pulse rounded" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-28 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded-md" />
        </div>
      </div>
      <div className="rounded-lg border p-5 h-56 bg-muted animate-pulse" />
      <div className="rounded-lg border p-4 flex justify-between items-center">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="h-8 w-20 bg-muted animate-pulse rounded" />
      </div>
      <div className="rounded-lg border bg-card p-5 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 bg-muted animate-pulse rounded" />
        ))}
      </div>
      <div className="divide-y divide-border rounded-lg border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <div className="space-y-1.5">
              <div className="h-4 w-40 bg-muted animate-pulse rounded" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-5 w-14 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    </main>
  )
}
