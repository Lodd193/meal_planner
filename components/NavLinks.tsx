'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/recipes', label: 'Recipes' },
  { href: '/planner', label: 'Planner' },
  { href: '/shopping-list', label: 'Shopping' },
  { href: '/spend-log', label: 'Spend' },
  { href: '/profile', label: 'Profile' },
]

export default function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {navLinks.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
              active ? 'bg-white/20 font-medium' : 'hover:bg-white/10'
            }`}
            style={{ color: '#E0DDCF' }}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
