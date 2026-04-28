export default function ShoppingListLoading() {
  return (
    <main className="p-4 sm:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-36 bg-muted animate-pulse rounded" />
        <div className="h-4 w-40 bg-muted animate-pulse rounded" />
      </div>
      {Array.from({ length: 3 }).map((_, g) => (
        <div key={g} className="space-y-2">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          {Array.from({ length: 3 + g }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      ))}
    </main>
  )
}
