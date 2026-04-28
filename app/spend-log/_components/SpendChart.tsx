'use client'
import { useRouter } from 'next/navigation'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

type MonthData = {
  month: string  // YYYY-MM
  label: string  // e.g. 'May '25'
  total: number
}

type TooltipPayload = {
  payload: MonthData
  value: number
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const { label, total } = { label: payload[0].payload.label, total: payload[0].value }
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-sm">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">£{total.toFixed(2)}</p>
    </div>
  )
}

export default function SpendChart({
  data,
  activeMonth,
}: {
  data: MonthData[]
  activeMonth: string
}) {
  const router = useRouter()

  function handleClick(data: unknown) {
    const state = data as { activePayload?: { payload: MonthData }[] } | null
    const month = state?.activePayload?.[0]?.payload?.month
    if (month) router.push(`/spend-log?month=${month}`)
  }

  return (
    <div className="rounded-lg border p-5">
      <p className="text-sm font-medium mb-1">Rolling 12 months</p>
      <p className="text-xs text-muted-foreground mb-4">Click a bar to view that month</p>
      <ResponsiveContainer width="100%" height={200}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <BarChart data={data} barCategoryGap="28%" onClick={handleClick as any} style={{ cursor: 'pointer' }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `£${v}`}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.month}
                fill={entry.month === activeMonth ? '#2D232E' : '#C4BAA8'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
