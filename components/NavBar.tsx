import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function NavBar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <header
      className="sticky top-0 z-50 shadow-md"
      style={{ background: 'linear-gradient(135deg, #2D232E 0%, #474448 100%)' }}
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center">
        <Link
          href="/dashboard"
          className="font-bold text-lg tracking-tight"
          style={{ color: '#E0DDCF' }}
        >
          Meal Planner
        </Link>
      </div>
    </header>
  )
}
