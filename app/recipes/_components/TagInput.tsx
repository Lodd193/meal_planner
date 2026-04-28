'use client'
import { useState, useRef, KeyboardEvent } from 'react'
import { Label } from '@/components/ui/label'

const SUGGESTIONS = [
  'Vegetarian', 'Vegan', 'High Protein', 'Quick', 'Dairy-free',
  'Gluten-free', 'Low Carb', 'Budget', 'Meal Prep', 'Comfort Food',
]

export default function TagInput({
  tags,
  onChange,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
}) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(tag: string) {
    const t = tag.trim()
    if (t && !tags.includes(t)) onChange([...tags, t])
    setInput('')
  }

  function removeTag(tag: string) {
    onChange(tags.filter(t => t !== tag))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length) {
      removeTag(tags[tags.length - 1])
    }
  }

  const suggestions = SUGGESTIONS.filter(s => !tags.includes(s))

  return (
    <div className="space-y-2">
      <Label>Tags</Label>
      <div
        className="flex flex-wrap gap-1.5 p-2 min-h-[40px] border rounded-md bg-background cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map(tag => (
          <span
            key={tag}
            className="flex items-center gap-1 px-2.5 py-0.5 bg-muted rounded-full text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); removeTag(tag) }}
              className="text-muted-foreground hover:text-foreground leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input.trim()) addTag(input) }}
          placeholder={tags.length ? '' : 'Type a tag and press Enter…'}
          className="flex-1 min-w-[140px] text-sm bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="px-2.5 py-0.5 border rounded-full text-xs text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
