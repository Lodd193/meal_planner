import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import MealLogForm from './_components/MealLogForm'
import MealLogList from './_components/MealLogList'
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

      <MealLogList logs={logs} date={date} />

      <div>
        <h2 className="font-medium mb-3">Log a meal</h2>
        <MealLogForm date={date} recipes={recipes ?? []} />
      </div>
    </main>
  )
}
