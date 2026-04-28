'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ShoppingItem } from '../page'

const CATEGORY_ORDER = [
  'produce', 'vegetable', 'fruit',
  'meat', 'poultry', 'fish', 'seafood',
  'dairy', 'egg',
  'bakery', 'bread',
  'pantry', 'grain', 'pasta', 'rice', 'canned',
  'frozen',
  'drink', 'beverage',
  'snack', 'condiment', 'spice', 'herb',
]

function categoryRank(cat: string | null): number {
  if (!cat) return 999
  const lower = cat.toLowerCase()
  const idx = CATEGORY_ORDER.findIndex(c => lower.includes(c))
  return idx === -1 ? 500 : idx
}

function formatQty(n: number): string {
  if (Number.isInteger(n)) return String(n)
  const rounded = Math.round(n * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

type CustomItem = ShoppingItem & { isCustom: true }

export default function ShoppingList({
  items,
  generatedFromDays,
}: {
  items: ShoppingItem[]
  generatedFromDays: number
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [customItems, setCustomItems] = useState<CustomItem[]>([])
  const [name, setName] = useState('')
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState('')

  const allItems: (ShoppingItem | CustomItem)[] = [...items, ...customItems]
  const checkedCount = allItems.filter(i => checked.has(i.id)).length
  const remaining = allItems.length - checkedCount

  function toggle(id: string) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function removeCustom(id: string) {
    setCustomItems(prev => prev.filter(i => i.id !== id))
    setChecked(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function addItem() {
    if (!name.trim()) return
    const id = `custom-${Date.now()}`
    setCustomItems(prev => [...prev, {
      id,
      name: name.trim(),
      quantity: parseFloat(qty) || 1,
      unit: unit.trim() || 'item',
      category: null,
      isCustom: true,
    }])
    setName('')
    setQty('')
    setUnit('')
  }

  const catMap = new Map<string, (ShoppingItem | CustomItem)[]>()
  for (const item of allItems) {
    const cat = item.category ?? 'Other'
    if (!catMap.has(cat)) catMap.set(cat, [])
    catMap.get(cat)!.push(item)
  }
  const sortedCats = [...catMap.entries()].sort(([a], [b]) => categoryRank(a) - categoryRank(b))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Shopping List</h1>
          {allItems.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-0.5">
              No items — add some below or log meals with recipes
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mt-0.5">
                {remaining} of {allItems.length} item{allItems.length !== 1 ? 's' : ''} remaining
              </p>
              {generatedFromDays > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Generated from your last {generatedFromDays} days
                </p>
              )}
            </>
          )}
        </div>
        {checkedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChecked(new Set())}
            className="text-muted-foreground shrink-0"
          >
            Uncheck all
          </Button>
        )}
      </div>

      {allItems.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Log meals with recipes in your diary to auto-populate your shopping list.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {sortedCats.map(([cat, catItems]) => (
            <div key={cat}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">
                {cat}
              </p>
              <div className="space-y-1">
                {catItems.map(item => {
                  const isChecked = checked.has(item.id)
                  const isCustom = 'isCustom' in item
                  return (
                    <div key={item.id} className="flex items-center gap-1">
                      <button
                        onClick={() => toggle(item.id)}
                        className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          isChecked ? 'bg-muted/40' : 'bg-card hover:bg-muted/50'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isChecked ? 'bg-primary border-primary' : 'border-input'
                        }`}>
                          {isChecked && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-primary-foreground">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className={`flex-1 text-sm font-medium capitalize ${isChecked ? 'line-through text-muted-foreground' : ''}`}>
                          {item.name}
                        </span>
                        <span className={`text-xs shrink-0 ${isChecked ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                          {formatQty(item.quantity)} {item.unit}
                        </span>
                      </button>
                      {isCustom && (
                        <button
                          onClick={() => removeCustom(item.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded"
                          aria-label="Remove item"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="font-medium mb-3">Add item</h2>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Input
            placeholder="Item name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            className="flex-1 min-w-40"
          />
          <Input
            placeholder="Qty"
            value={qty}
            onChange={e => setQty(e.target.value)}
            className="w-20"
            type="number"
            min="0"
            step="any"
          />
          <Input
            placeholder="Unit"
            value={unit}
            onChange={e => setUnit(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            className="w-24"
          />
          <Button onClick={addItem} disabled={!name.trim()} className="shrink-0">
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}
