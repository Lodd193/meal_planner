'use client'

import { useState } from 'react'

const R = 44
const STROKE = 10
const C = 2 * Math.PI * R
const GAP = 4

const SEGMENTS = [
  { key: 'protein', label: 'Protein', color: '#474448' },
  { key: 'carbs',   label: 'Carbs',   color: '#B5834A' },
  { key: 'fat',     label: 'Fat',     color: '#6B9580' },
] as const

type Key = typeof SEGMENTS[number]['key']

type Props = {
  protein: number
  carbs: number
  fat: number
  kcal: number
}

export default function MacroDonut({ protein, carbs, fat, kcal }: Props) {
  const [hovered, setHovered] = useState<Key | null>(null)
  const values = { protein, carbs, fat }
  const total = protein + carbs + fat

  if (total === 0) return null

  let cumFrac = 0
  const arcs = SEGMENTS.map(seg => {
    const frac = values[seg.key] / total
    const segLen = Math.max(frac * C - GAP, 0)
    const dashOffset = -(cumFrac * C)
    cumFrac += frac
    return { ...seg, value: values[seg.key], frac, segLen, dashOffset }
  })

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
      {/* Donut */}
      <div className="relative shrink-0">
        <svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label="Macro split donut chart">
          <circle cx="60" cy="60" r={R} fill="none" stroke="var(--border)" strokeWidth={STROKE} />
          {arcs.map(arc => (
            <circle
              key={arc.key}
              cx="60" cy="60" r={R}
              fill="none"
              stroke={arc.color}
              strokeWidth={hovered === arc.key ? STROKE + 3 : STROKE}
              strokeDasharray={`${arc.segLen} ${C}`}
              strokeDashoffset={arc.dashOffset}
              strokeLinecap="butt"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-width 0.15s ease' }}
              onMouseEnter={() => setHovered(arc.key)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold leading-none tabular-nums">{Math.round(kcal)}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">kcal</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col justify-center gap-3 min-w-0">
        {arcs.map(arc => {
          const pct = Math.round(arc.frac * 100)
          const active = hovered === arc.key
          return (
            <div
              key={arc.key}
              className="flex items-center gap-2.5 cursor-default select-none"
              onMouseEnter={() => setHovered(arc.key)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 transition-transform duration-150"
                style={{ background: arc.color, transform: active ? 'scale(1.3)' : 'scale(1)' }}
              />
              <div className="text-sm leading-tight">
                <span className={`font-semibold tabular-nums ${active ? '' : ''}`}>
                  {arc.value.toFixed(1)}g
                </span>
                <span className="text-muted-foreground ml-1.5">{arc.label}</span>
                <span className="text-muted-foreground/60 ml-1 text-xs">({pct}%)</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
