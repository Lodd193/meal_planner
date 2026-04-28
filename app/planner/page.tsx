import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CalendarGrid from './_components/CalendarGrid'
import BulkScheduleForm from './_components/BulkScheduleForm'

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const now = new Date()
  let year: number, mon: number

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map(Number)
    year = y; mon = m
  } else {
    year = now.getFullYear(); mon = now.getMonth() + 1
  }

  const firstDay = `${year}-${String(mon).padStart(2, '0')}-01`
  const lastDayDate = new Date(year, mon, 0)
  const lastDay = `${year}-${String(mon).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`

  const [{ data: logs }, { data: recipesRaw }] = await Promise.all([
    supabase
      .from('meal_logs')
      .select('logged_date, total_cost')
      .eq('user_id', user.id)
      .gte('logged_date', firstDay)
      .lte('logged_date', lastDay),
    supabase
      .from('recipe_totals')
      .select('recipe_id, title')
      .eq('user_id', user.id)
      .order('title'),
  ])

  const dayMap: Record<string, { totalCost: number; count: number }> = {}
  for (const log of logs ?? []) {
    const d = log.logged_date
    if (!dayMap[d]) dayMap[d] = { totalCost: 0, count: 0 }
    dayMap[d].totalCost += Number(log.total_cost ?? 0)
    dayMap[d].count++
  }

  const today = now.toISOString().slice(0, 10)
  const recipes = (recipesRaw ?? []).map(r => ({ id: r.recipe_id!, title: r.title! }))

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <BulkScheduleForm recipes={recipes} />
      <CalendarGrid year={year} month={mon} dayMap={dayMap} today={today} />
    </main>
  )
}
