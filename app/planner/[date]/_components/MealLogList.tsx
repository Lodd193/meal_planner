'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { deleteMealLog } from '../actions'

type MealLog = {
  id: string
  recipe_id: string | null
  meal_type: string
  total_cost: number | null
  kcal: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  recipes?: { title: string } | null
  custom_name?: string | null
}

export default function MealLogList({ logs: initial, date }: { logs: MealLog[]; date: string }) {
  const [logs, setLogs] = useState(initial)

  function handleDelete(id: string) {
    setLogs(prev => prev.filter(l => l.id !== id))
    deleteMealLog(id, date)
  }

  const totals = logs.reduce(
    (acc, l) => ({
      cost: acc.cost + Number(l.total_cost ?? 0),
      kcal: acc.kcal + Number(l.kcal ?? 0),
      protein: acc.protein + Number(l.protein_g ?? 0),
      carbs: acc.carbs + Number(l.carbs_g ?? 0),
      fat: acc.fat + Number(l.fat_g ?? 0),
    }),
    { cost: 0, kcal: 0, protein: 0, carbs: 0, fat: 0 }
  )

  if (!logs.length) {
    return <p className="text-muted-foreground text-sm">No meals logged for this day yet.</p>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Day totals</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-5 gap-4 text-sm">
          {[
            { label: 'Spent', value: `£${totals.cost.toFixed(2)}` },
            { label: 'kcal', value: totals.kcal ? Math.round(totals.kcal) : '—' },
            { label: 'Protein', value: totals.protein ? `${totals.protein.toFixed(1)}g` : '—' },
            { label: 'Carbs', value: totals.carbs ? `${totals.carbs.toFixed(1)}g` : '—' },
            { label: 'Fat', value: totals.fat ? `${totals.fat.toFixed(1)}g` : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-muted-foreground">{label}</p>
              <p className="font-medium">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="font-medium">Meals logged</h2>
        {logs.map(log => {
          const name = log.recipes?.title ?? log.custom_name ?? 'Meal'
          return (
            <Card key={log.id}>
              <CardContent className="pt-4 flex items-start justify-between gap-2">
                <div className="space-y-0.5 text-sm min-w-0">
                  {log.recipe_id ? (
                    <Link href={`/recipes/${log.recipe_id}`} className="font-medium hover:underline">
                      {name}
                    </Link>
                  ) : (
                    <p className="font-medium">{name}</p>
                  )}
                  <p className="text-xs text-muted-foreground capitalize">{log.meal_type}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                    {log.total_cost != null && <span>£{Number(log.total_cost).toFixed(2)}</span>}
                    {log.kcal != null && <span>{Math.round(Number(log.kcal))} kcal</span>}
                    {log.protein_g != null && <span>{Number(log.protein_g).toFixed(1)}g protein</span>}
                    {log.carbs_g != null && <span>{Number(log.carbs_g).toFixed(1)}g carbs</span>}
                    {log.fat_g != null && <span>{Number(log.fat_g).toFixed(1)}g fat</span>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(log.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  ✕
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
