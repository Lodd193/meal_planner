import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import MealLogForm from './_components/MealLogForm'
import { deleteMealLog } from './actions'
import type { Tables } from '@/types/supabase'

type MealLogRow = Tables<'meal_logs'> & { recipes?: { title: string } | null }

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [{ data: rawLogs }, { data: recipes }] = await Promise.all([
    supabase
      .from('meal_logs')
      .select('*, recipes(title)')
      .eq('user_id', user.id)
      .eq('logged_date', date)
      .order('created_at'),
    supabase
      .from('recipe_totals')
      .select('recipe_id, title, cost_per_serving, kcal_per_serving, protein_per_serving_g, carbs_per_serving_g, fat_per_serving_g')
      .eq('user_id', user.id)
      .order('title'),
  ])

  const logs = (rawLogs ?? []) as MealLogRow[]

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

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <main className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/planner" className="text-sm text-muted-foreground hover:text-foreground">
          ← Meal Diary
        </Link>
        <h1 className="text-2xl font-semibold mt-2">{displayDate}</h1>
      </div>

      {logs.length > 0 && (
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
      )}

      {logs.length > 0 ? (
        <div className="space-y-2">
          <h2 className="font-medium">Meals logged</h2>
          {logs.map(log => {
            const name = log.recipes?.title ?? log.custom_name ?? 'Meal'
            return (
              <Card key={log.id}>
                <CardContent className="pt-4 flex items-start justify-between gap-2">
                  <div className="space-y-0.5 text-sm min-w-0">
                    {log.recipe_id ? (
                      <Link href={`/recipes/${log.recipe_id}`} className="font-medium hover:underline">{name}</Link>
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
                  <form action={async () => {
                    'use server'
                    await deleteMealLog(log.id, date)
                  }}>
                    <Button variant="ghost" size="sm" type="submit"
                      className="text-muted-foreground hover:text-destructive shrink-0">
                      ✕
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No meals logged for this day yet.</p>
      )}

      <div>
        <h2 className="font-medium mb-3">Log a meal</h2>
        <MealLogForm date={date} recipes={recipes ?? []} />
      </div>
    </main>
  )
}
