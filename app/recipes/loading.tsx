export default function RecipesLoading() {
  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        <div className="flex gap-2">
          <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
          <div className="h-9 w-28 bg-muted animate-pulse rounded-md" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-5 space-y-3">
            <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
            <div className="flex gap-2 pt-1">
              <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
              <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
