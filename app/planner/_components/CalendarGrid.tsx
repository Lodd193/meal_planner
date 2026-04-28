'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

type DayData = { totalCost: number; count: number }

interface Props {
  year: number
  month: number
  dayMap: Record<string, DayData>
  today: string
}

export default function CalendarGrid({ year, month, dayMap, today }: Props) {
  const router = useRouter()

  function navigate(delta: number) {
    let m = month + delta
    let y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1) { m = 12; y-- }
    router.push(`/planner?month=${y}-${String(m).padStart(2, '0')}`)
  }

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDow = new Date(year, month - 1, 1).getDay()
  const offset = (firstDow + 6) % 7

  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  // Monthly spend total
  const monthTotal = Object.values(dayMap).reduce((s, d) => s + d.totalCost, 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground text-sm">
          ← Prev
        </button>
        <div className="text-center">
          <h2 className="font-semibold text-xl">{MONTHS[month - 1]} {year}</h2>
          {monthTotal > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              £{monthTotal.toFixed(2)} logged this month
            </p>
          )}
        </div>
        <button onClick={() => navigate(1)}
          className="px-4 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground text-sm">
          Next →
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const data = dayMap[dateStr]
          const isToday = dateStr === today
          const isFuture = dateStr > today

          if (isFuture) {
            return (
              <div
                key={dateStr}
                className="min-h-[72px] rounded-xl p-2 border border-[#E0DDCF] opacity-30"
              >
                <span className="text-sm">{day}</span>
              </div>
            )
          }

          return (
            <Link
              key={dateStr}
              href={`/planner/${dateStr}`}
              className={[
                'min-h-[72px] rounded-xl p-2.5 flex flex-col border transition-all duration-150',
                'hover:scale-[1.03] hover:shadow-md',
                isToday
                  ? 'text-[#F1F0EA] border-transparent'
                  : data
                    ? 'bg-[#ECEAE3] border-[#C9C6BC] hover:bg-[#E0DDCF]'
                    : 'bg-background border-[#E0DDCF] hover:bg-muted',
              ].join(' ')}
              style={isToday ? { background: 'linear-gradient(135deg, #2D232E 0%, #474448 100%)' } : {}}
            >
              <span className={['text-sm font-semibold', isToday ? 'text-[#E0DDCF]' : ''].join(' ')}>
                {day}
              </span>
              {data && (
                <div className="mt-auto space-y-0.5">
                  <p className={['text-xs font-medium', isToday ? 'text-[#F1F0EA]' : ''].join(' ')}>
                    £{data.totalCost.toFixed(2)}
                  </p>
                  <p className={['text-xs', isToday ? 'text-[#E0DDCF]/70' : 'text-muted-foreground'].join(' ')}>
                    {data.count} meal{data.count !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {/* Today quick link */}
      <div className="text-center pt-2">
        <Link
          href={`/planner/${today}`}
          className="text-sm font-medium hover:underline"
          style={{ color: '#474448' }}
        >
          + Log today's meals
        </Link>
      </div>
    </div>
  )
}
