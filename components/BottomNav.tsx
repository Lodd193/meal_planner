'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const today = () => new Date().toISOString().slice(0, 10)

const tabs = [
  {
    href: '/recipes',
    label: 'Recipes',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M9 7h6M9 11h4" />
      </svg>
    ),
  },
  {
    href: '/planner',
    label: 'Planner',
    todayHref: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    href: '/shopping-list',
    label: 'Shop',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    href: '/spend-log',
    label: 'Spend',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        background: 'linear-gradient(180deg, #2D232E 0%, #1e181f 100%)',
        borderColor: 'rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-stretch h-16">
        {tabs.map(({ href, label, icon, todayHref }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          const dest = todayHref ? `/planner/${today()}` : href
          return (
            <Link
              key={href}
              href={dest}
              className="flex-1 flex flex-col items-center justify-center gap-1.5 transition-opacity"
              style={{ color: active ? '#E0DDCF' : 'rgba(224,221,207,0.4)' }}
            >
              <span>{icon}</span>
              <span className={`text-[10px] leading-none tracking-wide ${active ? 'font-semibold' : 'font-normal'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
