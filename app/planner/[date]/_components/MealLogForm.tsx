'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { addMealLog } from '../actions'

type Recipe = {
  recipe_id: string | null
  title: string | null
  cost_per_serving: number | null
  kcal_per_serving: number | null
  protein_per_serving_g: number | null
  carbs_per_serving_g: number | null
  fat_per_serving_g: number | null
}

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other']

function defaultMealType(): string {
  const h = new Date().getHours()
  if (h < 11) return 'breakfast'
  if (h < 15) return 'lunch'
  if (h < 21) return 'dinner'
  return 'snack'
}

export default function MealLogForm({ date, recipes }: { date: string; recipes: Recipe[] }) {
  const [mode, setMode] = useState<'recipe' | 'manual'>('recipe')
  const [mealType, setMealType] = useState(defaultMealType)
  const [recipeId, setRecipeId] = useState('')
  const [servings, setServings] = useState(1)
  const [cost, setCost] = useState('')
  const [kcal, setKcal] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [pending, setPending] = useState(false)

  function fillFromRecipe(id: string, s: number) {
    const r = recipes.find(r => r.recipe_id === id)
    if (!r) return
    setCost(r.cost_per_serving != null ? (r.cost_per_serving * s).toFixed(2) : '')
    setKcal(r.kcal_per_serving != null ? String(Math.round(r.kcal_per_serving * s)) : '')
    setProtein(r.protein_per_serving_g != null ? (r.protein_per_serving_g * s).toFixed(1) : '')
    setCarbs(r.carbs_per_serving_g != null ? (r.carbs_per_serving_g * s).toFixed(1) : '')
    setFat(r.fat_per_serving_g != null ? (r.fat_per_serving_g * s).toFixed(1) : '')
  }

  function reset() {
    setRecipeId(''); setServings(1)
    setCost(''); setKcal(''); setProtein(''); setCarbs(''); setFat('')
    setMealType(defaultMealType())
  }

  async function handleSubmit(formData: FormData) {
    setPending(true)
    formData.set('total_cost', cost)
    formData.set('kcal', kcal)
    formData.set('protein_g', protein)
    formData.set('carbs_g', carbs)
    formData.set('fat_g', fat)
    await addMealLog(formData)
    reset()
    setPending(false)
  }

  return (
    <Card>
      <CardContent className="pt-5 space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-full w-fit">
          {(['recipe', 'manual'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); reset() }}
              className={[
                'px-4 py-1.5 rounded-full text-sm transition-all',
                mode === m ? 'text-[#F1F0EA] shadow-sm' : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
              style={mode === m ? { background: 'linear-gradient(135deg, #2D232E 0%, #474448 100%)' } : {}}
            >
              {m === 'recipe' ? 'From recipe' : 'Manual entry'}
            </button>
          ))}
        </div>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="mode" value={mode} />

          <div className="space-y-1.5">
            <Label>Meal type</Label>
            <select
              name="meal_type"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={mealType}
              onChange={e => setMealType(e.target.value)}
            >
              {MEAL_TYPES.map(t => (
                <option key={t} value={t.toLowerCase()}>{t}</option>
              ))}
            </select>
          </div>

          {mode === 'recipe' ? (
            <div className="flex gap-3">
              <div className="space-y-1.5 flex-1">
                <Label>Recipe</Label>
                <select
                  name="recipe_id"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={recipeId}
                  onChange={e => { setRecipeId(e.target.value); fillFromRecipe(e.target.value, servings) }}
                >
                  <option value="">Select a recipe…</option>
                  {recipes.map(r => (
                    <option key={r.recipe_id} value={r.recipe_id ?? ''}>{r.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5 w-24">
                <Label>Servings</Label>
                <Input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={servings}
                  onChange={e => {
                    const s = Number(e.target.value) || 1
                    setServings(s)
                    if (recipeId) fillFromRecipe(recipeId, s)
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Meal name</Label>
              <Input name="custom_name" placeholder="e.g. Chicken sandwich" required />
            </div>
          )}

          {/* Cost + macros grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Cost (£)</Label>
              <Input type="number" step="0.01" min="0" placeholder="0.00"
                value={cost} onChange={e => setCost(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>kcal</Label>
              <Input type="number" min="0" placeholder="0"
                value={kcal} onChange={e => setKcal(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Protein (g)</Label>
              <Input type="number" step="0.1" min="0" placeholder="0"
                value={protein} onChange={e => setProtein(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Carbs (g)</Label>
              <Input type="number" step="0.1" min="0" placeholder="0"
                value={carbs} onChange={e => setCarbs(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Fat (g)</Label>
              <Input type="number" step="0.1" min="0" placeholder="0"
                value={fat} onChange={e => setFat(e.target.value)} />
            </div>
          </div>

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? 'Logging…' : 'Log meal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
