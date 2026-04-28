'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { bulkLogMeals, createQuickRecipe } from '../../recipes/actions'

type Recipe = { id: string; title: string }
type Panel = 'schedule' | 'create'
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other']

function todayLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function BulkScheduleForm({ recipes: initial }: { recipes: Recipe[] }) {
  const today = todayLocal()
  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState<Panel>('schedule')
  const [recipes, setRecipes] = useState<Recipe[]>(initial)
  const [recipeId, setRecipeId] = useState('')
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [servings, setServings] = useState('1')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function dayCount() {
    if (!startDate || !endDate) return 0
    const diff = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000) + 1
    return diff > 0 ? diff : 0
  }

  function close() { setOpen(false); setError(null); setPanel('schedule') }

  function handleSchedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('recipe_id', recipeId)
    startTransition(async () => {
      const result = await bulkLogMeals(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        close()
        setRecipeId('')
        setStartDate(today)
        setEndDate(today)
        setServings('1')
        setSuccessMsg(`✓ Logged to ${result.count} day${result.count !== 1 ? 's' : ''}`)
        setTimeout(() => setSuccessMsg(null), 4000)
      }
    })
  }

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createQuickRecipe(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.id) {
        setRecipes(prev => [...prev, { id: result.id, title: result.title }].sort((a, b) => a.title.localeCompare(b.title)))
        setRecipeId(result.id)
        setPanel('schedule')
        setError(null)
      }
    })
  }

  const days = dayCount()
  const overLimit = days > 31

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Meal Diary</h1>
        <div className="flex items-center gap-3">
          {successMsg && <p className="text-sm text-muted-foreground">{successMsg}</p>}
          {!open && (
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              Bulk schedule
            </Button>
          )}
        </div>
      </div>

      {open && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
              {panel === 'schedule' ? 'Schedule a recipe across multiple days' : 'Create a quick recipe'}
            </p>
            <button onClick={close} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>

          {panel === 'schedule' ? (
            <form key="schedule" onSubmit={handleSchedule} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="bs_recipe">Recipe</Label>
                <div className="flex gap-2">
                  <select
                    id="bs_recipe"
                    className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={recipeId}
                    onChange={e => setRecipeId(e.target.value)}
                    required
                  >
                    <option value="">Select a recipe…</option>
                    {recipes.map(r => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => { setPanel('create'); setError(null) }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    + New recipe
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bs_start">From</Label>
                  <Input id="bs_start" type="date" name="start_date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bs_end">To</Label>
                  <Input id="bs_end" type="date" name="end_date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bs_servings">Servings</Label>
                  <Input id="bs_servings" type="number" name="servings" min="0.25" step="0.25" value={servings} onChange={e => setServings(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bs_meal_type">Meal type</Label>
                  <select id="bs_meal_type" name="meal_type" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" defaultValue="meal">
                    {MEAL_TYPES.map(t => <option key={t} value={t.toLowerCase()}>{t}</option>)}
                  </select>
                </div>
              </div>

              {days > 0 && !overLimit && recipeId && (
                <p className="text-xs text-muted-foreground">
                  This will add <span className="font-semibold text-foreground">{days} {days === 1 ? 'entry' : 'entries'}</span> to your diary
                </p>
              )}
              {overLimit && <p className="text-xs text-red-500">Maximum range is 31 days</p>}
              {error && <p className="text-xs text-red-500">{error}</p>}

              <Button type="submit" disabled={isPending || !recipeId || days === 0 || overLimit} className="w-full">
                {isPending ? 'Logging…' : days > 0 && !overLimit && recipeId ? `Log to ${days} day${days !== 1 ? 's' : ''}` : 'Select recipe and dates'}
              </Button>
            </form>
          ) : (
            <form key="create" onSubmit={handleCreate} className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Enter total nutrition per serving — saved as a recipe you can reuse any time.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="qr_title">Recipe name</Label>
                <Input id="qr_title" name="title" placeholder="e.g. Instant Oats Pot" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="qr_kcal">kcal</Label>
                  <Input id="qr_kcal" name="kcal" type="number" min="0" placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="qr_protein">Protein (g)</Label>
                  <Input id="qr_protein" name="protein" type="number" min="0" step="0.1" placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="qr_carbs">Carbs (g)</Label>
                  <Input id="qr_carbs" name="carbs" type="number" min="0" step="0.1" placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="qr_fat">Fat (g)</Label>
                  <Input id="qr_fat" name="fat" type="number" min="0" step="0.1" placeholder="0" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qr_cost">Cost per serving (£)</Label>
                <Input id="qr_cost" name="cost" type="number" min="0" step="0.01" placeholder="0.00" />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setPanel('schedule'); setError(null) }}>
                  Back
                </Button>
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? 'Creating…' : 'Create & select'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
