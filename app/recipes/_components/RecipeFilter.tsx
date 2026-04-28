'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRef } from 'react'
import { Input } from '@/components/ui/input'

export default function RecipeFilter({
  allTags,
  activeTag,
  activeQ,
}: {
  allTags: string[]
  activeTag: string
  activeQ: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, val] of Object.entries(updates)) {
      if (val) params.set(key, val)
      else params.delete(key)
    }
    const qs = params.toString()
    router.push(qs ? `/recipes?${qs}` : '/recipes')
  }

  function handleSearch(value: string) {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      updateParams({ q: value || null })
    }, 300)
  }

  function toggleTag(tag: string) {
    updateParams({ tag: activeTag === tag ? null : tag })
  }

  if (allTags.length === 0 && !activeQ && !activeTag) return null

  return (
    <div className="space-y-3 mb-6">
      <Input
        placeholder="Search recipes…"
        defaultValue={activeQ}
        onChange={e => handleSearch(e.target.value)}
        className="max-w-sm"
      />
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={[
                'px-3 py-1 rounded-full text-xs font-medium transition-all border',
                activeTag === tag
                  ? 'text-[#F1F0EA] border-transparent'
                  : 'text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground',
              ].join(' ')}
              style={
                activeTag === tag
                  ? { background: 'linear-gradient(135deg, #2D232E 0%, #474448 100%)' }
                  : {}
              }
            >
              {tag}
            </button>
          ))}
          {(activeTag || activeQ) && (
            <button
              type="button"
              onClick={() => updateParams({ tag: null, q: null })}
              className="px-3 py-1 rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}
