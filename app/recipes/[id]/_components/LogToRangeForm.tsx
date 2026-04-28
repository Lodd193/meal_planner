'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { bulkLogMeals } from '../../actions'

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other']

function todayLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function LogToRangeForm({ recipeId }: { recipeId: string }) {
  const today = todayLocal()
  const [open, setOpen] = useState(false)
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('recipe_id', recipeId)
    startTransition(async () => {
      const result = await bulkLogMeals(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setOpen(false)
        setSuccessMsg(`✓ Logged to ${result.count} day${result.count !== 1 ? 's' : ''}`)
        setTimeout(() => setSuccessMsg(null), 4000)
      }
    })
  }

  const days = dayCount()
  const overLimit = days > 31

  if (successMsg) {
    return <p className="text-sm text-muted-foreground">{successMsg}</p>
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        + Log to multiple days
      </button>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Log to date range</p>
        <button
          onClick={() => { setOpen(false); setError(null) }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="log_start">From</Label>
            <Input
              id="log_start"
              type="date"
              name="start_date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="log_end">To</Label>
            <Input
              id="log_end"
              type="date"
              name="end_date"
              value={endDate}
              min={startDate}
              onChange={e => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="log_servings">Servings</Label>
            <Input
              id="log_servings"
              type="number"
              name="servings"
              min="0.25"
              step="0.25"
              value={servings}
              onChange={e => setServings(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="log_meal_type">Meal type</Label>
            <select
              id="log_meal_type"
              name="meal_type"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              defaultValue="meal"
            >
              {MEAL_TYPES.map(t => (
                <option key={t} value={t.toLowerCase()}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {days > 0 && !overLimit && (
          <p className="text-xs text-muted-foreground">
            This will add{' '}
            <span className="font-semibold text-foreground">{days} {days === 1 ? 'entry' : 'entries'}</span>{' '}
            to your diary
          </p>
        )}
        {overLimit && <p className="text-xs text-red-500">Maximum range is 31 days</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}

        <Button type="submit" disabled={isPending || days === 0 || overLimit} className="w-full">
          {isPending ? 'Logging…' : days > 0 && !overLimit ? `Log to ${days} day${days !== 1 ? 's' : ''}` : 'Select dates'}
        </Button>
      </form>
    </div>
  )
}
