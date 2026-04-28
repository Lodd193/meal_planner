import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import SpendLogList from './_components/SpendLogList'
import SpendChart from './_components/SpendChart'

function toYearMon(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function buildMonthRange(startDate: Date): { month: string; label: string }[] {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1)
    return {
      month: toYearMon(d),
      label: d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
    }
  })
}

export default async function SpendLogPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month: monthParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const now = new Date()
  const month =
    monthParam && /^\d{4}-\d{2}$/.test(monthParam)
      ? monthParam
      : toYearMon(now)

  const [year, mon] = month.split('-').map(Number)
  const monthStart = `${month}-01`
  const nextMon = mon === 12 ? `${year + 1}-01` : `${year}-${String(mon + 1).padStart(2, '0')}`
  const prevMon = mon === 1 ? `${year - 1}-12` : `${year}-${String(mon - 1).padStart(2, '0')}`
  const monthEnd = `${nextMon}-01`

  const monthLabel = new Date(year, mon - 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

  // Rolling 12 months: 11 months before today's month through today's month
  const chartStartDate = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  const chartStart = `${toYearMon(chartStartDate)}-01`
  const chartEnd = `${toYearMon(new Date(now.getFullYear(), now.getMonth() + 1, 1))}-01`

  const [{ data: logs }, { data: chartLogs }] = await Promise.all([
    supabase
      .from('spend_logs')
      .select('id, spend_date, amount, description, category')
      .eq('user_id', user.id)
      .gte('spend_date', monthStart)
      .lt('spend_date', monthEnd)
      .order('spend_date', { ascending: false }),
    supabase
      .from('spend_logs')
      .select('spend_date, amount')
      .eq('user_id', user.id)
      .gte('spend_date', chartStart)
      .lt('spend_date', chartEnd),
  ])

  const entries = logs ?? []
  const total = entries.reduce((s, l) => s + Number(l.amount), 0)
  const today = now.toISOString().slice(0, 10)

  // Aggregate chart data by month
  const spendByMonth = new Map<string, number>()
  for (const row of chartLogs ?? []) {
    const m = row.spend_date.slice(0, 7)  // YYYY-MM
    spendByMonth.set(m, (spendByMonth.get(m) ?? 0) + Number(row.amount))
  }
  const chartData = buildMonthRange(chartStartDate).map(({ month: m, label }) => ({
    month: m,
    label,
    total: spendByMonth.get(m) ?? 0,
  }))

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Spend Log</h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/spend-log?month=${prevMon}`}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            ‹
          </Link>
          <span className="text-sm font-medium w-36 text-center">{monthLabel}</span>
          <Link
            href={`/spend-log?month=${nextMon}`}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            ›
          </Link>
        </div>
      </div>

      <SpendChart data={chartData} activeMonth={month} />

      <div className="rounded-lg border p-4 flex justify-between items-center">
        <span className="text-muted-foreground text-sm">Total for {monthLabel}</span>
        <span className="text-2xl font-bold">£{total.toFixed(2)}</span>
      </div>

      <SpendLogList logs={entries} defaultDate={today} />
    </main>
  )
}
