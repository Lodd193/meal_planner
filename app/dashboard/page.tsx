import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const now = new Date()
  const today = now.toISOString().slice(0, 10)

  // Week start (Monday)
  const dow = now.getDay()
  const daysFromMon = (dow + 6) % 7
  const weekStartDate = new Date(now)
  weekStartDate.setDate(now.getDate() - daysFromMon)
  const weekStart = weekStartDate.toISOString().slice(0, 10)

  // Month start
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  // Query from the earlier of weekStart / monthStart
  const queryFrom = weekStart < monthStart ? weekStart : monthStart

  // Streak window — 120 days back
  const streakFrom = new Date(now)
  streakFrom.setDate(now.getDate() - 120)
  const streakFromStr = streakFrom.toISOString().slice(0, 10)

  const [{ data: profile }, { data: recentLogs }, { data: recentSpend }, { data: streakLogs }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('meal_logs')
      .select('logged_date, total_cost, kcal, protein_g, carbs_g, fat_g, custom_name, meal_type')
      .eq('user_id', user.id)
      .gte('logged_date', queryFrom)
      .order('logged_date', { ascending: false }),
    supabase
      .from('spend_logs')
      .select('spend_date, amount')
      .eq('user_id', user.id)
      .gte('spend_date', queryFrom),
    supabase
      .from('meal_logs')
      .select('logged_date')
      .eq('user_id', user.id)
      .gte('logged_date', streakFromStr),
  ])

  const todayLogs = (recentLogs ?? []).filter(l => l.logged_date === today)
  const weekLogs = (recentLogs ?? []).filter(l => l.logged_date >= weekStart)
  const monthLogs = (recentLogs ?? []).filter(l => l.logged_date >= monthStart)

  const sum = (arr: typeof weekLogs, key: keyof typeof weekLogs[0]) =>
    arr.reduce((s, l) => s + Number(l[key] ?? 0), 0)

  const spendLogs = recentSpend ?? []
  const weekSpendLogs = spendLogs.filter(l => l.spend_date >= weekStart)
  const monthSpendLogs = spendLogs.filter(l => l.spend_date >= monthStart)

  const weekSpend = sum(weekLogs, 'total_cost') + weekSpendLogs.reduce((s, l) => s + Number(l.amount), 0)
  const monthSpend = sum(monthLogs, 'total_cost') + monthSpendLogs.reduce((s, l) => s + Number(l.amount), 0)
  const todayKcal = sum(todayLogs, 'kcal')
  const todayProtein = sum(todayLogs, 'protein_g')
  const todayCarbs = sum(todayLogs, 'carbs_g')
  const todayFat = sum(todayLogs, 'fat_g')

  const loggedDates = [...new Set((streakLogs ?? []).map(l => l.logged_date))]
  const streak = calcStreak(loggedDates, today)

  const budgetPct = profile?.weekly_budget ? weekSpend / Number(profile.weekly_budget) : 0
  const overBudgetAlert = budgetPct > 0.9 && profile?.weekly_budget

  const displayName = profile?.display_name ?? user.email?.split('@')[0] ?? 'there'

  const macroTargets = [
    { label: 'kcal', val: todayKcal, target: profile?.daily_kcal, fmt: (v: number) => Math.round(v).toString() },
    { label: 'Protein', val: todayProtein, target: profile?.daily_protein, fmt: (v: number) => `${v.toFixed(1)}g` },
    { label: 'Carbs', val: todayCarbs, target: profile?.daily_carbs, fmt: (v: number) => `${v.toFixed(1)}g` },
    { label: 'Fat', val: todayFat, target: profile?.daily_fat, fmt: (v: number) => `${v.toFixed(1)}g` },
  ].filter(m => m.target && m.target > 0)

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Good {getTimeOfDay()}, {displayName}</h1>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <p className="text-muted-foreground text-sm">Here's your food summary.</p>
          {streak > 1 && (
            <span className="text-xs font-medium px-2.5 py-0.5 bg-muted rounded-full text-muted-foreground">
              {streak}-day streak
            </span>
          )}
        </div>
      </div>

      {/* Today nudge */}
      {todayLogs.length === 0 && (
        <Link href={`/planner/${today}`} className="block">
          <div className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors">
            Nothing logged today yet — tap to add your first meal.
          </div>
        </Link>
      )}

      {/* Spend stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="This week" value={`£${weekSpend.toFixed(2)}`}
          sub={profile?.weekly_budget ? `of £${Number(profile.weekly_budget).toFixed(2)} budget` : undefined}
          accent={profile?.weekly_budget ? weekSpend / profile.weekly_budget : undefined}
          href="/spend-log" />
        <StatCard label="This month" value={`£${monthSpend.toFixed(2)}`} href="/spend-log" />
        <StatCard label="Today" value={todayKcal ? `${Math.round(todayKcal)} kcal` : '—'}
          sub={todayLogs.length ? `${todayLogs.length} meal${todayLogs.length !== 1 ? 's' : ''} logged` : 'Nothing logged yet'}
          href={`/planner/${today}`} />
      </div>

      {/* Budget alert */}
      {overBudgetAlert && (
        <div className="rounded-lg border px-4 py-3 text-sm" style={{ borderColor: '#c0392b40', background: '#c0392b08' }}>
          <span className="font-semibold" style={{ color: '#c0392b' }}>Budget alert</span>
          <span className="text-muted-foreground">
            {' '}— {Math.round(budgetPct * 100)}% of your £{Number(profile!.weekly_budget).toFixed(2)} weekly budget used.
            {weekSpend > Number(profile!.weekly_budget) && ' You\'ve exceeded it.'}
          </span>
        </div>
      )}

      {/* Macro progress for today */}
      {macroTargets.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Today vs daily targets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {macroTargets.map(({ label, val, target, fmt }) => {
              const pct = Math.min(Math.round((val / target!) * 100), 100)
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{fmt(val)} / {fmt(target!)} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #474448 0%, #534B52 100%)' }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Quick links */}
      <div className="flex gap-3 flex-wrap">
        <Link href={`/planner/${today}`} className={buttonVariants()}>
          + Log today's meals
        </Link>
        <Link href="/planner" className={buttonVariants({ variant: 'outline' })}>
          Meal diary
        </Link>
        <Link href="/recipes" className={buttonVariants({ variant: 'outline' })}>
          Recipes
        </Link>
      </div>
    </main>
  )
}

function StatCard({ label, value, sub, accent, href }: {
  label: string; value: string; sub?: string; accent?: number; href?: string
}) {
  const inner = (
    <Card className={href ? 'hover:bg-muted/50 transition-colors' : ''}>
      <CardContent className="pt-5">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        {accent != null && (
          <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(accent * 100, 100)}%`,
                background: accent > 0.9
                  ? '#c0392b'
                  : 'linear-gradient(90deg, #474448 0%, #534B52 100%)',
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function calcStreak(loggedDates: string[], today: string): number {
  const dateSet = new Set(loggedDates)
  const cursor = new Date(today + 'T12:00:00')
  if (!dateSet.has(today)) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (dateSet.has(cursor.toISOString().slice(0, 10))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
