export default function PlannerLoading() {
  return (
    <main className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-muted animate-pulse rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-muted animate-pulse rounded-md" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-5 flex items-center justify-center">
            <div className="h-3 w-4 bg-muted animate-pulse rounded" />
          </div>
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
      <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
    </main>
  )
}
