import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import SignOutButton from './SignOutButton'

const navLinks = [
  { href: '/recipes', label: 'Recipes' },
  { href: '/planner', label: 'Planner' },
  { href: '/shopping-list', label: 'Shopping' },
  { href: '/spend-log', label: 'Spend' },
  { href: '/profile', label: 'Profile' },
]

export default async function NavBar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <header
      className="sticky top-0 z-50 shadow-md"
      style={{ background: 'linear-gradient(135deg, #2D232E 0%, #474448 100%)' }}
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="font-bold text-lg tracking-tight transition-colors"
          style={{ color: '#E0DDCF' }}
        >
          Meal Planner
        </Link>
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-full text-sm transition-all duration-200 hover:bg-white/10"
              style={{ color: '#E0DDCF' }}
            >
              {label}
            </Link>
          ))}
          <SignOutButton />
        </nav>
      </div>
    </header>
  )
}
